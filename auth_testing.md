# Auth Testing Playbook (Oryntic Labs admin)

## Step 1: MongoDB verification
- `db.admins.find({role: "admin"})` - admin exists, password_hash starts with `$2b$`
- Indexes: admins.email (unique), login_attempts.identifier

## Step 2: API testing
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -X POST "$API/api/admin/login" -H "Content-Type: application/json" -d '{"email":"admin@orynticlabs.com","password":"Oryntic@2026"}'
TOKEN=... # from response
curl "$API/api/admin/footer" -H "Authorization: Bearer $TOKEN"
curl -X PUT "$API/api/admin/footer" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d @footer.json
curl "$API/api/footer"  # public, reflects saved changes
```

## Step 3: Negative tests
- Wrong password → 401, increments login_attempts
- 5 wrong attempts → 429 for 15 minutes
- PUT without token → 401
