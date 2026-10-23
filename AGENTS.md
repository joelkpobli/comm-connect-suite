<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Weechat architecture
- Keep the eight screens as independent TanStack content routes wrapped by AppShell; this provides transferable presentation modules and coherent URLs.
- Keep fictional data and UI translations in src/lib/weechat, with shared in-memory DemoProvider state; simulated actions must never use persistence or network services.
- Use semantic CSS tokens and existing UI Button/Input components across Weechat screens; this keeps the visual identity consistent.
- Keep UI locale separate from simulated vocal-language selection; the concepts must not share state.
- Use the public NASA Earth photograph through a Lovable asset pointer; no paid generated assets are necessary for this prototype.
- Backend target is an external user-owned Supabase project reached via VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY through the single generated client in src/integrations/supabase (one client avoids duplicate sessions); never enable Lovable Cloud and never place secret keys in frontend code.
- Private screens live under src/routes/_authenticated (client-only gate redirecting to /connexion); auth uses Supabase email/password from the browser client, roles only in user_roles — keeps sessions in one place and prevents privilege escalation.
- Persisted profile reads and updates use authenticated TanStack server functions with schema validation and owner-scoped RLS; route loaders hydrate TanStack Query so data and error states are coherent.
- Register the client bearer attachment in src/start.ts alongside existing CSRF middleware; authenticated functions must work without exposing server credentials.
- docs/MASTER_SPEC.md holds the supplied execution directive; living documentation distinguishes validated operation, simulation and external blockers.
- Credit reads use authenticated server functions and the owner-only immutable ledger; privileged writes use post_credit_operation with a per-owner lock and unique reference, never a browser-controlled amount.
- Keep UI translations in src/lib/weechat; shared shell reads the profile query for saved identity and locale, while error boundaries use a hydration-safe local locale fallback because the normal provider may be unavailable.
- Keep live media in an ephemeral LocalMediaSession owned by the communication settings panel; stop tracks on withdrawal, screen exit, backgrounding and stale permission results to prevent unintended capture.
- Keep audio processing and canvas video composition browser-local without recording, storage, network sinks or speaker monitoring; this enforces zero retention and avoids feedback.
- Keep video output lifecycle in video-pipeline and future communication stages in disabled communication-contracts interfaces; modular boundaries prevent claiming unavailable integrations or leaking captured media.
- Keep future payment contracts provider-neutral and fail-closed with no executable adapter; fulfillment requires a verified server event, durable order matching and unique ledger reference before any enablement.

- Persona catalogue images and upload rules live in src/lib/weechat/persona-catalog; uploads stay as browser object URLs, never sent or stored.
