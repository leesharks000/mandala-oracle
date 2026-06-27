// ============================================================
//  STORAGE LAYER — localStorage adapter
//
//  Castings persist as `mandala:casting:<timestamp>` keys.
//  The user's API key persists as `mandala:apiKey`.
//  Nothing leaves the browser except API calls.
// ============================================================

const CASTING_PREFIX = 'mandala:casting:';
const KEY_STORAGE = 'mandala:apiKey';

// --- Castings ---

export function saveCasting(casting) {
  try {
    localStorage.setItem(
      `${CASTING_PREFIX}${casting.timestamp}`,
      JSON.stringify(casting)
    );
  } catch (e) {
    console.error('save failed', e);
  }
}

export function loadCastings() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CASTING_PREFIX)) {
        try {
          out.push(JSON.parse(localStorage.getItem(k)));
        } catch {}
      }
    }
    out.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error('load failed', e);
  }
  return out;
}

export function deleteCasting(timestamp) {
  try {
    localStorage.removeItem(`${CASTING_PREFIX}${timestamp}`);
  } catch {}
}

// --- API key ---

export function saveApiKey(apiKey) {
  try {
    if (apiKey) localStorage.setItem(KEY_STORAGE, apiKey);
    else localStorage.removeItem(KEY_STORAGE);
  } catch (e) {
    console.error('key save failed', e);
  }
}

export function loadApiKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {}
}
