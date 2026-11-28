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
- Gate every sentence-based translation provider action on the caller's current prepaid audio ledger block; this prevents bypass through individual provider endpoints.
- Reject positive founder audio/token adjustments to the caller's own account; preserve support adjustments for other users and self-withdrawals.
- Restyle Live uses LocalMediaSession and browser-local canvas filters without billing; keep AI restyling unavailable until a validated provider exists, and share virtual-camera controls across live video modules to keep lifecycle behavior consistent.
- Weechat-Setup.exe is built by .github/workflows/weechat-setup.yml on a free Windows runner (PyInstaller + Inno Setup, models and Unity Capture virtual camera bundled); end users never install Python or OBS.

- Keep feature-status as the browser-safe source of current capability boundaries; the standalone Python engine remains unlinked to accounts and billing until a validated desktop entitlement protocol exists, so UI must not imply metered access.
- Cloud Live (Option 1) lives in cloud/gateway (aiortc WebRTC GPU server, Supabase-token verified, no frame storage) with the desktop client weechat_cloud.py feeding the virtual camera; the avatar engine is a pluggable module and passthrough must be labeled as network test only.
- Desktop account linking lives in desktop/engine/weechat_account.py: password sign-in with the public anon key only, refresh token stored in %APPDATA%/Weechat, balances read via owner-scoped RPCs; never ship secret keys in the desktop app.
- Mobile Money checkout uses SebPay hosted sessions (sebpay.server): browser sends only a catalogue id, fulfillment re-reads the session from SebPay, checks owner/item/amount/XOF and credits with reference sebpay:<session id>; the webhook is HMAC-verified and the camera licence stays server-written app_metadata so it cannot be self-granted.
- Keep translation bonus minutes structured on pricing plans and derive checkout audio seconds from them; fulfillment must use the existing audio ledger and pack validity so advertised bonuses are actually delivered.
- Async AI tasks go through ai-tasks.functions with server-fixed prices and wallet selection in ai-pricing: character transformation uses post_credit_operation for both debit and submission-failure refund, other tasks use post_ai_token_operation; this keeps pack points separate from bonus AI tokens. Provider-neutral adapters fail closed before debit.
- Landing/design work follows the UI/UX Pro Max guide stored in docs/design/ui-ux-pro-max; keeps design decisions consistent.
- Founder space (/fondateur) uses founder.functions where every handler checks has_role admin via the caller's session before loading the admin client; maintenance_modules is publicly readable and gates AI tasks server-side, and provider_usage_events auto-pauses a module after repeated provider billing refusals so users are refunded, never stuck.
- Appearance library (avatars + backgrounds) lives in src/lib/weechat/appearance-library with real-photo JSON catalogues (CDN pointers + licence metadata); it is free, prefs persist in localStorage and personal imports stay originals in IndexedDB on the device, never uploaded.
- Windows app auto-updates at startup via weechat_updater: compares the build number baked in at CI with version.txt published next to Weechat-Setup.exe, then runs the installer silently; users never reinstall manually.
- GPU pod is woken on demand by POST /api/public/cloud-endpoint (signed-in users only) and stopped by idle_guard; billing of a call starts only once the gateway answers /health.
- Windows Google sign-in uses Supabase PKCE with a loopback redirect on 127.0.0.1:53682 (desktop/engine/weechat_account.py); the app gets its own session instead of reusing the browser's refresh token, which would trigger reuse revocation.
- Whop card checkout sends pre-created plan IDs from whop-variants as variant_id with mode=payment, as verified against the live checkout_configurations API; diagnostics allow only safe error categories, not provider bodies or customer metadata.
- The Windows app reaches the full character transformation only through /api/public/desktop-ai, which verifies the caller's Supabase token and reuses ai-tasks.server so duration, price and refunds are computed server-side exactly like the web Studio.
- Studio broadcasting uses a dedicated seconds ledger, with one-time camera and purchase-specific bonus references; gate new offers and bonus copy on the deployed RPC so hours cannot fund GPU work or be sold before fulfillment exists.
- Keep purchases in the recharge screen and a single offer selector; dashboard links to balances instead of embedding price grids to avoid duplicated commercial UI.
- Camera activation links use /credits#camera to select the licence offer directly; restore checkout controls on pageshow so browser back navigation cannot leave purchases locked.
