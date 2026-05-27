# Villa photos with DigitalOcean Spaces

RentVilla uploads villa images **from the browser** to Spaces using a short-lived signed URL from your API. Images are stored permanently and work on Netlify, localhost, and any host.

## 1. Create a Space

1. Log in at [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Left menu → **Spaces Object Storage**
3. Click **Create Space**
4. Choose a region close to users (e.g. **Frankfurt `fra1`** or **Amsterdam `ams3`**)
5. Space name: `rentvilla-uploads` (lowercase, unique globally)
6. **Enable CDN** (recommended) — you get a URL like `https://rentvilla-uploads.fra1.cdn.digitaloceanspaces.com`
7. File listing: **Restrict** (fine) — files are still public if uploaded with `public-read` ACL
8. Create the Space

Write down:
- **Region** → e.g. `fra1`
- **Space name** → e.g. `rentvilla-uploads`
- **CDN endpoint** (if enabled) → e.g. `https://rentvilla-uploads.fra1.cdn.digitaloceanspaces.com`

Without CDN, public base URL is:
`https://rentvilla-uploads.fra1.digitaloceanspaces.com`

## 2. Create API keys

1. **API** → **Spaces Keys** → **Generate New Key**
2. Name: `rentvilla-uploads`
3. Copy **Access Key** and **Secret Key** (secret shown once)

## 3. CORS (required for browser upload)

1. Open your Space → **Settings** → **CORS Configurations**
2. Add a rule:

| Field | Value |
|-------|--------|
| Origin | `https://YOUR-NETLIFY-SITE.netlify.app` |
| Origin (dev) | `http://localhost:3000` |
| Allowed methods | `GET`, `PUT`, `HEAD` |
| Allowed headers | `*` |
| Max age | `3000` |

Add both production and localhost origins (two rules or comma-separated origins if the UI allows).

## 4. Environment variables

### Netlify (Site configuration → Environment variables)

Replace `fra1` and bucket name with yours.

| Variable | Example |
|----------|---------|
| `S3_ENDPOINT` | `https://fra1.digitaloceanspaces.com` |
| `S3_REGION` | `fra1` |
| `S3_BUCKET` | `rentvilla-uploads` |
| `S3_ACCESS_KEY_ID` | your Spaces access key |
| `S3_SECRET_ACCESS_KEY` | your Spaces secret key |
| `S3_PUBLIC_BASE_URL` | `https://rentvilla-uploads.fra1.cdn.digitaloceanspaces.com` |
| `NEXT_PUBLIC_S3_UPLOAD_MODE` | `signed` |
| `NEXT_PUBLIC_S3_PUBLIC_BASE_URL` | same as `S3_PUBLIC_BASE_URL` |

### Local `.env` (same values)

```env
S3_ENDPOINT="https://fra1.digitaloceanspaces.com"
S3_REGION="fra1"
S3_BUCKET="rentvilla-uploads"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_PUBLIC_BASE_URL="https://rentvilla-uploads.fra1.cdn.digitaloceanspaces.com"
NEXT_PUBLIC_S3_UPLOAD_MODE="signed"
NEXT_PUBLIC_S3_PUBLIC_BASE_URL="https://rentvilla-uploads.fra1.cdn.digitaloceanspaces.com"
```

## 5. Deploy

1. Commit and push code (signed upload API must be deployed)
2. **Redeploy Netlify** after adding env vars (`NEXT_PUBLIC_*` are baked in at build time)
3. Restart local dev: `npm run dev`

## 6. Test

1. Log in on production
2. **Add villa** with a photo
3. After publish, open the villa — image URL should start with your `S3_PUBLIC_BASE_URL`
4. If upload fails, check browser **Network** tab:
   - `POST /api/uploads/sign` → 200
   - `PUT` to `*.digitaloceanspaces.com` → 200

## Troubleshooting

### “Object storage is not configured”
Missing one of the `S3_*` variables on Netlify. Redeploy after fixing.

### PUT upload fails (CORS error)
Add your exact site URL to Space CORS (including `https://`).

### Villa saves but image broken
- `S3_PUBLIC_BASE_URL` must match CDN/origin URL
- Re-upload villa after fixing env vars
- Old `/uploads/villas/...` paths only work on the machine that created them

### Sign works, PUT returns 403
- Keys must be Spaces keys (not general DO API token)
- Bucket name and region must match the Space
