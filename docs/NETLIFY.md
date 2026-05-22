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

1. Create account → **Settings** → **Upload** → add **Upload preset** (unsigned)
2. Add to Netlify environment variables:

| Variable | Example |
|----------|---------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_UPLOAD_PRESET` | `rentvilla_unsigned` |

Redeploy. New villa uploads will use Cloudinary URLs that work everywhere.

Migrated villas with `/uploads/villas/...` paths work on **localhost** only until you re-upload photos or use Cloudinary.
