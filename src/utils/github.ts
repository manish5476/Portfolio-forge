/**
 * Cleans user input for GitHub handles/URLs into a pure handle string.
 * Examples:
 *  - "https://github.com/octocat" -> "octocat"
 *  - "github.com/octocat/" -> "octocat"
 *  - "@octocat" -> "octocat"
 *  - "octocat" -> "octocat"
 */
export function cleanGithubHandle(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^@+/, '')
    .split('/')[0]
    .split('?')[0]
    .trim();
}

export function parseMultipleHandles(rawInput: string): string[] {
  if (!rawInput) return [];
  return rawInput
    .split(/[,;\s]+/)
    .map(cleanGithubHandle)
    .filter(Boolean);
}

export function getGithubHandlesList(primary?: string, list?: string[]): string[] {
  const set = new Set<string>();
  if (primary) {
    const cleaned = cleanGithubHandle(primary);
    if (cleaned) set.add(cleaned);
  }
  if (list && Array.isArray(list)) {
    list.forEach((item) => {
      const cleaned = cleanGithubHandle(item);
      if (cleaned) set.add(cleaned);
    });
  }
  return Array.from(set);
}
