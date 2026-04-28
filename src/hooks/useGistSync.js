const FILENAME = 'himekuri-events.json';
const DESCRIPTION = 'himekuri-calendar-events';
const GIST_ID_KEY = 'himekuri-gist-id';

function headers(pat) {
  return {
    Authorization: `token ${pat}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

async function findOrCreateGist(pat) {
  const cached = localStorage.getItem(GIST_ID_KEY);
  if (cached) return cached;

  // Search existing gists for our file
  const res = await fetch('https://api.github.com/gists?per_page=100', { headers: headers(pat) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const list = await res.json();
  const found = list.find(g => g.description === DESCRIPTION);
  if (found) {
    localStorage.setItem(GIST_ID_KEY, found.id);
    return found.id;
  }

  // Create new private gist
  const create = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: headers(pat),
    body: JSON.stringify({
      description: DESCRIPTION,
      public: false,
      files: { [FILENAME]: { content: '[]' } },
    }),
  });
  if (!create.ok) throw new Error(`Gist create error: ${create.status}`);
  const gist = await create.json();
  localStorage.setItem(GIST_ID_KEY, gist.id);
  return gist.id;
}

export async function loadFromGist(pat) {
  const id = await findOrCreateGist(pat);
  const res = await fetch(`https://api.github.com/gists/${id}`, { headers: headers(pat) });
  if (!res.ok) throw new Error(`Gist load error: ${res.status}`);
  const data = await res.json();
  const content = data.files?.[FILENAME]?.content || '[]';
  return JSON.parse(content);
}

export async function saveToGist(pat, events) {
  const id = await findOrCreateGist(pat);
  const res = await fetch(`https://api.github.com/gists/${id}`, {
    method: 'PATCH',
    headers: headers(pat),
    body: JSON.stringify({
      files: { [FILENAME]: { content: JSON.stringify(events) } },
    }),
  });
  if (!res.ok) throw new Error(`Gist save error: ${res.status}`);
}

export function clearGistCache() {
  localStorage.removeItem(GIST_ID_KEY);
}
