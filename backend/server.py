from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv

load_dotenv()

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import ipaddress
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
import httpx
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
SITE_URL = os.environ.get("SITE_URL", "")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client_http:
            resp = await client_http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def _newsletter_html() -> str:
    brand = escape(EMAIL_FROM_NAME)
    site = escape(SITE_URL)
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">'
        '<tr><td align="center">'
        '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border:1px solid #1f1f1f;border-radius:16px;overflow:hidden">'
        '<tr><td style="padding:40px;font-family:Arial,sans-serif;color:#ffffff">'
        '<p style="font-size:11px;letter-spacing:4px;color:#FF5500;font-weight:bold;margin:0 0 16px">ORYNTICLABS</p>'
        '<h1 style="font-size:28px;margin:0 0 14px;font-weight:800">You are on the list.</h1>'
        '<p style="color:#a3a3a3;line-height:1.7;margin:0 0 28px;font-size:15px">Thanks for subscribing to '
        f'{brand} updates. Expect sharp thinking on AI systems, product engineering, and the platforms we are '
        'building, delivered occasionally. No noise, no spam.</p>'
        f'<a href="{site}" style="display:inline-block;background:#FF5500;color:#ffffff;text-decoration:none;'
        'padding:13px 28px;border-radius:999px;font-weight:bold;font-size:14px">Explore OrynticLabs</a>'
        f'<p style="font-size:12px;color:#666666;margin:32px 0 0">Sent by {brand} Private Limited. '
        'We never ask for passwords or payment details by email.</p>'
        '</td></tr></table></td></tr></table>'
    )


# ---------- Footer settings ----------

DEFAULT_FOOTER = {
    "company": {
        "email": "hello@orynticlabs.com",
        "phone": "+91 79017 17617",
        "address1": "Registered Office — India (update via admin)",
        "address2": "Corporate Office — India (update via admin)",
        "cin": "Available on request",
        "gst": "Available on request",
    },
    "newsletter": {
        "title": "Stay in the Loop",
        "text": "Get OrynticLabs updates, technology insights, product announcements, and company news — delivered occasionally. No noise, no spam.",
    },
    "socials": {"linkedin": "", "instagram": "", "facebook": "", "x": "", "youtube": ""},
    "columns": [
        {"title": "Company", "links": [
            {"label": "About OrynticLabs", "url": "/about"},
            {"label": "Our Story", "url": "/about"},
            {"label": "Careers", "url": "/contact"},
            {"label": "Contact", "url": "/contact"},
            {"label": "Partnerships", "url": "/contact"},
        ]},
        {"title": "Services", "links": [
            {"label": "Web Development", "url": "/services"},
            {"label": "Software Development", "url": "/services"},
            {"label": "Mobile Development", "url": "/services"},
            {"label": "AI & Machine Learning", "url": "/services"},
            {"label": "UI/UX Design", "url": "/services"},
            {"label": "E-commerce Development", "url": "/services"},
            {"label": "Cloud & DevOps", "url": "/services"},
            {"label": "Technology Consulting", "url": "/services"},
        ]},
        {"title": "Expertise", "links": [
            {"label": "SaaS & PaaS", "url": "/about"},
            {"label": "Product Engineering", "url": "/services"},
            {"label": "AI & Automation", "url": "/services"},
            {"label": "Data & Analytics", "url": "/services"},
            {"label": "Enterprise Solutions", "url": "/industries"},
            {"label": "Digital Transformation", "url": "/services"},
        ]},
        {"title": "Technologies", "links": [
            {"label": "React / Next.js", "url": "/stack"},
            {"label": "Node.js", "url": "/stack"},
            {"label": "Python", "url": "/stack"},
            {"label": "Java / Go", "url": "/stack"},
            {"label": "Shopify", "url": "/stack"},
            {"label": "WordPress", "url": "/stack"},
            {"label": "Payload CMS", "url": "/stack"},
            {"label": "OryCMS", "url": "/products"},
            {"label": "Cloud & DevOps", "url": "/stack"},
        ]},
    ],
    "badges": ["Incorporated in India", "Companies Act, 2013"],
    "legal_links": [
        {"label": "Sitemap", "url": "/sitemap"},
        {"label": "Privacy Policy", "url": "/privacy-policy"},
        {"label": "Terms & Conditions", "url": "/terms-conditions"},
        {"label": "Terms of Service", "url": "/terms-of-service"},
    ],
    "copyright": "© 2026 OrynticLabs Private Limited. All rights reserved.",
}

FOOTER_REQUIRED_KEYS = {"company", "newsletter", "socials", "columns", "badges", "legal_links", "copyright"}


# ---------- Admin auth ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_admin_token(email: str) -> str:
    payload = {"sub": email, "type": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token type")
        admin = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


@api_router.post("/admin/login")
async def admin_login(input: AdminLogin, request: Request):
    email = input.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        last = attempts.get("last_attempt")
        if last and datetime.now(timezone.utc) - datetime.fromisoformat(last) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(input.password, admin["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    return {"token": create_admin_token(email), "email": email}


@api_router.get("/admin/footer")
async def get_footer_admin(request: Request):
    await get_current_admin(request)
    doc = await db.footer_settings.find_one({"key": "main"}, {"_id": 0, "key": 0})
    return doc or DEFAULT_FOOTER


@api_router.put("/admin/footer")
async def update_footer(request: Request):
    await get_current_admin(request)
    body = await request.json()
    if not isinstance(body, dict) or not FOOTER_REQUIRED_KEYS.issubset(body.keys()):
        raise HTTPException(status_code=400, detail="Invalid footer settings payload")
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.footer_settings.update_one({"key": "main"}, {"$set": body}, upsert=True)
    body.pop("updated_at", None)
    return {"status": "success", "footer": body}


# ---------- Public routes ----------

class NewsletterSubscribe(BaseModel):
    email: EmailStr


@api_router.get("/")
async def root():
    return {"message": "OrynticLabs API"}


@api_router.get("/footer")
async def get_footer():
    doc = await db.footer_settings.find_one({"key": "main"}, {"_id": 0, "key": 0})
    return doc or DEFAULT_FOOTER


@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(input: NewsletterSubscribe):
    email = input.email.lower().strip()
    existing = await db.newsletter_subscribers.find_one({"email": email}, {"_id": 0})
    if not existing:
        await db.newsletter_subscribers.insert_one(
            {"email": email, "subscribed_at": datetime.now(timezone.utc).isoformat()}
        )
    subject = f"Welcome to {EMAIL_FROM_NAME}"
    email_id = await send_email(to=email, subject=subject, html=_newsletter_html())
    return {"status": "success", "message": "Subscribed", "email_id": email_id}


@app.on_event("startup")
async def startup():
    await db.admins.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    existing = await db.admins.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.admins.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.admins.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
    footer = await db.footer_settings.find_one({"key": "main"})
    if footer is None:
        await db.footer_settings.insert_one({"key": "main", **DEFAULT_FOOTER})
        logger.info("Footer settings seeded")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
