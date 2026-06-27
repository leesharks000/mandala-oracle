import React, { useState } from 'react';
import { validateKey } from '../api.js';
import { saveApiKey } from '../storage.js';

/**
 * KeyEntry — first-touch BYOK flow.
 * Renders when no key is in localStorage, or when invoked via Settings.
 *
 * Props:
 *   onSaved(key)  — called after a key is validated and persisted
 *   onCancel?()   — optional; if absent, no cancel option is shown
 */
export default function KeyEntry({ onSaved, onCancel }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | validating | error
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter your API key.');
      return;
    }
    setStatus('validating');
    try {
      await validateKey(trimmed);
      saveApiKey(trimmed);
      onSaved(trimmed);
    } catch (e) {
      setStatus('error');
      setError(e.message || String(e));
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10" style={{ animation: 'subtleFade 0.8s ease-out' }}>
      <div className="mb-8">
        <div
          className="text-xs uppercase tracking-[0.3em] text-amber-100/40 mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Bring your own key
        </div>
        <p
          className="text-amber-50/75 leading-relaxed mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}
        >
          The Mandala calls the Anthropic API directly from your browser using your own key.
          Nothing is sent to any other server — no proxy, no backend, no telemetry.
        </p>
        <p
          className="text-amber-100/55 leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}
        >
          Your key is saved in this browser only (localStorage). You can revoke or rotate it
          anytime from the header. To create a new key, visit{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-200/80 underline decoration-amber-200/30 hover:decoration-amber-200/70"
          >
            console.anthropic.com/settings/keys
          </a>
          .
        </p>
      </div>

      <div className="mb-6">
        <label
          className="block text-xs uppercase tracking-[0.25em] text-amber-100/40 mb-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          htmlFor="api-key-input"
        >
          Anthropic API key
        </label>
        <input
          id="api-key-input"
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder="sk-ant-..."
          className="w-full bg-transparent border-b border-amber-100/15 focus:border-amber-100/40 outline-none py-2 text-amber-50/85 placeholder:text-amber-100/25"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.95rem' }}
          disabled={status === 'validating'}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={status === 'validating' || !value.trim()}
          className="px-6 py-2 border border-amber-200/50 text-amber-100 hover:bg-amber-100/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
          }}
        >
          {status === 'validating' ? 'Validating…' : 'Save key'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-amber-100/40 hover:text-amber-100/70 transition-colors"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
            }}
          >
            cancel
          </button>
        )}
      </div>

      {error && (
        <div
          className="mt-6 text-red-300/80 text-sm border border-red-300/20 rounded-sm px-3 py-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem' }}
        >
          {error}
        </div>
      )}

      <div
        className="mt-12 pt-6 border-t border-amber-100/10 text-xs text-amber-100/40 leading-relaxed"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <p className="mb-2">Cost: A typical 7-turn casting against Claude Sonnet 4.6 runs a few cents in API usage. You pay Anthropic directly — the Mandala adds nothing.</p>
        <p>Privacy: The casting text and the operator prompts go from your browser to api.anthropic.com and back. Nothing routes through any third party.</p>
      </div>
    </div>
  );
}
