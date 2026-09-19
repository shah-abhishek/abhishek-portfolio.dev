export const GITHUB_USERNAME = "shah-abhishek";

const CACHE_KEY = `github-repos:${GITHUB_USERNAME}`;
const CACHE_TTL_MS = 60 * 60 * 1000; // unauthenticated API allows 60 req/hour per IP

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.repos;
  } catch {
    // storage unavailable or corrupt — fall through to network
  }
  return null;
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export async function fetchGithubRepos(signal) {
  const cached = readCache();
  if (cached) return cached;

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
    { signal, headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);

  const repos = (await res.json()).map((r) => ({
    name: r.name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage,
    language: r.language,
    topics: r.topics || [],
    stars: r.stargazers_count,
    fork: r.fork,
    archived: r.archived,
  }));
  writeCache(repos);
  return repos;
}
