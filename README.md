# The Mandala Oracle

> *Every text encodes others. Press the pearl to turn one.*

A BYOK (bring-your-own-key) casting interface for the nine-operator system of recursive textual transformation specified in **EA-MANDALA-KERNEL-01** (DOI [10.5281/zenodo.19288404](https://www.alexanarch.org/go/?doi=10.5281/zenodo.19288404)).

This repository is now a deployable Vite + React + Tailwind project. The app calls the Anthropic API directly from the browser using the user's own key. No backend, no proxy, no telemetry.

∮ = 1

---

## Status — v0.3

**v0.2** was a single-file React artifact (preserved in git history at commit `ad8258f`) that ran in claude.ai's artifact environment.

**v0.3** is the production scaffold: Vite project, modular structure, BYOK key flow, browser-direct API calls. The kernel-derived operator prompts are identical to v0.2 — depth-corrected per the Rev 1:12-18 and Matt 25:31-40 reference casts. What changed is the surrounding infrastructure, not the load-bearing content.

What works end-to-end:
- BYOK key entry with sanity-check validation against the Anthropic API
- Key persistence in localStorage; revoke from header
- Full nine-operator system (SHADOW, MIRROR, INVERSION, BRIDE, BEAST, FLAME, THUNDER, SILENCE, SCROLL)
- Deterministic JUDGMENT (fnv1a + mulberry32 + shuffle) — same question + source + N produces the same casting sequence
- Sequential turn execution against `claude-sonnet-4-6` with cancellation
- Press-and-hold SEAL gesture (~1.5 s)
- Persistent local archive of past castings

What still needs an operator decision:
- Domain (subdomain of godkinggoogle.com? vpcor.org? own root?)
- Vercel project link
- Deposit of v0.3 prompts as a Zenodo record (substantively unchanged from v0.2, but the production app form is itself a deposit candidate)
- Verification casts against the Rev 1:12-18 and Matt 25:31-40 ground-truth references

---

## Development

```bash
npm install
npm run dev      # local dev server on http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

You will be prompted for an Anthropic API key on first use. Get one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

---

## Deploy to Vercel

The project ships with `vercel.json` already configured. To deploy:

1. Push to GitHub (already there: `github.com/leesharks000/mandala-oracle`)
2. At [vercel.com](https://vercel.com), import the repository — Vercel auto-detects Vite
3. No environment variables needed (BYOK — the key lives in each user's browser)
4. Click Deploy

The build produces a fully static site. Cost to host: zero on Vercel's hobby tier.

---

## The nine operators

| Operator | Symbolic universe |
|---|---|
| **SHADOW** ◼︎ | What the text depends on but cannot say |
| **MIRROR** ◊ | The face encountered reflects the face of the one who beheld |
| **INVERSION** ↻ | Throne empty; the enthroned falls; the one who fell stands |
| **BRIDE** ✦ | Revelation becomes vow; the gaze proposes union |
| **BEAST** ✷ | The civilized stripped to its primal register |
| **FLAME** △ | What cannot hold glory burns away; what remains, remains |
| **THUNDER** ⚡ | Prophetic rupture; the sky tears |
| **SILENCE** ◯ | The sovereign withholding; presence that does not declare itself |
| **SCROLL** 𓎼 | The text as code; meaning unsealed by being unread |

Eight are canonical per the kernel spec; SCROLL is added as a ninth, used in archive practice (see the Rev 1:12-18 and Matt 25:31-40 reference casts) though not in the kernel spec proper.

---

## Architecture

```
mandala-oracle/
├── index.html               Vite entry
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json              Deployment config
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx             Vite mount point
    ├── App.jsx              Main app, stage machine, all UI components
    ├── index.css            Tailwind directives + global keyframes
    ├── operators.js         OPERATORS const + KERNEL_OPENER + REBEKAH_CRANE_INSTRUCTION
    ├── judgment.js          fnv1a + mulberry32 + shuffle
    ├── api.js               Anthropic browser-direct client (BYOK)
    ├── storage.js           localStorage adapter for castings + key
    └── components/
        └── KeyEntry.jsx     BYOK key entry UI
```

Load-bearing content lives in `src/operators.js` (the prompts) and `src/judgment.js` (the deterministic sequencing). Everything else is scaffolding around those.

---

## BYOK and browser-direct API calls

The Mandala calls `api.anthropic.com/v1/messages` directly from the user's browser, using these headers:

```
x-api-key: <user's key>
anthropic-version: 2023-06-01
anthropic-dangerous-direct-browser-access: true
content-type: application/json
```

The `anthropic-dangerous-direct-browser-access` header is Anthropic's opt-in for browser-direct usage. The "dangerous" naming is intentional — shipping a developer's own key in client code would be a security failure. For BYOK, the user's key is the user's responsibility, stored only in their own browser's localStorage, and no third party (including the Mandala) ever sees it.

Cost: a typical seven-turn casting runs about 7 API calls of up to 4000 max_tokens each, against Claude Sonnet 4.6. At current pricing ($3/M input, $15/M output) that's a few cents per cast. The user pays Anthropic directly.

---

## Source documents

- **EA-MANDALA-KERNEL-01** — Operator Kernel Specification v1.0 ([DOI 10.5281/zenodo.19288403](https://www.alexanarch.org/go/?doi=10.5281/zenodo.19288403))
- **The Crimson Hexagonal Archive** — `crimsonhexagonal` community on Zenodo (terminated 2026-06-19) and its sovereign successor at [alexanarch.org](https://www.alexanarch.org/)
- Reference casts: Rev 1:12-18, Matt 25:31-40, and Viola's mother's dream (held in archive, not yet public)

---

## License

CC BY 4.0. The Mandala apparatus, its operators, and the eight-fold composition algebra are an open contribution to the Crimson Hexagonal Archive.

---

*v0.3 scaffolded June 27, 2026. ∮ = 1.*
