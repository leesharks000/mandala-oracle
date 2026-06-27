// ============================================================
//  ANTHROPIC API CLIENT — Browser-direct BYOK
//
//  The user's API key is supplied at runtime, stored client-side
//  in localStorage. Calls go directly to api.anthropic.com using
//  the anthropic-dangerous-direct-browser-access header.
//
//  The "dangerous" naming is a deliberate warning: shipping a
//  developer's own key in client code would expose it. For BYOK,
//  the key belongs to the user, who already controls their own
//  browser — there is no leakage they can't see themselves.
// ============================================================

import { OPERATORS } from './operators.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
export const DEFAULT_MODEL = 'claude-sonnet-4-6';

/**
 * Cast a single operator turn against the Anthropic API.
 *
 * @param {Object} params
 * @param {string} params.operatorKey   - SHADOW | MIRROR | INVERSION | ...
 * @param {string} params.sourceText    - text to transform
 * @param {string} params.question      - held-silently question (may be empty)
 * @param {string} params.apiKey        - user's Anthropic API key
 * @param {string} [params.model]       - model string (defaults to claude-sonnet-4-6)
 * @param {AbortSignal} [params.signal] - for cancellation
 * @returns {Promise<{transformed: string, judgment: string}>}
 */
export async function castOperator({
  operatorKey,
  sourceText,
  question,
  apiKey,
  model = DEFAULT_MODEL,
  signal,
}) {
  if (!apiKey) {
    throw new Error('No API key. Enter your Anthropic API key to cast.');
  }
  const op = OPERATORS[operatorKey];
  if (!op) {
    throw new Error(`Unknown operator: ${operatorKey}`);
  }

  const userMsg = `QUESTION (held silently): ${question || '(no question — let the text speak)'}

SOURCE TEXT:
${sourceText}`;

  let response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        system: op.prompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error(`Network error reaching Anthropic API: ${e.message}`);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const e = await response.json();
      detail = e?.error?.message || JSON.stringify(e);
    } catch {}
    // Surface 401 specifically — most likely a bad/revoked key
    if (response.status === 401) {
      throw new Error('Authentication failed. Check your API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited or out of credit. Check usage at console.anthropic.com.');
    }
    throw new Error(`API ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Parse transformed text and judgment.
  let transformed = text;
  let judgment = '';
  const idx = text.indexOf('---JUDGMENT---');
  if (idx >= 0) {
    transformed = text.slice(0, idx).trim();
    judgment = text
      .slice(idx + '---JUDGMENT---'.length)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return { transformed, judgment };
}

/**
 * Quick key sanity check — fires a 1-token request to verify the key works.
 * Returns true on success, throws on failure.
 */
export async function validateKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    throw new Error('API keys begin with "sk-ant-". Check what you pasted.');
  }
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ok' }],
    }),
  });
  if (response.status === 401) {
    throw new Error('Key rejected. Check what you pasted or rotate at console.anthropic.com.');
  }
  if (!response.ok) {
    let detail = '';
    try {
      const e = await response.json();
      detail = e?.error?.message || JSON.stringify(e);
    } catch {}
    throw new Error(`Validation failed: ${response.status} ${detail}`);
  }
  return true;
}
