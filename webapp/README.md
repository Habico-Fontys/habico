This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# Habico

Frontend-only prototype for the Habico student-housing dashboard. Dashboard content is dummy data; login is a client-side demo check only. No API, database, or real authentication is configured.

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

De kleur- en fonttokens staan in `app/globals.css` als Tailwind-theme. Vervang later `data/auth.ts` door echte authenticatie en `data/mock.ts` door een databron.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
