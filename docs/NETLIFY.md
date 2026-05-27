# Deploy RentVilla on Netlify

Netlify runs your app on **serverless** servers. A local SQLite file (`dev.db`) cannot be used there. You need a **hosted PostgreSQL** database (we recommend [Neon](https://neon.tech) — free tier).

## 1. Create a database (Neon)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g. `rentvilla`)
3. Copy the **connection string** (starts with `postgresql://`)
4. Use the **pooled** connection string for serverless (often port `5432` with `-pooler` in host)

## 2. Set environment variables on Netlify

In **Netlify** → your site → **Site configuration** → **Environment variables**, add:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Neon `postgresql://...` connection string |
| `SESSION_SECRET` | Long random string (e.g. 32+ characters) |

Apply to **Production** (and **Deploy previews** if you use them).

## 3. Deploy

Push to `main` or trigger a new deploy. The build runs:

```bash
prisma generate && prisma db push && next build
```

This creates tables in your Neon database on each deploy (schema sync).

## 4. Seed admin user (once)

On your computer, with the **same** `DATABASE_URL` as production:

```bash
cd /path/to/RentVilla
# Put production DATABASE_URL in .env temporarily, or:
export DATABASE_URL="postgresql://..."
export SESSION_SECRET="your-production-secret"

npm run db:setup
```

This creates:

- Admin: `ilhadmammadli@gmail.com` / `Im19951411`
- Demo data (cities, sample villas)

## 5. Local development after this change

Update your local `.env`:

```env
DATABASE_URL="postgresql://..."   # Neon or local Postgres
SESSION_SECRET="dev-secret"
```

Then:

```bash
npm run db:setup
npm run dev
```

## Troubleshooting

### `Environment variable not found: DATABASE_URL`

→ Add `DATABASE_URL` in Netlify **Environment variables** and redeploy.

### Build succeeds but site shows database errors

→ Run `npm run db:setup` against production `DATABASE_URL` (tables or seed missing).

### Villas missing after switching to PostgreSQL

Your old villas were in **SQLite** (`prisma/dev.db`). The live site uses **Neon**. Migrate once:

```bash
npm run db:migrate-from-sqlite
```

### Image uploads on Netlify (required for new villas)

Netlify cannot save files to disk. Set up free [Cloudinary](https://cloudinary.com):

1. Create account → **Settings** → **Upload** → add **Upload preset**
2. Set **Signing mode** to **Unsigned**
3. Add to Netlify environment variables (same values for server + browser):

| Variable | Example |
|----------|---------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_UPLOAD_PRESET` | `rentvilla_unsigned` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `rentvilla_unsigned` |

4. Redeploy Netlify (required after adding `NEXT_PUBLIC_*` vars)

Photos upload **directly from the browser to Cloudinary**, then the villa is saved with Cloudinary URLs. Without these vars, villa publish fails on Netlify with a clear error.

### Villas show on production but photos are missing

Usually you uploaded villas **locally** (`npm run dev`) while `DATABASE_URL` points to the **same Neon database** as Netlify. Image files stay on your laptop (`/uploads/villas/...`); production only has the DB row.

**Fix:**

1. Add `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` to **both** Netlify and your local `.env`
2. Redeploy Netlify
3. Delete the broken villas and **add them again** (or we can add an edit-photos flow later)

Migrated villas with `/uploads/villas/...` paths work on **localhost** only until you re-upload photos or use Cloudinary.
