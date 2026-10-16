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

## Weechat prototype architecture
- Keep the eight screens as independent TanStack content routes wrapped by AppShell; this provides transferable presentation modules and coherent URLs.
- Keep fictional data and UI translations in src/lib/weechat, with shared in-memory DemoProvider state; simulated actions must never use persistence or network services.
- Use semantic CSS tokens and existing UI Button/Input components across Weechat screens; this keeps the visual identity consistent.
- Keep UI locale separate from simulated vocal-language selection; the concepts must not share state.
- Use the public NASA Earth photograph through a Lovable asset pointer; no paid generated assets are necessary for this prototype.
