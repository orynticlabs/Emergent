import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, LogOut, Save } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const linksToText = (links = []) => links.map((l) => `${l.label}|${l.url}`).join("\n");
const textToLinks = (text) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, url] = line.split("|").map((s) => (s || "").trim());
    return { label, url: url || "/" };
  });
const listToText = (arr = []) => arr.join("\n");
const textToList = (text) => text.split("\n").map((s) => s.trim()).filter(Boolean);

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-brand-orange";
const areaCls = `${inputCls} min-h-[140px] resize-y font-mono text-xs leading-relaxed`;

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
    {children}
  </label>
);

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
    <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
    <div className="mt-6 grid gap-5">{children}</div>
  </section>
);

export default function AdminFooter() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("ory_admin_token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    axios.get(`${API}/admin/footer`, auth)
      .then((r) => setSettings(r.data))
      .catch(() => {
        toast.error("Session expired. Please sign in again.");
        localStorage.removeItem("ory_admin_token");
        navigate("/admin/login");
      });
  }, []);

  const set = (path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/footer`, settings, auth);
      toast.success("Footer updated. Changes are live on the site.");
    } catch {
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("ory_admin_token");
    navigate("/admin/login");
  };

  if (!settings) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-ink text-white">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
      </main>
    );
  }

  const socialKeys = ["linkedin", "instagram", "facebook", "x", "youtube"];

  return (
    <main data-testid="admin-footer-page" className="min-h-screen bg-brand-ink pb-24 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
              ORYNTIC<span className="text-brand-orange">LABS</span>
            </Link>
            <span className="rounded-full border border-brand-orange/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">Footer Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={save}
              disabled={saving}
              data-testid="admin-save-button"
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </motion.button>
            <button onClick={logout} data-testid="admin-logout-button" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/60 transition-colors duration-300 hover:text-white">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-5xl space-y-8 px-6">
        <Section title="Company Information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Official Email"><input value={settings.company.email} onChange={(e) => set("company.email", e.target.value)} data-testid="admin-input-email" className={inputCls} /></Field>
            <Field label="Contact Number"><input value={settings.company.phone} onChange={(e) => set("company.phone", e.target.value)} data-testid="admin-input-phone" className={inputCls} /></Field>
            <Field label="Office Address 1"><input value={settings.company.address1} onChange={(e) => set("company.address1", e.target.value)} data-testid="admin-input-address1" className={inputCls} /></Field>
            <Field label="Office Address 2"><input value={settings.company.address2} onChange={(e) => set("company.address2", e.target.value)} data-testid="admin-input-address2" className={inputCls} /></Field>
            <Field label="CIN Number"><input value={settings.company.cin} onChange={(e) => set("company.cin", e.target.value)} data-testid="admin-input-cin" className={inputCls} /></Field>
            <Field label="GST Number"><input value={settings.company.gst} onChange={(e) => set("company.gst", e.target.value)} data-testid="admin-input-gst" className={inputCls} /></Field>
          </div>
        </Section>

        <Section title="Newsletter">
          <Field label="Heading"><input value={settings.newsletter.title} onChange={(e) => set("newsletter.title", e.target.value)} data-testid="admin-input-newsletter-title" className={inputCls} /></Field>
          <Field label="Supporting Text"><textarea value={settings.newsletter.text} onChange={(e) => set("newsletter.text", e.target.value)} data-testid="admin-input-newsletter-text" className={`${inputCls} min-h-[80px] resize-y`} /></Field>
        </Section>

        <Section title="Social Media Links">
          <p className="-mt-2 text-xs text-white/40">Leave blank to hide a platform from the footer.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {socialKeys.map((key) => (
              <Field key={key} label={key.toUpperCase()}>
                <input value={settings.socials[key] || ""} onChange={(e) => set(`socials.${key}`, e.target.value)} placeholder="https://..." data-testid={`admin-input-social-${key}`} className={inputCls} />
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Navigation Columns">
          <p className="-mt-2 text-xs text-white/40">One link per line, formatted as: Label|URL (e.g. About OrynticLabs|/about)</p>
          {settings.columns.map((col, i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-5">
              <Field label={`Column ${i + 1} Title`}>
                <input value={col.title} onChange={(e) => set(`columns.${i}.title`, e.target.value)} data-testid={`admin-input-column-${i}-title`} className={inputCls} />
              </Field>
              <div className="mt-4">
                <Field label="Links">
                  <textarea
                    value={linksToText(col.links)}
                    onChange={(e) => set(`columns.${i}.links`, textToLinks(e.target.value))}
                    data-testid={`admin-input-column-${i}-links`}
                    className={areaCls}
                  />
                </Field>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Certificates & Badges">
          <Field label="Certificates (Label|Image path per line — first one shows large under the newsletter, the rest appear in the bottom bar)">
            <textarea
              value={linksToText((settings.certificates || []).map((c) => ({ label: c.label, url: c.image })))}
              onChange={(e) => set("certificates", textToLinks(e.target.value).map((l) => ({ label: l.label, image: l.url })))}
              data-testid="admin-input-certificates"
              className={areaCls}
            />
          </Field>
          <Field label="Badges / Certifications (one per line)">
            <textarea value={listToText(settings.badges)} onChange={(e) => set("badges", textToList(e.target.value))} data-testid="admin-input-badges" className={areaCls} />
          </Field>
        </Section>

        <Section title="Legal & Copyright">
          <Field label="Legal Links (Label|URL per line)">
            <textarea value={linksToText(settings.legal_links)} onChange={(e) => set("legal_links", textToLinks(e.target.value))} data-testid="admin-input-legal-links" className={areaCls} />
          </Field>
          <Field label="Copyright Text">
            <input value={settings.copyright} onChange={(e) => set("copyright", e.target.value)} data-testid="admin-input-copyright" className={inputCls} />
          </Field>
        </Section>
      </div>
    </main>
  );
}
