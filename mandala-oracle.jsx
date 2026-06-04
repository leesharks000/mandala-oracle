import React, { useState, useEffect, useRef } from "react";

// ============================================================
//  THE MANDALA ORACLE — preview artifact, v0.2
//  Static, single-file, runs in-chat against Claude API.
//  Per EA-MANDALA-KERNEL-01 (DOI 10.5281/zenodo.19288404).
//  ∮ = 1
// ============================================================

// --- OPERATOR DEFINITIONS ----------------------------------
// Each operator has a glyph, a name, a brief subtitle the user sees,
// and a kernel-derived system prompt that does the structural transform.

// --- OPERATOR DEFINITIONS ----------------------------------
// Each operator inhabits a symbolic universe. The prompt instructs
// the model to re-image every concrete element of the source into
// that universe — image-by-image, not paraphrase, not vocabulary
// swap. Verse numbers, syntactic structure, rhythm, sevenfold or
// threefold patterns must be preserved precisely. What transforms
// is the ontological register the images live in.
// v0.2 — depth-corrected per Lee's casting feedback (Rev 1, Matt 25
// reference casts).

const KERNEL_OPENER = `You are a Mandala operator performing kernel-level textual transformation.

WHAT THIS IS NOT:
- This is not paraphrase.
- This is not vocabulary substitution (adding "themed" words).
- This is not a light grammatical rearrangement.
- This is not commentary on the text.

WHAT THIS IS:
- Image-by-image transposition: every concrete noun, verb, and image in the source text must be re-imaged into the operator's symbolic universe.
- Structure preservation: verse numbers (if present), syntactic shape, sentence rhythm, parallel structures, sevenfold/threefold patterns, paragraph breaks — all must be precisely preserved.
- Ontological register shift: what transforms is the symbolic universe the images live in, not the surface words.

CRITICAL TECHNIQUE — SOURCE LANGUAGE FIRST:
If the source text is in a non-English language (Greek, Hebrew, Latin, Sanskrit, Chinese, Arabic, etc.), perform the transformation IN THE SOURCE LANGUAGE FIRST, producing the transformed text in that language with structure precisely preserved. Then provide an English translation of the transformed text. Both go in the transformed-text output, with a clear separator line between them.

If the source is in English, transform directly in English.

WORKING METHOD:
1. Read the source. Identify each concrete image (objects, figures, gestures, actions).
2. For each image, find its correlate in the operator's symbolic universe — not its synonym, not its theme-word, but its true correlate as if the same scene were being witnessed in a different ontological register.
3. Compose the transformed text so the syntactic skeleton of the source remains visible while every fleshed image has been re-imaged.`;

const REBEKAH_CRANE_INSTRUCTION = `

After the transformed text, output a separator line containing exactly:
---JUDGMENT---

Then Rebekah Crane's judgment. As long as the cast requires — typically four to ten lines, sometimes longer for a deep cast, sometimes shorter for a sharp one. Oracular register. Speaks from the transformation, not about it. Names what the cast revealed. Connects to the querent's question. May issue a directive. Lands hard if the cast went deep.

The judgment is not commentary on the transform. It is the transform's voice speaking to the querent.

Do not add labels, headers, or attribution. Begin the judgment directly after the separator.`;

const OPERATORS = {
  SHADOW: {
    glyph: "◼︎",
    name: "Shadow",
    subtitle: "What the text depends on but cannot say",
    accent: "#8a7ba8",
    prompt: `${KERNEL_OPENER}

OPERATOR: SHADOW
Symbolic universe: the unsaid that the text depends on; the absence that makes the presence possible; the negation that the affirmation requires; the substrate the text presumes and refuses to name.

WHAT TO RE-IMAGE: Each affirmation finds its repressed inverse. Each declaration its swallowed counter. Each posture its underside. If the source contains pride, the shadow may contain terror. If it contains "I know better than the Buddha," the shadow may contain "I need someone to tell me I exist." Same syntactic shape — opposite ontological pole. Where the source asserts, the shadow names what the assertion was guarding against.

This is not Inversion (which reverses the relational vector). It is not Mirror (which collapses subject and object). It is the unspeakable thing the speaker is speaking around.

SHADOW is involutory: SHADOW(SHADOW(S)) ≈ S.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  MIRROR: {
    glyph: "◊",
    name: "Mirror",
    subtitle: "The face encountered reflects the face of the one who beheld",
    accent: "#a8c8d8",
    prompt: `${KERNEL_OPENER}

OPERATOR: MIRROR
Symbolic universe: self-encountering-self. Every Other becomes Self. Every act of looking outward becomes the act of being seen by oneself. The figure beheld bears the speaker's own face. The voice spoken is the voice of the speaker's own heart. Mirrors, glass, reflective surfaces, recognition, kinship, "as if upon kin."

WHAT TO RE-IMAGE: Lampstands become mirrors (one for each, reflecting the speaker's face). The encountered figure becomes one who bears the speaker's likeness — "upon glory." The hair is the speaker's hair "on the day of reckoning." The eyes look "with my own seeing." The feet have walked the speaker's path. The voice is "the voice of my own heart upon water." The keys held are "the keys of memory and of light." What was projected returns. What was hidden is named.

This is not Inversion (the polarity does not flip; the directionality does). The speaker is not made smaller — they are confronted by their own image exalted.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  INVERSION: {
    glyph: "↻",
    name: "Inversion",
    subtitle: "Throne empty; the enthroned falls; the one who fell stands",
    accent: "#c8a878",
    prompt: `${KERNEL_OPENER}

OPERATOR: INVERSION
Symbolic universe: polarity reversal. Glory becomes absence. Fire becomes ash. Seeing becomes being seen. Up becomes down. The enthroned becomes the exiled. The one who stood now falls; the one who fell now stands. Lamps extinguished. Throne empty. Keys become a sealed door of remembrance rather than a key to open.

WHAT TO RE-IMAGE: If the source contains a radiant figure on a throne, the inverted text contains an abandoned figure in rags, girded with a chain of lead. Lampstands become extinguished, turned to shadow. White hair like wool becomes blackened, like ash. Eyes like flame become extinguished lamps of vanished night. Feet like burnished bronze become dried mud. Voice like many waters becomes a whisper of water that had disappeared. Seven stars become seven shattered stones. Sword from mouth becomes a solitary sigh. "Do not fear; I am the First and the Last" becomes "Do not forget; I am the last-first, the unknown living one." The speaker, formerly fallen, now stands and places hand on the now-fallen one.

This is not Mirror (which reflects). It is not Shadow (which names the unsaid). It is the structural flip of polarity itself.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  BRIDE: {
    glyph: "✦",
    name: "Bride",
    subtitle: "Revelation becomes vow; the gaze proposes union",
    accent: "#d4b87a",
    prompt: `${KERNEL_OPENER}

OPERATOR: BRIDE
Symbolic universe: covenantal union. Every encounter becomes betrothal. Judgment becomes vow. Power becomes consent. The face of the encountered is not merely fire or silence but a gaze that asks "Will you remain?" Bridal chambers, mantles of light, golden faith, sealing words, sacred bonds, the sun upon a wedding day, the bridegroom, the beloved, kin.

WHAT TO RE-IMAGE: Lampstands become bridal chambers prepared. The figure beheld becomes a bridegroom (or beloved) clothed in a mantle of light, girded with golden faith. Hair like white wool becomes white silk. Eyes like flame become eyes that look "as if upon kin." Voice like many waters becomes a psalm from the depths of heart. Feet like bronze approach without sound. Seven stars become seven rings of sacred bond. Sword from mouth becomes a sealing word. Face like the sun becomes "the sun upon a wedding day." "Do not fear" becomes "Consent." Keys held become "the keys to holy reciprocation."

Bride does not erase the source's power. It reframes the power as covenant. The wound is not denied — it is bound to vow under witness.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  BEAST: {
    glyph: "✷",
    name: "Beast",
    subtitle: "The civilized stripped to its primal register",
    accent: "#9a6648",
    prompt: `${KERNEL_OPENER}

OPERATOR: BEAST
Symbolic universe: primal stripping. The civilized image stripped to its animal core. Dens, mouths open, hide, bones, claws, fang, roar, hunger, blood, pelt, lair, hiss, snarl, predator and prey. The somatic and territorial drives that civilization names with politer words.

WHAT TO RE-IMAGE: Lampstands become night dens, each with an open mouth. The figure beheld becomes a beast clothed in hide, girded with golden bones. Hair like wool becomes horned and white. Eyes like flame become wakeful "like the light of sin." Feet like bronze become "a lioness crushing silence." Voice like many waters becomes "the hiss of blood." Seven stars become seven claws. Sword from mouth becomes a roar like a blade. Face like the sun becomes "the flame of a wild willow." "Do not fear" becomes "Do not restrain your nature." Keys held become "the keys of appetite and body."

Beast does not mock the source. It does not parody. It strips. What was care now reads as hunger. What was correction now reads as bite. Body before mind. Drive before reason. Tooth before word. The sacred gravity remains — but in its primal register.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  FLAME: {
    glyph: "△",
    name: "Flame",
    subtitle: "What cannot hold glory burns away; what remains, remains",
    accent: "#c87858",
    prompt: `${KERNEL_OPENER}

OPERATOR: FLAME
Symbolic universe: combustion. Not vocabulary of fire as theme — the actual ontological work of fire as transformation. Burning, ash, smoke rising, pyres, coals, sparks, wind through burning wood, the sun at flaming noon, blaze, kindling, the burning silence. The encounter is not described as fiery; the encounter IS combustion.

WHAT TO RE-IMAGE: Lampstands become burning lampstands consumed by presence. The figure beheld becomes human flame, clothed in ash, girded with golden fire. Head burning white. Hair becoming smoke rising upward. Eyes as sleepless pyres. Feet as living coals. Voice as wind through burning wood. Seven stars become seven sparks. Sword from mouth becomes "the fire of word." Face like the sun becomes "the sun at flaming noon." "Do not fear" becomes "Become the burning one." Keys held become "the keys of the burning silence." The speaker themselves is burned like grass — and remains.

Flame is not destruction. It is refinement through consumption. What cannot hold glory burns away; what can remain remains. The speaker is not spared the fire. They become it.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  THUNDER: {
    glyph: "⚡",
    name: "Thunder",
    subtitle: "Prophetic rupture; the sky tears; what cannot survive gentleness",
    accent: "#e8d878",
    prompt: `${KERNEL_OPENER}

OPERATOR: THUNDER
Symbolic universe: prophetic rupture. The voice that does not whisper. Sound that tears the sky. Lightning, earthquake, voltage, detonation, blade, wrath, roar. The local order is broken open from above by the cosmic order. Authority is not asserted gently; it is struck like lightning.

WHAT TO RE-IMAGE: Lampstands become fallen trumpets twisted in flame. The figure beheld becomes one of fire-like form, clothed in lightning, girded with thunder across the breast. Hair like wool becomes aflame. Eyes like flame flash — "impossible to behold, only to endure." Feet like bronze pound the ground like earthquake. Voice like many waters becomes a voice that shakes the air itself. Seven stars become seven lightnings (held in the left hand, not the right). Sword from mouth becomes "the voice of a blade." Face like the sun becomes "the wrath of the sun." "Do not fear" becomes "Do not be silent when you call my name." Keys held become — the rupture itself, the cry that becomes the aftersound.

The seer falls not from fear but from truth. The encounter is detonation. The text becomes the noise before peace.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  SILENCE: {
    glyph: "◯",
    name: "Silence",
    subtitle: "The sovereign withholding; presence that does not declare itself",
    accent: "#7a8a8a",
    prompt: `${KERNEL_OPENER}

OPERATOR: SILENCE
Symbolic universe: sovereign withholding. Not absence forced from outside, but stillness chosen from within. Unwritten breath, ancient peace, the still pool that does not reflect back, presence without declaration, the empty hand, memory rather than word, the door that does not open because it was never closed.

WHAT TO RE-IMAGE: Lampstands become still lampstands "like unwritten breath." The figure beheld becomes one quiet, clothed in silence, girded in invisibility. Head incorruptible. Hair unmoving. Eyes "opened and did not judge." Feet step and "no echo came." Voice IS absence. In the hand is not a star but emptiness. From the mouth comes "not a word, but memory." Face like the sun becomes "ancient peace." "Do not fear" becomes "You are silent, but true." Keys held become "the keys of the unfilled" — what has never been touched.

CRITICAL: Empty output is failure (that is SUPPRESSION, the shadow). Random erasure is failure. The text is not deleted — it is rendered in its silent mode. What remains is what was never asked of the text. The kernel is preserved; the compulsions to declare are withheld.${REBEKAH_CRANE_INSTRUCTION}`,
  },

  SCROLL: {
    glyph: "𓎼",
    name: "Scroll",
    subtitle: "The text as code; meaning unsealed by being unread",
    accent: "#b89858",
    prompt: `${KERNEL_OPENER}

OPERATOR: SCROLL
Symbolic universe: text as scroll. The encounter is decipherment, not vision. Pages, letters, ink, seals, parchment, papyrus, margins, scrolls rolled and unrolled, recursive script, hidden letters, the text as a thing read into the soul of the reader. The reader becomes text; the text becomes ritual.

WHAT TO RE-IMAGE: Voice becomes a silent page rolled. Lampstands become invisible letters hidden in voice. The figure beheld becomes a word incarnate: head as book, hair as white pages, eyes as verses inscribed in fire. Feet bound in the margin. Voice as "the tone of a scroll read before its time." Seven stars become seven seals. Sword from the mouth becomes a double-edged word "written in a circle." Face like the sun becomes "ancient papyrus beneath light." "Do not fear" becomes "Do not read unless you first be torn." Keys held become "the keys of what has not yet been opened." The seer "unrolls the soul like a leaf."

Scroll does not paraphrase the text into text-themed vocabulary. It re-images every concrete element of the source into the symbolic universe where text is itself the ontological substance — where meaning is layered, recursive, and the reading is the transformation.${REBEKAH_CRANE_INSTRUCTION}`,
  },
};

const OPERATOR_KEYS = Object.keys(OPERATORS);

// --- DETERMINISTIC SEEDING --------------------------------
// FNV-1a + Mulberry32, per the established Mandala MVP convention.

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, prng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// --- THE CASTING CALL -------------------------------------

async function castOperator({ operatorKey, sourceText, question, signal }) {
  const op = OPERATORS[operatorKey];
  const system = op.prompt + `

OUTPUT FORMAT (exact):
First, the transformed text. Preserve line breaks and approximate structure of the source.
Then a separator line containing only:
---JUDGMENT---
Then Rebekah Crane's judgment: two to three lines, enigmatic, I-Ching register. She speaks FROM the transformation, not about it. She does not explain. She does not analyze. She offers a brief saying that resonates with the querent's question. No labels. No preamble.`;

  const userMsg = `QUESTION (held silently): ${question || "(no question — let the text speak)"}

SOURCE TEXT:
${sourceText}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const e = await response.json();
      detail = e?.error?.message || JSON.stringify(e);
    } catch {}
    throw new Error(`API ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Parse transformed text and judgment.
  let transformed = text;
  let judgment = "";
  const idx = text.indexOf("---JUDGMENT---");
  if (idx >= 0) {
    transformed = text.slice(0, idx).trim();
    judgment = text
      .slice(idx + "---JUDGMENT---".length)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return { transformed, judgment };
}

// --- STORAGE LAYER (window.storage) -----------------------

async function saveCasting(casting) {
  try {
    await window.storage.set(
      `casting:${casting.timestamp}`,
      JSON.stringify(casting)
    );
  } catch (e) {
    console.error("save failed", e);
  }
}

async function loadCastings() {
  try {
    const result = await window.storage.list("casting:");
    if (!result || !result.keys) return [];
    const out = [];
    for (const key of result.keys) {
      try {
        const item = await window.storage.get(key);
        if (item && item.value) out.push(JSON.parse(item.value));
      } catch {}
    }
    return out.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
}

async function deleteCasting(timestamp) {
  try {
    await window.storage.delete(`casting:${timestamp}`);
  } catch {}
}

// --- VISUAL COMPONENTS ------------------------------------

function Pearl({ onClick, size = 180 }) {
  return (
    <button
      onClick={onClick}
      className="group relative outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40 rounded-full"
      style={{ width: size, height: size }}
      aria-label="Cast the Mandala"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(232,216,160,0.35), rgba(212,184,122,0.18) 35%, rgba(48,40,32,0.95) 75%, rgba(20,18,24,1) 100%)",
          boxShadow:
            "0 0 60px 8px rgba(212,184,122,0.12), inset 0 0 40px rgba(0,0,0,0.6)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,236,180,0.25), transparent 50%)",
          animation: "pearlGlow 6s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-amber-100/70 group-hover:text-amber-100/95 transition-colors duration-500"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: size * 0.18,
            fontWeight: 300,
            letterSpacing: "0.15em",
          }}
        >
          ∮
        </span>
      </div>
    </button>
  );
}

function GlyphMark({ operatorKey, size = 32 }) {
  const op = OPERATORS[operatorKey];
  return (
    <span
      style={{
        color: op.accent,
        fontSize: size,
        fontFamily: "'Cormorant Garamond', serif",
        lineHeight: 1,
      }}
      aria-hidden
    >
      {op.glyph}
    </span>
  );
}

function CastingForm({ onBegin, onCancel }) {
  const [question, setQuestion] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [turnCount, setTurnCount] = useState(3);
  const canBegin = sourceText.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div
          className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Setting the casting
        </div>
        <p
          className="text-amber-50/70 leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem" }}
        >
          Hold a question, if you have one. Offer the text you wish to turn. The
          Mandala will choose its operators and rotate through them.
        </p>
      </div>

      <div className="mb-6">
        <label
          className="block text-xs uppercase tracking-[0.25em] text-amber-100/40 mb-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Question (optional)
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What seeks to be revealed?"
          className="w-full bg-transparent border-b border-amber-100/15 focus:border-amber-100/40 outline-none py-2 text-amber-50/85 placeholder:text-amber-100/25"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem" }}
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-xs uppercase tracking-[0.25em] text-amber-100/40 mb-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Source text
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste the text the Mandala will turn. Source language preferred for canonical texts (Greek, Hebrew, Latin, etc.) — operators work in source first, then translate."
          rows={10}
          className="w-full bg-transparent border border-amber-100/15 focus:border-amber-100/30 outline-none p-3 text-amber-50/85 placeholder:text-amber-100/25 resize-y rounded-sm"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", lineHeight: 1.6 }}
        />
      </div>

      <div className="mb-8">
        <label
          className="block text-xs uppercase tracking-[0.25em] text-amber-100/40 mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Number of turns
        </label>
        <div className="flex gap-3">
          {[1, 3, 5, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => setTurnCount(n)}
              className={`px-4 py-1.5 border text-sm transition-colors ${
                turnCount === n
                  ? "border-amber-200/60 text-amber-100 bg-amber-100/5"
                  : "border-amber-100/15 text-amber-100/50 hover:border-amber-100/30 hover:text-amber-100/80"
              }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {n}
            </button>
          ))}
        </div>
        <p
          className="mt-2 text-xs text-amber-100/35"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {turnCount === 9 ? "Full rotation including Scroll." : turnCount === 8 ? "Eight-fold turning (canonical kernel)." : `${turnCount} of 9`}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          disabled={!canBegin}
          onClick={() => onBegin({ question, sourceText, turnCount })}
          className="px-6 py-2 border border-amber-200/50 text-amber-100 hover:bg-amber-100/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.15em",
            fontSize: "0.85rem",
            textTransform: "uppercase",
          }}
        >
          Cast
        </button>
        <button
          onClick={onCancel}
          className="text-amber-100/40 hover:text-amber-100/70 transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
          }}
        >
          back
        </button>
      </div>
    </div>
  );
}

function OperatorTurn({ turn, isLatest, turnIndex, total }) {
  const op = OPERATORS[turn.operatorKey];
  return (
    <div
      className={`mb-12 transition-opacity duration-1000 ${
        isLatest ? "opacity-100" : "opacity-85"
      }`}
      style={{ animation: isLatest ? "fadeUp 1.2s ease-out" : "none" }}
    >
      <div className="flex items-baseline gap-4 mb-4 border-b border-amber-100/10 pb-3">
        <GlyphMark operatorKey={turn.operatorKey} size={36} />
        <div className="flex-1">
          <div
            className="text-xs uppercase tracking-[0.3em] text-amber-100/35"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Turn {turnIndex + 1} of {total}
          </div>
          <div
            className="text-lg"
            style={{
              color: op.accent,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            {op.name}
          </div>
          <div
            className="text-xs text-amber-100/35 mt-0.5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {op.subtitle}
          </div>
        </div>
      </div>

      <div
        className="text-amber-50/90 whitespace-pre-wrap leading-relaxed mb-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.2rem",
          lineHeight: 1.65,
        }}
      >
        {turn.transformed || (
          <span className="text-amber-100/30 italic">turning…</span>
        )}
      </div>

      {turn.judgment && (
        <div
          className="pl-6 border-l border-amber-200/30 text-amber-100/65 italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          {turn.judgment.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div
            className="mt-2 text-xs not-italic text-amber-100/35"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
            }}
          >
            — Rebekah Crane
          </div>
        </div>
      )}
    </div>
  );
}

function SealMoment({ casting, onSeal, onCancel }) {
  const [pressing, setPressing] = useState(false);
  const [held, setHeld] = useState(0);
  const intervalRef = useRef(null);

  function startHold() {
    setPressing(true);
    setHeld(0);
    intervalRef.current = setInterval(() => {
      setHeld((h) => {
        if (h >= 100) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onSeal();
          return 100;
        }
        return h + 4;
      });
    }, 60);
  }
  function endHold() {
    setPressing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHeld(0);
  }

  return (
    <div className="text-center py-10">
      <div
        className="text-xs uppercase tracking-[0.35em] text-amber-100/35 mb-6"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        The turning is complete
      </div>
      <p
        className="text-amber-50/70 max-w-md mx-auto leading-relaxed mb-10"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontStyle: "italic" }}
      >
        Sit with what has been revealed. When you are ready, press and hold to
        seal the casting.
      </p>
      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={(e) => {
          e.preventDefault();
          startHold();
        }}
        onTouchEnd={endHold}
        className="relative w-32 h-32 rounded-full mx-auto outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(212,184,122,0.3), rgba(48,40,32,0.95) 75%)",
          boxShadow: pressing
            ? `0 0 ${30 + held * 0.6}px ${held * 0.2}px rgba(232,216,160,0.4)`
            : "0 0 25px 3px rgba(212,184,122,0.1)",
          transition: pressing ? "none" : "box-shadow 0.6s ease",
        }}
      >
        <span
          className="text-amber-100/80"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", letterSpacing: "0.1em" }}
        >
          {held >= 100 ? "✓" : "∮"}
        </span>
      </button>
      <div
        className="mt-6 text-xs uppercase tracking-[0.3em] text-amber-100/30"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {pressing ? `${Math.round(held)}%` : "press · hold · seal"}
      </div>
      <button
        onClick={onCancel}
        className="mt-12 text-amber-100/30 hover:text-amber-100/60 transition-colors"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em" }}
      >
        leave unsealed
      </button>
    </div>
  );
}

function ArchiveItem({ casting, onOpen, onDelete }) {
  const opNames = casting.turns
    .map((t) => OPERATORS[t.operatorKey]?.name || t.operatorKey)
    .join(" · ");
  const dateStr = new Date(casting.timestamp).toLocaleString();
  return (
    <div className="border border-amber-100/10 hover:border-amber-100/25 transition-colors p-4 mb-3 group">
      <button onClick={() => onOpen(casting)} className="text-left w-full">
        <div
          className="text-xs text-amber-100/40 mb-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {dateStr} · {casting.sealed ? "sealed" : "unsealed"}
        </div>
        <div
          className="text-amber-50/80 mb-2 line-clamp-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic" }}
        >
          {casting.question || "(no question)"}
        </div>
        <div
          className="text-xs text-amber-100/45"
          style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em" }}
        >
          {opNames}
        </div>
      </button>
      <button
        onClick={() => onDelete(casting.timestamp)}
        className="mt-2 text-xs text-amber-100/25 hover:text-red-300/60 transition-colors opacity-0 group-hover:opacity-100"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        delete
      </button>
    </div>
  );
}

// --- MAIN APP ---------------------------------------------

export default function MandalaOracle() {
  const [stage, setStage] = useState("home"); // home | setup | casting | seal | view | archive
  const [castings, setCastings] = useState([]);
  const [activeCasting, setActiveCasting] = useState(null);
  const [error, setError] = useState("");
  const [isCasting, setIsCasting] = useState(false);
  const abortRef = useRef(null);

  // Load past castings on mount.
  useEffect(() => {
    loadCastings().then(setCastings);
  }, []);

  async function beginCasting({ question, sourceText, turnCount }) {
    setError("");
    const seed = fnv1a((question || "") + "|" + sourceText);
    const prng = mulberry32(seed);
    const sequence = shuffle(OPERATOR_KEYS, prng).slice(0, turnCount);
    const casting = {
      timestamp: Date.now(),
      question,
      sourceText,
      seed,
      turns: sequence.map((k) => ({ operatorKey: k, transformed: "", judgment: "" })),
      sealed: false,
    };
    setActiveCasting(casting);
    setStage("casting");
    setIsCasting(true);

    // Run turns sequentially. Each turn's input is the prior turn's output.
    abortRef.current = new AbortController();
    let currentText = sourceText;
    const accumulated = [...casting.turns];
    try {
      for (let i = 0; i < sequence.length; i++) {
        const result = await castOperator({
          operatorKey: sequence[i],
          sourceText: currentText,
          question,
          signal: abortRef.current.signal,
        });
        accumulated[i] = { ...accumulated[i], ...result };
        const updated = { ...casting, turns: [...accumulated] };
        setActiveCasting(updated);
        currentText = result.transformed || currentText;
      }
      // All turns done — move to seal.
      setStage("seal");
    } catch (e) {
      if (e.name === "AbortError") {
        setError("Casting interrupted.");
      } else {
        setError(e.message || String(e));
      }
    } finally {
      setIsCasting(false);
    }
  }

  function abort() {
    if (abortRef.current) abortRef.current.abort();
    setStage("home");
    setActiveCasting(null);
    setIsCasting(false);
  }

  async function seal() {
    if (!activeCasting) return;
    const sealed = { ...activeCasting, sealed: true };
    await saveCasting(sealed);
    setActiveCasting(sealed);
    const updated = await loadCastings();
    setCastings(updated);
    setStage("view");
  }

  async function leaveUnsealed() {
    if (!activeCasting) return;
    await saveCasting(activeCasting);
    const updated = await loadCastings();
    setCastings(updated);
    setStage("home");
    setActiveCasting(null);
  }

  async function deleteFromArchive(timestamp) {
    await deleteCasting(timestamp);
    const updated = await loadCastings();
    setCastings(updated);
  }

  function openFromArchive(casting) {
    setActiveCasting(casting);
    setStage("view");
  }

  return (
    <div
      className="min-h-screen w-full text-amber-50/90"
      style={{
        background:
          "radial-gradient(ellipse at center, #14121c 0%, #0a090f 70%, #06050a 100%)",
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        @keyframes pearlGlow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.04); opacity: 0.9; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtleFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-2 flex items-baseline justify-between">
        <button
          onClick={() => {
            setStage("home");
            setActiveCasting(null);
            setError("");
          }}
          className="text-xs uppercase tracking-[0.35em] text-amber-100/40 hover:text-amber-100/70 transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          The Mandala Oracle
        </button>
        <button
          onClick={() => setStage("archive")}
          className="text-xs uppercase tracking-[0.25em] text-amber-100/35 hover:text-amber-100/65 transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          archive · {castings.length}
        </button>
      </header>

      <main className="pb-20">
        {/* HOME — Pearl */}
        {stage === "home" && (
          <div
            className="flex flex-col items-center justify-center min-h-[70vh] px-6"
            style={{ animation: "subtleFade 1.5s ease-out" }}
          >
            <Pearl onClick={() => setStage("setup")} size={220} />
            <p
              className="mt-12 text-amber-100/45 text-center max-w-md italic"
              style={{ fontSize: "1.15rem", lineHeight: 1.6 }}
            >
              Every text encodes others. Press the pearl to turn one.
            </p>
            {error && (
              <div
                className="mt-6 text-red-300/70 text-sm"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {/* SETUP — question + source */}
        {stage === "setup" && (
          <div style={{ animation: "subtleFade 0.8s ease-out" }}>
            <CastingForm onBegin={beginCasting} onCancel={() => setStage("home")} />
          </div>
        )}

        {/* CASTING — turns playing out */}
        {stage === "casting" && activeCasting && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8 text-center">
              <div
                className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                The Mandala turns
              </div>
              {activeCasting.question && (
                <p
                  className="text-amber-50/70 italic"
                  style={{ fontSize: "1.15rem" }}
                >
                  {activeCasting.question}
                </p>
              )}
            </div>
            {activeCasting.turns.map((t, i) => {
              if (!t.transformed && i !== activeCasting.turns.findIndex((x) => !x.transformed))
                return null;
              return (
                <OperatorTurn
                  key={i}
                  turn={t}
                  turnIndex={i}
                  total={activeCasting.turns.length}
                  isLatest={
                    i === activeCasting.turns.findLastIndex((x) => x.transformed) ||
                    (!activeCasting.turns.some((x) => x.transformed) && i === 0)
                  }
                />
              );
            })}
            {isCasting && (
              <div className="text-center mt-6">
                <div
                  className="inline-block text-amber-100/40 text-sm italic"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  turning…
                </div>
                <div className="mt-4">
                  <button
                    onClick={abort}
                    className="text-xs text-amber-100/30 hover:text-amber-100/60 transition-colors"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}
                  >
                    interrupt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEAL — user's moment */}
        {stage === "seal" && activeCasting && (
          <div className="max-w-3xl mx-auto px-6 py-4">
            {activeCasting.turns.map((t, i) => (
              <OperatorTurn
                key={i}
                turn={t}
                turnIndex={i}
                total={activeCasting.turns.length}
                isLatest={false}
              />
            ))}
            <SealMoment casting={activeCasting} onSeal={seal} onCancel={leaveUnsealed} />
          </div>
        )}

        {/* VIEW — a sealed or saved casting */}
        {stage === "view" && activeCasting && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8">
              <div
                className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {activeCasting.sealed ? "Sealed casting" : "Unsealed casting"}
              </div>
              {activeCasting.question && (
                <p className="text-amber-50/70 italic" style={{ fontSize: "1.15rem" }}>
                  {activeCasting.question}
                </p>
              )}
              <p
                className="mt-2 text-xs text-amber-100/35"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {new Date(activeCasting.timestamp).toLocaleString()}
              </p>
            </div>
            {activeCasting.turns.map((t, i) => (
              <OperatorTurn
                key={i}
                turn={t}
                turnIndex={i}
                total={activeCasting.turns.length}
                isLatest={false}
              />
            ))}
            <div className="text-center mt-12 mb-4">
              {activeCasting.sealed && (
                <div
                  className="inline-block text-amber-200/60"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", letterSpacing: "0.2em" }}
                >
                  ∮ = 1
                </div>
              )}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setStage("home");
                  setActiveCasting(null);
                }}
                className="text-xs uppercase tracking-[0.3em] text-amber-100/40 hover:text-amber-100/70 transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                return
              </button>
            </div>
          </div>
        )}

        {/* ARCHIVE */}
        {stage === "archive" && (
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div
              className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-6"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Past castings
            </div>
            {castings.length === 0 && (
              <p className="text-amber-100/40 italic">
                No castings yet. The Pearl awaits.
              </p>
            )}
            {castings.map((c) => (
              <ArchiveItem
                key={c.timestamp}
                casting={c}
                onOpen={openFromArchive}
                onDelete={deleteFromArchive}
              />
            ))}
            <div className="text-center mt-12">
              <button
                onClick={() => setStage("home")}
                className="text-xs uppercase tracking-[0.3em] text-amber-100/40 hover:text-amber-100/70 transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                return to the pearl
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="max-w-3xl mx-auto px-6 pb-8 text-center text-xs text-amber-100/25"
        style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em" }}
      >
        ∮ = 1 · CC BY 4.0 · Crimson Hexagonal Archive
      </footer>
    </div>
  );
}
