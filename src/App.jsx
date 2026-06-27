import React, { useState, useEffect, useRef } from 'react';
import { OPERATORS, OPERATOR_KEYS } from './operators.js';
import { fnv1a, mulberry32, shuffle } from './judgment.js';
import { castOperator } from './api.js';
import {
  saveCasting,
  loadCastings,
  deleteCasting,
  loadApiKey,
  clearApiKey,
} from './storage.js';
import KeyEntry from './components/KeyEntry.jsx';

// ============================================================
//  THE MANDALA ORACLE — production app (Vite + React)
//  Per EA-MANDALA-KERNEL-01 (DOI 10.5281/zenodo.19288404)
//  ∮ = 1
// ============================================================

// --- Pearl ------------------------------------------------

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
            'radial-gradient(circle at 35% 30%, rgba(232,216,160,0.35), rgba(212,184,122,0.18) 35%, rgba(48,40,32,0.95) 75%, rgba(20,18,24,1) 100%)',
          boxShadow:
            '0 0 60px 8px rgba(212,184,122,0.12), inset 0 0 40px rgba(0,0,0,0.6)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,236,180,0.25), transparent 50%)',
          animation: 'pearlGlow 6s ease-in-out infinite',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-amber-100/70 group-hover:text-amber-100/95 transition-colors duration-500"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: size * 0.18,
            fontWeight: 300,
            letterSpacing: '0.15em',
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

// --- Casting form -----------------------------------------

function CastingForm({ onBegin, onCancel }) {
  const [question, setQuestion] = useState('');
  const [sourceText, setSourceText] = useState('');
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
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}
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
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}
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
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', lineHeight: 1.6 }}
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
                  ? 'border-amber-200/60 text-amber-100 bg-amber-100/5'
                  : 'border-amber-100/15 text-amber-100/50 hover:border-amber-100/30 hover:text-amber-100/80'
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
          {turnCount === 9
            ? 'Full rotation including Scroll.'
            : turnCount === 8
            ? 'Eight-fold turning (canonical kernel).'
            : `${turnCount} of 9`}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          disabled={!canBegin}
          onClick={() => onBegin({ question, sourceText, turnCount })}
          className="px-6 py-2 border border-amber-200/50 text-amber-100 hover:bg-amber-100/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
          }}
        >
          Cast
        </button>
        <button
          onClick={onCancel}
          className="text-amber-100/40 hover:text-amber-100/70 transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
          }}
        >
          back
        </button>
      </div>
    </div>
  );
}

// --- Operator turn display --------------------------------

function OperatorTurn({ turn, isLatest, turnIndex, total }) {
  const op = OPERATORS[turn.operatorKey];
  return (
    <div
      className={`mb-12 transition-opacity duration-1000 ${
        isLatest ? 'opacity-100' : 'opacity-85'
      }`}
      style={{ animation: isLatest ? 'fadeUp 1.2s ease-out' : 'none' }}
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
              fontStyle: 'italic',
              letterSpacing: '0.05em',
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
          fontSize: '1.2rem',
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
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}
        >
          {turn.judgment.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div
            className="mt-2 text-xs not-italic text-amber-100/35"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.15em',
            }}
          >
            — Rebekah Crane
          </div>
        </div>
      )}
    </div>
  );
}

// --- The seal moment --------------------------------------

function SealMoment({ onSeal, onCancel }) {
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
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontStyle: 'italic' }}
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
            'radial-gradient(circle at 35% 30%, rgba(212,184,122,0.3), rgba(48,40,32,0.95) 75%)',
          boxShadow: pressing
            ? `0 0 ${30 + held * 0.6}px ${held * 0.2}px rgba(232,216,160,0.4)`
            : '0 0 25px 3px rgba(212,184,122,0.1)',
          transition: pressing ? 'none' : 'box-shadow 0.6s ease',
        }}
      >
        <span
          className="text-amber-100/80"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', letterSpacing: '0.1em' }}
        >
          {held >= 100 ? '✓' : '∮'}
        </span>
      </button>
      <div
        className="mt-6 text-xs uppercase tracking-[0.3em] text-amber-100/30"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {pressing ? `${Math.round(held)}%` : 'press · hold · seal'}
      </div>
      <button
        onClick={onCancel}
        className="mt-12 text-amber-100/30 hover:text-amber-100/60 transition-colors"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.1em' }}
      >
        leave unsealed
      </button>
    </div>
  );
}

// --- Archive list item ------------------------------------

function ArchiveItem({ casting, onOpen, onDelete }) {
  const opNames = casting.turns
    .map((t) => OPERATORS[t.operatorKey]?.name || t.operatorKey)
    .join(' · ');
  const dateStr = new Date(casting.timestamp).toLocaleString();
  return (
    <div className="border border-amber-100/10 hover:border-amber-100/25 transition-colors p-4 mb-3 group">
      <button onClick={() => onOpen(casting)} className="text-left w-full">
        <div
          className="text-xs text-amber-100/40 mb-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {dateStr} · {casting.sealed ? 'sealed' : 'unsealed'}
        </div>
        <div
          className="text-amber-50/80 mb-2 line-clamp-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontStyle: 'italic' }}
        >
          {casting.question || '(no question)'}
        </div>
        <div
          className="text-xs text-amber-100/45"
          style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}
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

// --- Main App ---------------------------------------------

export default function App() {
  // BYOK key — null = unset (show KeyEntry gate); otherwise the user's key
  const [apiKey, setApiKey] = useState(() => loadApiKey() || null);
  const [showKeyEntry, setShowKeyEntry] = useState(false);

  const [stage, setStage] = useState('home'); // home | setup | casting | seal | view | archive
  const [castings, setCastings] = useState([]);
  const [activeCasting, setActiveCasting] = useState(null);
  const [error, setError] = useState('');
  const [isCasting, setIsCasting] = useState(false);
  const abortRef = useRef(null);

  // Load past castings on mount.
  useEffect(() => {
    setCastings(loadCastings());
  }, []);

  async function beginCasting({ question, sourceText, turnCount }) {
    setError('');
    const seed = fnv1a((question || '') + '|' + sourceText);
    const prng = mulberry32(seed);
    const sequence = shuffle(OPERATOR_KEYS, prng).slice(0, turnCount);
    const casting = {
      timestamp: Date.now(),
      question,
      sourceText,
      seed,
      turns: sequence.map((k) => ({ operatorKey: k, transformed: '', judgment: '' })),
      sealed: false,
    };
    setActiveCasting(casting);
    setStage('casting');
    setIsCasting(true);

    abortRef.current = new AbortController();
    let currentText = sourceText;
    const accumulated = [...casting.turns];
    try {
      for (let i = 0; i < sequence.length; i++) {
        const result = await castOperator({
          operatorKey: sequence[i],
          sourceText: currentText,
          question,
          apiKey,
          signal: abortRef.current.signal,
        });
        accumulated[i] = { ...accumulated[i], ...result };
        const updated = { ...casting, turns: [...accumulated] };
        setActiveCasting(updated);
        currentText = result.transformed || currentText;
      }
      setStage('seal');
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Casting interrupted.');
      } else {
        setError(e.message || String(e));
        setStage('home');
      }
    } finally {
      setIsCasting(false);
    }
  }

  function abort() {
    if (abortRef.current) abortRef.current.abort();
    setStage('home');
    setActiveCasting(null);
    setIsCasting(false);
  }

  function seal() {
    if (!activeCasting) return;
    const sealed = { ...activeCasting, sealed: true };
    saveCasting(sealed);
    setActiveCasting(sealed);
    setCastings(loadCastings());
    setStage('view');
  }

  function leaveUnsealed() {
    if (!activeCasting) return;
    saveCasting(activeCasting);
    setCastings(loadCastings());
    setStage('home');
    setActiveCasting(null);
  }

  function deleteFromArchive(timestamp) {
    deleteCasting(timestamp);
    setCastings(loadCastings());
  }

  function openFromArchive(casting) {
    setActiveCasting(casting);
    setStage('view');
  }

  function revokeKey() {
    if (!confirm('Remove your API key from this browser? You can re-enter it anytime.')) return;
    clearApiKey();
    setApiKey(null);
    setShowKeyEntry(false);
  }

  // --- Render -----------------------------------------------

  // Gate: no key, no Mandala.
  if (!apiKey || showKeyEntry) {
    return (
      <div className="min-h-screen w-full text-amber-50/90">
        <header className="max-w-3xl mx-auto px-6 pt-8 pb-2 flex items-baseline justify-between">
          <span
            className="text-xs uppercase tracking-[0.35em] text-amber-100/40"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            The Mandala Oracle
          </span>
        </header>
        <KeyEntry
          onSaved={(k) => {
            setApiKey(k);
            setShowKeyEntry(false);
          }}
          onCancel={apiKey ? () => setShowKeyEntry(false) : undefined}
        />
        <footer
          className="max-w-3xl mx-auto px-6 pb-8 text-center text-xs text-amber-100/25"
          style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em' }}
        >
          ∮ = 1 · CC BY 4.0 · Crimson Hexagonal Archive
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-amber-50/90">
      {/* Header */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-2 flex items-baseline justify-between gap-4">
        <button
          onClick={() => {
            setStage('home');
            setActiveCasting(null);
            setError('');
          }}
          className="text-xs uppercase tracking-[0.35em] text-amber-100/40 hover:text-amber-100/70 transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          The Mandala Oracle
        </button>
        <div className="flex items-baseline gap-4">
          <button
            onClick={() => setStage('archive')}
            className="text-xs uppercase tracking-[0.25em] text-amber-100/35 hover:text-amber-100/65 transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            archive · {castings.length}
          </button>
          <button
            onClick={revokeKey}
            title="Remove your API key from this browser"
            className="text-xs uppercase tracking-[0.25em] text-amber-100/25 hover:text-amber-100/55 transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            key
          </button>
        </div>
      </header>

      <main className="pb-20">
        {/* HOME */}
        {stage === 'home' && (
          <div
            className="flex flex-col items-center justify-center min-h-[70vh] px-6"
            style={{ animation: 'subtleFade 1.5s ease-out' }}
          >
            <Pearl onClick={() => setStage('setup')} size={220} />
            <p
              className="mt-12 text-amber-100/45 text-center max-w-md italic"
              style={{ fontSize: '1.15rem', lineHeight: 1.6 }}
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

        {/* SETUP */}
        {stage === 'setup' && (
          <div style={{ animation: 'subtleFade 0.8s ease-out' }}>
            <CastingForm onBegin={beginCasting} onCancel={() => setStage('home')} />
          </div>
        )}

        {/* CASTING */}
        {stage === 'casting' && activeCasting && (
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
                  style={{ fontSize: '1.15rem' }}
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
                    style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}
                  >
                    interrupt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEAL */}
        {stage === 'seal' && activeCasting && (
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
            <SealMoment onSeal={seal} onCancel={leaveUnsealed} />
          </div>
        )}

        {/* VIEW */}
        {stage === 'view' && activeCasting && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8">
              <div
                className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {activeCasting.sealed ? 'Sealed casting' : 'Unsealed casting'}
              </div>
              {activeCasting.question && (
                <p className="text-amber-50/70 italic" style={{ fontSize: '1.15rem' }}>
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
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', letterSpacing: '0.2em' }}
                >
                  ∮ = 1
                </div>
              )}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setStage('home');
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
        {stage === 'archive' && (
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
                onClick={() => setStage('home')}
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
        style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em' }}
      >
        ∮ = 1 · CC BY 4.0 · Crimson Hexagonal Archive
      </footer>
    </div>
  );
}
