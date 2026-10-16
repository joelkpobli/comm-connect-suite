# Weechat UI Prototype — validation

## Scope
Eight frontend content routes, reusable presentation components, separate fictional data and French/partial-English dictionary. New code written for this prototype; external GitHub repository not accessed or modified. No Cloud, database, backend, payment service, API keys, real authentication or publication.

## Acceptance and evidence
- 11 automated tests passed: eight route matches, local credit update/history insertion, UI language switch, credit formatting.
- Browser desktop 1280×1800: home, dashboard, fictional purchase (+2500 → 3750), history read-back and usage filter (3 rows), settings save, simulated login.
- Browser forms: signup confirmed with no real account created; recovery confirmed with no email sent.
- Browser mobile 390×844: all eight pages had no horizontal overflow; sidebar navigation verified. Home and credits screenshots reviewed.
- Browser runtime: no page errors in the tested flow.
- Latest preview validation: build OK.

## Limits and dependencies
All balances, transactions, prices and identity are examples. Reloading resets in-memory demo state. No actual audio/video capture, translation, avatar, virtual camera or call implemented or tested. Windows-specific integration, eight-platform real calls, CPU/memory/latency and licensing of future AI models remain unverified and outside scope. English UI is partial and explicitly identified in settings; vocal-language selection is independent.
User-provided HTML template and PNG informed visual layout; supplied DOC-001 and DEC decision texts were not included, so formal conformance to their unseen contents cannot be certified.
Image: public NASA Blue Marble Earth photograph (globe_east_2048.jpg), served via asset pointer. No paid image generation or connected service used.

## Traceability index
- src/lib/weechat: demo data, UI dictionary, metadata helper.
- src/components/weechat: presentation, shell, in-memory provider and screens.
- src/routes: eight leaf screen routes with page-specific metadata.
- src/test: route and local-state checks.
- AGENTS.md: architecture rules.
