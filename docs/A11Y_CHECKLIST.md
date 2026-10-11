# Accessibility and polish checklist (palette C)

## Contrast (computed from the tokens, WCAG 2.2 AA)
| Pair | Ratio | Needs |
|---|---|---|
| Ink text on paper / white / tint | 12.7 / 13.8 / 11.7 | 4.5 |
| Muted text on paper / white / tint | 5.0 / 5.4 / 4.6 | 4.5 |
| Azure links on paper / white / tint | 5.6 / 6.1 / 5.2 | 4.5 |
| White on azure button / hover | 6.1 / 8.0 | 4.5 |
| Muted text on ink band | 8.7 | 4.5 |
| Danger red on white / paper | 6.5 / 6.0 | 4.5 |
| Input border on white / paper | 3.4 / 3.2 | 3.0 |
| Focus ring (azure on paper, white on ink) | 5.6 / 13.8 | 3.0 |
Re-run the check whenever `src/styles/tokens.css` changes. Muted on tint is the tightest pair (4.6): do not lighten `--text-muted`.

## Done in code
- Skip link, visible focus ring on every interactive element (white ring on dark bands).
- Mobile menu collapses at 960px so the 7 nav links never wrap; Escape closes it and returns focus.
- Heading order: one h1 per page, h2 sections, h3 items (team page has a hidden h2).
- Wave hero is decorative (`aria-hidden`), pauses off-screen, static under `prefers-reduced-motion`.
- Form: labels, hints and errors linked with aria-describedby; invalid fields marked with aria-invalid and a red border; live status region.

## Still to check by hand on the live site
- [ ] Tab through every page: order is logical, nothing is trapped, focus is always visible.
- [ ] Mobile menu: opens, Escape closes, links work, tapping outside closes.
- [ ] 360px width: no sideways scroll on any page.
- [ ] Screen reader pass on the apply form (VoiceOver or NVDA): errors are announced.
- [ ] Browser zoom 200%: nothing is cut off.
- [ ] OS "reduce motion" on: wave is still.
- [ ] Lighthouse accessibility and performance on each page (CI gate comes in Phase E).
