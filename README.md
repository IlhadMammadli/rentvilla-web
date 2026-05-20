# RentVilla

Villa rental platform for Azerbaijan — public listings, owner/realtor registration, villa uploads, and admin panel.

## Branch `feature/language`

- **Languages:** Azerbaijani (default), Russian, English — header dropdown
- **Contact tracking:** Phone shown only after "Show contact number" click
- **Owner dashboard:** Views, contact reveals, conversion %, top listings, 7-day stats

Run after pull: `npx prisma db push`

## What’s included (Step 1)

- **Registration** — Villa owner (name, surname, email, +994 phone, password) or Realtor (company, optional logo, phone, email, password)
- **Login** — Email or phone (segment switch) + password
- **Main page** — Grid of villa cards matching the design (image, price badge, title, city, guests, bedrooms)
- **Villa detail** — Contact name visible; phone revealed on button click (tracked)
- **Dashboard** — Owner analytics + add villas (city, price, guests, rooms, facilities, contact, details)
- **Admin panel** — Full access for `ilhadmammadli@gmail.com`
- **Database** — SQLite via Prisma (easy local setup + visual browser)

## Requirements

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- npm

## Setup & run

```bash
cd /Users/ilhad/Desktop/RentVilla

# 1. Install dependencies
npm install

# 2. Create database + seed admin, cities, facilities, demo villas
npm run db:setup

# 3. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

## Accounts

| Role        | Login              | Password      |
|-------------|--------------------|---------------|
| **Admin**   | ilhadmammadli@gmail.com | Im19951411 |
| Demo owner  | demo.owner@rentvilla.az   | Demo1234!  |

Admin: use **Email** on the login page → `/admin`  
Owners/Realtors: register at `/register` → `/dashboard` → **Add villa**

## Where is the database?

- **File:** `prisma/dev.db` (SQLite)
- **Schema:** `prisma/schema.prisma`

### View & edit data visually (recommended)

```bash
npm run db:studio
```

Opens **Prisma Studio** at http://localhost:5555 — browse Users, Villas, Cities, Facilities, etc.

### Admin panel (in the app)

1. Log in as admin
2. Go to **Admin** in the header
3. Sections: Overview, Users, Villas, Cities, Facilities

Cities and facilities can be added/removed from the admin UI (soft-delete: `isActive: false`).

## Project structure

```
RentVilla/
├── prisma/
│   ├── schema.prisma    # Database models
│   ├── seed.ts          # Admin + cities + demo data
│   └── dev.db           # SQLite DB (after setup)
├── src/
│   ├── app/             # Pages & API routes
│   ├── components/      # UI components
│   └── lib/             # Auth, Prisma, helpers
└── public/uploads/      # Uploaded logos & villa photos
```

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:setup` | Reset schema + seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Apply schema changes |

## Next steps (planned)

- Google Maps location picker on villa upload
- Image gallery per villa
- Search & filters on main page
- Renter accounts (browse only, no listing)

## Security note

Change `SESSION_SECRET` in `.env` before deploying to production. Do not commit real passwords to public repos.
