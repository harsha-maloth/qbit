# Legacy site audit (files in legacy/)

Static 6-file site: index, Mission, Phillosophy, TEAM, form, styles.css. Shared dark/gold theme, header/footer copied into each page.

## Missing files
- `scripts.js` is referenced everywhere but was not provided: the mobile menu toggle and form submit handler do not exist.
- Images not provided: Collectivequbits.jpg, saatwik.png, Adavit.png, Shaliq.png, Disha Parasu.jpeg, Sudhi Sharma.png, Priyanshu.jpeg.

## Bugs and inconsistencies
- "Phillosophy" misspelled in filename and all links.
- Home team preview uses Adavit.png for "Programs Lead" but Team page lists Advait as Technical Advisor; Disha's photo used for "Community & Partnerships" but Team page says Community & Operations.
- Seven team members share one copied bio; Asmita, Sukesh, Aaryan use the logo as photo.
- Alt text "Shaliq Abu" vs displayed "Mohamed Armoon Shaliq".
- `.badge` is only styled inside `.section-highlight`, so top-of-page badges are unstyled.
- Footer Programs links point to `#`.
- Form: inline `grid-column: 1 / -1` has no effect (form is not a grid). No submit handler; form would GET-submit and reload.
- Footer wording differs between pages ("Neurotech" vs "Neurotech & Sensing").
- Unused CSS (`.hero-visual img`, `.profile-card h3/p`), mobile menu offset (2rem vs container 1rem).
- No meta description on index, no favicon.
- Duplicated header/footer across 5 pages causes drift.
