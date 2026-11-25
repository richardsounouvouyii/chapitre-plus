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

**Prochaine phase** proposée.
7. **Recommandations** (toujours, même si non implémentées tout de suite) — au minimum 3 pistes parmi :
   - technique (perf, schéma API, versioning, cache, indexes, circuit-breaker) ;
   - architecture (nouveau consumer, projection, découpage futur, contrat d'événement) ;
   - sécurité / mineurs / audit ;
   - observabilité (logs, métriques, traces, alertes DLQ) ;
   - produit / UX (écran manquant, empty state, accessibilité) ;
   - dette et risques si on reporte.

Les recommandations de fin de phase complètent (sans remplacer) la règle « Recommandations obligatoires » de chaque échange. Toujours des **suggestions à valider**, jamais des implémentations automatiques.
