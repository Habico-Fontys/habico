This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# Habico

Habico student-housing dashboard prototype. Some dashboard sections still use dummy/browser-stored data, and login is a client-side demo check only.

## Local PostgreSQL connection

The development API can read the existing property, resident, task, bin measurement, and energy tables from a PostgreSQL server running on this PC. It does not write to the database. The current dashboard screens have not yet been switched to consume this API. Activities and groceries still use prototype data because the current database schema has no matching tables.

1. Make sure the PostgreSQL server is running. pgAdmin is the management client; the app connects to the PostgreSQL server itself.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your local database connection. Keep `.env.local` private and do not commit it.
3. Set `HABICO_PROPERTY_ID` to the property to show. In pgAdmin's Query Tool, you can find IDs with:

   ```sql
   SELECT propertie_id, city FROM propertie ORDER BY propertie_id;
   ```

4. Start the app with `npm run dev`, then open `http://localhost:3000/api/db/health` to check the connection and `http://localhost:3000/api/db/overview` to inspect the mapped data.

These database endpoints are intentionally limited to localhost in development. They are read-only because the current demo login does not authenticate users on the server. The local database will not be available to a separately deployed website.

## Starten

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Demo-login: gebruikersnaam `admin`, wachtwoord `habico123`.

## Structuur

- `app/`: App Router-pagina's en layouts.
- `components/`: herbruikbare interfacecomponenten.
- `data/`: tijdelijke login-constanten en dashboard-dummydata.

De kleur- en fonttokens staan in `app/globals.css` als Tailwind-theme. Vervang later `data/auth.ts` door echte authenticatie en de resterende dummydata door de bijbehorende tabellen zodra die bestaan.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
