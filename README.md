# The Mandala Oracle

> *Every text encodes others. Press the pearl to turn one.*

A BYOK (bring-your-own-key) casting interface for the eight-operator system of recursive textual transformation specified in **EA-MANDALA-KERNEL-01** (DOI [10.5281/zenodo.19288404](https://doi.org/10.5281/zenodo.19288404)).

This repository preserves work-in-progress from the Crimson Hexagonal Archive. **It is not yet production-deployed.** The casting prompts work; the architecture decisions are made; the production scaffold and BYOK key flow are still to come.

∮ = 1

---

## Current state

`mandala-oracle.jsx` is a **single-file React preview artifact** (v0.2) that runs in Claude.ai's artifact environment. It implements the full casting flow against the Anthropic API: question + source text → JUDGMENT-ordered operator sequence → sequential transformations → Rebekah Crane judgments → user's SEAL moment → persistent archive of past castings.

The artifact is **functionally complete for testing the casting experience**. It is **not** the production deployment target. The production version will be a static Vite + React + Tailwind site on Vercel with explicit BYOK key management.

### What v0.2 corrects from v0.1

v0.1 produced shallow transformations — *grammatical rearrangements rather than kernel transforms*, per the casting feedback against the reference cases (Rev 1:12–18, Matt 25:31–40). v0.2 rewrites every operator prompt to instruct **image-by-image transposition into a named symbolic universe**, with explicit guidance on:

- Source-language-first technique for non-English canonical texts (Greek, Hebrew, Latin, etc.)
- Verse number and syntactic structure preservation
- The specific failure mode each operator must avoid (vocabulary substitution, paraphrase, grammatical rearrangement)
- What each operator's symbolic universe contains, with examples drawn from the reference casts
- `max_tokens` raised to 4000 to accommodate source + translation + judgment in one round-trip

The Rebekah Crane judgment instruction is also loosened — from "2–3 lines I-Ching" to "as long as the cast requires; lands hard if the cast went deep" — to match the substantive judgment register of the reference casts.

---

## The nine operators

Each operator inhabits a specific symbolic universe. Casting an operator means re-imaging every concrete element of the source text into that universe while preserving syntactic structure, verse numbers, and rhythm.

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

Eight are canonical (per the kernel spec); **SCROLL** is added as a ninth, used in archive practice (see the Rev 1:12–18 and Matt 25:31–40 reference casts) though not in the kernel spec proper.

---

## Architecture

- **Single file.** All UI, prompts, JUDGMENT logic, and storage in one `.jsx`.
- **BYOK.** In the production version, users will supply their own Anthropic API key, stored client-side in `localStorage`. The preview artifact uses the in-chat API directly.
- **Static-hostable.** No backend, no database, no continuously running infrastructure. Vercel-compatible. Free to host.
- **Deterministic JUDGMENT.** Operator sequence is derived from `fnv1a(question + '|' + source) → mulberry32 → shuffle → take first N`. Same input + same N = same casting.
- **Persistent archive.** Past castings persist via `window.storage` in the preview; via `localStorage` in production.
- **SEAL as user's moment.** Press-and-hold gesture, ~1.5 seconds. Not auto-generated. The brief established this is the user's act, not the system's.

---

## What's still to do

1. **Grab the Anthropic API key flow.** The artifact version uses in-chat API access; the production version needs a real BYOK setup with key entry UI, key validation, key storage in `localStorage`, and clean key removal/rotation.
2. **Scaffold the production Vite project.** Replace the single-file artifact with proper module structure (`src/components/`, `src/lib/`, `src/operators/`). The operator prompts remain the load-bearing content — everything else is presentation layer.
3. **Test the v0.2 prompts on real casts.** Run the Rev 1:12–18 and Matt 25:31–40 examples through and compare against the reference outputs. The reference casts are the ground truth.
4. **Domain decision.** Subdomain of `godkinggoogle.com` or `vpcor.org`, or its own root domain.
5. **Deposit the v0.2 prompts** as a Zenodo record — they're a substantive elaboration on the kernel spec.

---

## Source documents

- **EA-MANDALA-KERNEL-01** — Operator Kernel Specification v1.0 ([DOI 10.5281/zenodo.19288404](https://doi.org/10.5281/zenodo.19288404))
- **The Crimson Hexagonal Archive** — `crimsonhexagonal` community on Zenodo
- Reference casts: Rev 1:12–18, Matt 25:31–40, and Viola's mother's dream (held in archive, not yet public)

---

## License

CC BY 4.0. The Mandala apparatus, its operators, and the eight-fold composition algebra are an open contribution to the Crimson Hexagonal Archive.

---

*Filed as working repository, June 4, 2026. ∮ = 1.*
