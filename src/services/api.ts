import { PortfolioData, Project } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Real-time Firebase Firestore Subscription
 * Sets up a live WebSocket / snapshot connection to receive real-time portfolio updates.
 */
export function subscribeToPortfolio(
  username: string,
  onUpdate: (data: PortfolioData | null) => void
): () => void {
  const handle = username.toLowerCase().trim();
  const path = `portfolios/${handle}`;
  const docRef = doc(db, 'portfolios', handle);

  // Initial fetch fallback
  fetchPortfolio(handle).then((initial) => {
    if (initial) onUpdate(initial);
  });

  // Listen to live updates via Firebase Firestore onSnapshot
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as PortfolioData);
      }
    },
    (err) => {
      console.warn('Real-time connection warning:', err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function fetchPortfolio(username: string): Promise<PortfolioData | null> {
  const handle = username.toLowerCase().trim();
  const path = `portfolios/${handle}`;

  try {
    // 1. Try Firestore document lookup
    const docRef = doc(db, 'portfolios', handle);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as PortfolioData;
    }

    // 2. Fallback to API endpoint if not in Firestore yet
    const res = await fetch(`/api/portfolio/${handle}`);
    if (res.ok) {
      const data: PortfolioData = await res.json();
      // Seed Firestore with server initial portfolio
      try {
        await setDoc(docRef, data);
      } catch (e) {
        console.warn('Initial seed to Firestore skipped:', e);
      }
      return data;
    }

    return null;
  } catch (err) {
    console.warn('Firestore fetch error, attempting fallback server API:', err);
    try {
      const res = await fetch(`/api/portfolio/${handle}`);
      if (res.ok) return await res.json();
    } catch (fallbackErr) {
      handleFirestoreError(err, OperationType.GET, path);
    }
    return null;
  }
}

export async function savePortfolio(username: string, data: PortfolioData): Promise<boolean> {
  const handle = username.toLowerCase().trim();
  const path = `portfolios/${handle}`;

  try {
    // Save to Firestore
    const docRef = doc(db, 'portfolios', handle);
    await setDoc(docRef, data);

    // Sync back to Express backend server
    fetch(`/api/portfolio/${handle}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((e) => console.warn('Express server sync warning:', e));

    return true;
  } catch (err) {
    console.error('savePortfolio error in Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function checkUsernameAvailable(username: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
    return await res.json();
  } catch (err) {
    return { available: false, reason: 'Network error checking username' };
  }
}

export async function registerUser(username: string, displayName: string, githubUsername?: string): Promise<{ success: boolean; portfolio?: PortfolioData; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, githubUsername }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }
    return { success: true, portfolio: data.portfolio };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server error during registration' };
  }
}

export async function fetchGitHubRepos(githubUsername: string): Promise<{ repos: Project[]; cached?: boolean; rateLimitHit?: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/github/repos/${encodeURIComponent(githubUsername)}`);
    const data = await res.json();
    if (!res.ok) {
      return { repos: [], error: data.error || 'Failed to fetch GitHub repos', rateLimitHit: data.rateLimitHit };
    }
    return { repos: data.repos || [], cached: data.cached, rateLimitHit: data.rateLimitHit };
  } catch (err: any) {
    return { repos: [], error: 'Network error connecting to GitHub service' };
  }
}

export async function enhanceWithAI(type: 'bio' | 'project', content: string, role?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content, role }),
    });
    const data = await res.json();
    if (res.ok && data.result) {
      return data.result;
    }
    throw new Error(data.error || 'AI enhancement unavailable');
  } catch (err) {
    console.warn('AI Enhance failed:', err);
    return content; // Fallback to original content
  }
}

export function generateStaticHTML(data: PortfolioData): string {
  const p = data.profile;
  const accent = p.accentColor || '#06b6d4';
  
  const projectsHtml = data.projects.map(pr => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; transition: transform 0.2s, border-color 0.2s;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <h3 style="font-size:1.1rem; font-weight:700; color:#fff; margin:0;">${pr.title}</h3>
        ${pr.githubStats ? `<span style="font-size:0.8rem; color:#94a3b8; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:20px;">★ ${pr.githubStats.stars} | ⑂ ${pr.githubStats.forks}</span>` : ''}
      </div>
      <p style="font-size:0.9rem; color:#cbd5e1; margin:12px 0; line-height:1.5;">${pr.description}</p>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:12px;">
        ${pr.techStack.map(t => `<span style="font-size:0.75rem; background:rgba(255,255,255,0.06); color:${accent}; padding:2px 8px; border-radius:4px;">${t}</span>`).join('')}
      </div>
      <div style="margin-top:16px; display:flex; gap:12px; font-size:0.85rem;">
        ${pr.repoUrl ? `<a href="${pr.repoUrl}" target="_blank" style="color:${accent}; text-decoration:none; font-weight:600;">GitHub Repo ↗</a>` : ''}
        ${pr.hostedUrl ? `<a href="${pr.hostedUrl}" target="_blank" style="color:#38bdf8; text-decoration:none; font-weight:600;">Live Demo ↗</a>` : ''}
      </div>
    </div>
  `).join('');

  const achievementsHtml = data.achievements.map(a => `
    <div style="background:rgba(255,255,255,0.02); border-left:3px solid ${accent}; padding:12px 16px; margin-bottom:12px; border-radius:0 8px 8px 0;">
      <div style="font-weight:600; color:#fff;">${a.title} <span style="font-size:0.8rem; color:#94a3b8; float:right;">${a.date}</span></div>
      <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">${a.description}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.displayName} — Portfolio</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #f8fafc; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
    header { display: flex; align-items: center; gap: 24px; margin-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 40px; }
    .avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid ${accent}; }
    .h1 { font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
    .tagline { font-size: 1.1rem; color: ${accent}; font-weight: 600; margin-top: 4px; }
    .bio { color: #94a3b8; margin-top: 12px; max-width: 650px; }
    section { margin-bottom: 48px; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .footer { text-align: center; font-size: 0.85rem; color: #64748b; margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <img src="${p.avatarUrl}" alt="${p.displayName}" class="avatar" />
      <div>
        <h1 class="h1">${p.displayName}</h1>
        <div class="tagline">${p.tagline}</div>
        <div class="bio">${p.bio}</div>
      </div>
    </header>

    ${data.achievements.length ? `
    <section>
      <div class="section-title">Highlights & Achievements</div>
      ${achievementsHtml}
    </section>
    ` : ''}

    <section>
      <div class="section-title">Featured Projects</div>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </section>

    <div class="footer">
      Generated with Portfolio Forge • ${p.displayName}
    </div>
  </div>
</body>
</html>`;
}
