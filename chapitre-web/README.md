# chapitre-web

Front React (Vite + TypeScript + Tailwind + daisyUI + lucide-react).

## Lancer

```powershell
cd chapitre-web
npm.cmd install
npm.cmd run dev
```

Ouvre http://localhost:5173

## Architecture

```text
src/
  app/           # router, providers
  features/      # pages par domaine (public, auth, dashboards…)
  components/    # layout + ui
  lib/           # api-client, roles, utils
  mocks/         # données fictives clairement isolées
  styles via index.css (Tailwind + thème daisyUI « chapitre »)
```

Les mocks seront remplacés quand Identity / Catalog / Scheduling seront prêts.
