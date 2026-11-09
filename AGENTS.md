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
- Keep UI translations and verified capability descriptions in src/lib/weechat; the shared provider is locale-only, and member screens never expose fictional purchases or simulated billing.
- Use semantic CSS tokens and existing UI Button/Input components across Weechat screens; this keeps the visual identity consistent.
- Keep UI locale separate from vocal-language selection; the concepts must not share state.
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
- The Windows companion lives in desktop/ as a Tauri v2 app loading the published web app; native status commands must report unavailable features truthfully, never fake success.
- Live speech translation uses Palabra streaming: the API key stays server-side and the browser only receives a short-lived session token; Deepgram+DeepL remains the sentence-by-sentence fallback.
- Live usage is prepaid in short blocks by the authenticated chargeUsageBlock server function: Swap Live debits points, live translation debits the separate audio-time ledger (post_audio_operation); rates are server-fixed and references unique per block.
- Restyle Live uses LocalMediaSession and browser-local canvas filters without billing; keep AI restyling unavailable until a validated provider exists, and share virtual-camera controls across live video modules to keep lifecycle behavior consistent.
- Weechat-Setup.exe is built by .github/workflows/weechat-setup.yml on a free Windows runner (PyInstaller + Inno Setup, models and Unity Capture virtual camera bundled); end users never install Python or OBS.

- Keep feature-status as the browser-safe source of current capability boundaries; the standalone Python engine remains unlinked to accounts and billing until a validated desktop entitlement protocol exists, so UI must not imply metered access.
- Cloud Live (Option 1) lives in cloud/gateway (aiortc WebRTC GPU server, Supabase-token verified, no frame storage) with the desktop client weechat_cloud.py feeding the virtual camera; the avatar engine is a pluggable module and passthrough must be labeled as network test only.
- Desktop account linking lives in desktop/engine/weechat_account.py: password sign-in with the public anon key only, refresh token stored in %APPDATA%/Weechat, balances read via owner-scoped RPCs; never ship secret keys in the desktop app.
- PayDunya checkout: browser sends only a catalogue id (paydunya-catalog); fulfillment re-confirms the invoice with PayDunya, checks owner/item/amount, and credits with reference paydunya:<token>; the camera licence is server-written auth app_metadata so it cannot be self-granted.
- Keep translation bonus minutes structured on pricing plans and derive checkout audio seconds from them; fulfillment must use the existing audio ledger and pack validity so advertised bonuses are actually delivered.
- Async AI tasks (talking photo, image generation) go through ai-tasks.functions with server-fixed token prices in ai-pricing and provider-neutral adapters in ai-adapters.server; adapters fail closed before any debit and submit failures refund via a unique reference.
