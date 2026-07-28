import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SEED_PORTFOLIOS } from './src/data/seedData';
import { PortfolioData } from './src/types';
import { generateOgImageSvg } from './src/utils/ogImageGenerator';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory / File Database store
let portfoliosStore: Record<string, PortfolioData> = { ...SEED_PORTFOLIOS };

// Load existing DB if available
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      portfoliosStore = { ...SEED_PORTFOLIOS, ...parsed };
    }
  } catch (err) {
    console.warn('Could not parse db.json, using seed portfolios:', err);
  }
} else {
  // Save seed data to disk initial
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(portfoliosStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write seed db:', e);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(portfoliosStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// GitHub API cache store (username -> { timestamp, data })
const githubCache: Record<string, { timestamp: number; data: any[] }> = {};
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

// GEMINI AI Client (lazy initialization)
let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Check username availability
app.get('/api/auth/check-username', (req, res) => {
  const username = String(req.query.username || '').toLowerCase().trim();
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Reserved handles
  const reserved = ['api', 'dashboard', 'admin', 'embed', 'login', 'register', 'auth', 'public', 'settings'];
  if (reserved.includes(username)) {
    return res.json({ available: false, reason: 'Reserved username handle' });
  }

  const exists = Boolean(portfoliosStore[username]);
  res.json({ available: !exists });
});

// 3. Register new account
app.post('/api/auth/register', (req, res) => {
  const { username, displayName, email, githubUsername } = req.body;
  const handle = String(username || '').toLowerCase().trim();

  if (!handle || handle.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  if (portfoliosStore[handle]) {
    return res.status(400).json({ error: 'Username is already taken.' });
  }

  const newPortfolio: PortfolioData = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: handle,
    updatedAt: new Date().toISOString(),
    profile: {
      displayName: displayName || handle,
      tagline: 'Full-Stack Developer & Innovator',
      bio: 'Welcome to my portfolio forge page! I design and engineer scalable web products.',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}`,
      location: 'Global',
      resumeUrl: '',
      githubUsername: githubUsername || handle,
      theme: 'dark',
      accentColor: '#3b82f6',
      socialLinks: {
        github: githubUsername ? `https://github.com/${githubUsername}` : '',
      },
    },
    achievements: [
      {
        id: `ach_${Date.now()}`,
        title: 'Joined Portfolio Forge',
        description: 'Created a unified live developer portfolio.',
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: 'code',
      },
    ],
    projects: [],
  };

  portfoliosStore[handle] = newPortfolio;
  saveDb();

  res.json({ success: true, portfolio: newPortfolio });
});

// 4. List all public handles (Directory)
app.get('/api/portfolios', (_req, res) => {
  const list = Object.values(portfoliosStore).map((p) => ({
    username: p.username,
    displayName: p.profile.displayName,
    tagline: p.profile.tagline,
    avatarUrl: p.profile.avatarUrl,
    theme: p.profile.theme,
    projectCount: p.projects.length,
    updatedAt: p.updatedAt,
  }));
  res.json(list);
});

// 5. Get portfolio by username
app.get('/api/portfolio/:username', (req, res) => {
  const handle = String(req.params.username || '').toLowerCase().trim();
  const portfolio = portfoliosStore[handle];

  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  res.json(portfolio);
});

// 6. Save or Update portfolio by username
app.put('/api/portfolio/:username', (req, res) => {
  const handle = String(req.params.username || '').toLowerCase().trim();
  const updatedData: PortfolioData = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  updatedData.username = handle;
  updatedData.updatedAt = new Date().toISOString();

  portfoliosStore[handle] = updatedData;
  saveDb();

  res.json({ success: true, portfolio: updatedData });
});

// 7. GitHub Proxy & Server Caching API
app.get('/api/github/repos/:username', async (req, res) => {
  const rawUser = String(req.params.username || '').trim();
  const ghUser = rawUser
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@+/, '')
    .split('/')[0]
    .trim();

  if (!ghUser) {
    return res.status(400).json({ error: 'GitHub username required' });
  }

  const now = Date.now();
  const cached = githubCache[ghUser.toLowerCase()];

  // Return cached if fresh
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return res.json({ repos: cached.data, cached: true, timestamp: cached.timestamp });
  }

  try {
    const ghRes = await fetch(`https://api.github.com/users/${ghUser}/repos?sort=updated&per_page=100`, {
      headers: {
        'User-Agent': 'PortfolioForge-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (ghRes.status === 403) {
      // Rate limit hit
      console.warn(`GitHub API Rate limit hit for user ${ghUser}`);
      if (cached) {
        return res.json({
          repos: cached.data,
          cached: true,
          rateLimitHit: true,
          message: 'GitHub rate limit reached; returning cached data.',
        });
      }
      return res.status(403).json({
        error: 'GitHub API rate limit reached. Please try again later or add manual projects.',
        rateLimitHit: true,
      });
    }

    if (!ghRes.ok) {
      return res.status(ghRes.status).json({ error: `GitHub user '${ghUser}' not found or error occurred.` });
    }

    const reposData = await ghRes.json();
    if (!Array.isArray(reposData)) {
      return res.status(500).json({ error: 'Unexpected response from GitHub' });
    }

    const cleanRepos = reposData.map((repo: any) => ({
      id: `gh_${repo.id}`,
      title: repo.name,
      description: repo.description || 'Public repository on GitHub.',
      source: 'github',
      repoUrl: repo.html_url,
      hostedUrl: repo.homepage || '',
      techStack: repo.language ? [repo.language] : ['Code'],
      githubStats: {
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'Code',
        updatedAt: repo.updated_at,
      },
    }));

    // Cache in memory
    githubCache[ghUser.toLowerCase()] = {
      timestamp: now,
      data: cleanRepos,
    };

    res.json({ repos: cleanRepos, cached: false });
  } catch (err: any) {
    console.error('Error fetching GitHub repos:', err);
    if (cached) {
      return res.json({ repos: cached.data, cached: true, errorFallback: true });
    }
    res.status(500).json({ error: 'Failed to connect to GitHub API' });
  }
});

// 8. Gemini AI Enhancer endpoint
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { type, content, role } = req.body;
    const ai = getAi();

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    let prompt = '';
    if (type === 'bio') {
      prompt = `You are an expert developer career strategist. Enhance the following developer biography to be engaging, professional, concise (2-3 sentences), and impactful for potential employers or tech collaborators.
Role/Tagline: "${role || ''}"
Current Bio: "${content || ''}"

Return ONLY the polished bio text without quotation marks or conversational filler.`;
    } else if (type === 'project') {
      prompt = `You are a technical editor. Enhance this software project description to highlight the key engineering value, technical highlights, and capabilities concisely (1-2 sentences).
Project details: "${content || ''}"

Return ONLY the improved technical description without conversational preamble.`;
    } else {
      prompt = `Refine the following developer profile content concisely: "${content}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const result = response.text?.trim() || content;
    res.json({ result });
  } catch (err: any) {
    console.error('AI Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI response' });
  }
});

// 9. Embeddable Widget JS script
app.get('/api/embed.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const embedCode = `
(function() {
  const scripts = document.getElementsByTagName('script');
  let user = 'alexdev';
  for (let s of scripts) {
    if (s.src && s.src.includes('/api/embed.js') && s.getAttribute('data-user')) {
      user = s.getAttribute('data-user');
      break;
    }
  }

  const container = document.createElement('div');
  container.className = 'portfolio-forge-embed';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.border = '1px solid rgba(255,255,255,0.15)';
  container.style.borderRadius = '16px';
  container.style.padding = '20px';
  container.style.background = '#0f172a';
  container.style.color = '#f8fafc';
  container.style.maxWidth = '480px';
  container.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.5)';

  container.innerHTML = \`<div style="text-align:center; padding: 20px;"><div style="display:inline-block; width:24px; height:24px; border:2px solid #06b6d4; border-top-color:transparent; border-radius:50%; animation:pfspin 0.8s linear infinite;"></div><style>@keyframes pfspin{to{transform:rotate(360deg)}}</style></div>\`;

  document.currentScript ? document.currentScript.parentNode.insertBefore(container, document.currentScript) : document.body.appendChild(container);

  fetch(\`/api/portfolio/\${user}\`)
    .then(r => r.json())
    .then(data => {
      if (!data || !data.profile) return;
      const p = data.profile;
      const projects = (data.projects || []).slice(0, 3);
      
      let projHtml = projects.map(pr => \`
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-top: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-weight: 600; font-size: 14px; color: #38bdf8; display:flex; justify-content:space-between; align-items:center;">
            <span>\${pr.title}</span>
            \${pr.githubStats ? \`<span style="font-size:11px; color:#94a3b8;">★ \${pr.githubStats.stars}</span>\` : ''}
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">\${pr.description}</div>
        </div>
      \`).join('');

      container.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
          <img src="\${p.avatarUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #06b6d4;" />
          <div>
            <div style="font-weight: 700; font-size: 16px;">\${p.displayName}</div>
            <div style="font-size: 12px; color: #94a3b8;">\${p.tagline}</div>
          </div>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 10px;">Featured Projects</div>
        \${projHtml || '<div style="font-size:12px; color:#64748b; padding:8px 0;">No projects listed yet.</div>'}
        <div style="margin-top: 16px; text-align: right;">
          <a href="/#/\${data.username}" target="_blank" style="font-size: 12px; color: #06b6d4; text-decoration: none; font-weight: 600;">View Full Portfolio Forge ➔</a>
        </div>
      \`;
    })
    .catch(err => {
      container.innerHTML = '<div style="font-size:12px; color:#ef4444;">Failed to load Portfolio Forge widget.</div>';
    });
})();
  `;
  res.send(embedCode);
});

// 10. Dynamic Open Graph SVG Card Endpoint
app.get('/api/og-image/:username', (req, res) => {
  const handle = String(req.params.username || '').toLowerCase().trim();
  const portfolio = portfoliosStore[handle] || portfoliosStore['alexdev'] || Object.values(portfoliosStore)[0];

  if (!portfolio) {
    return res.status(404).send('Portfolio not found');
  }

  const reqHost = req.headers.host || 'portfolioforge.dev';
  const svg = generateOgImageSvg(portfolio, reqHost);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(svg);
});

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectOgMetaTags(html: string, portfolio: PortfolioData, reqHost: string, fullUrl: string): string {
  const profile = portfolio.profile || ({} as Partial<PortfolioData['profile']>);
  const displayName = profile.displayName || portfolio.username || 'Developer';
  const tagline = profile.tagline || 'Developer & Innovator';
  const bio = profile.bio || `${displayName}'s developer portfolio featuring projects, tech stack, and achievements.`;
  const title = `${displayName} — ${tagline} | Portfolio Forge`;
  const ogImageUrl = `https://${reqHost}/api/og-image/${portfolio.username}`;

  const metaTags = `
    <!-- Dynamic Open Graph Meta Tags -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(bio)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Portfolio Forge" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(bio)}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:type" content="image/svg+xml" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(fullUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(bio)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
  `;

  let cleaned = html.replace(/<title>.*?<\/title>/gi, '');
  return cleaned.replace('</head>', `${metaTags}\n</head>`);
}

// ==========================================
// VITE / STATIC SERVING HANDLER WITH OG TAG INJECTION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Custom middleware to intercept HTML requests and inject OG meta tags
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }

      // Check if handle is specified in query or path (e.g. /u/alexdev or ?u=alexdev)
      let targetUser = 'alexdev';
      if (req.path.startsWith('/u/')) {
        targetUser = req.path.replace('/u/', '').trim().toLowerCase();
      } else if (req.query.u) {
        targetUser = String(req.query.u).trim().toLowerCase();
      }

      const portfolio = portfoliosStore[targetUser] || portfoliosStore['alexdev'];
      if (!portfolio) {
        return next();
      }

      try {
        const rawIndex = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(req.url, rawIndex);
        const finalHtml = injectOgMetaTags(
          transformedHtml,
          portfolio,
          req.headers.host || '',
          `https://${req.headers.host || ''}/#/${portfolio.username}`
        );
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      let targetUser = 'alexdev';
      if (req.path.startsWith('/u/')) {
        targetUser = req.path.replace('/u/', '').trim().toLowerCase();
      } else if (req.query.u) {
        targetUser = String(req.query.u).trim().toLowerCase();
      }

      const portfolio = portfoliosStore[targetUser] || portfoliosStore['alexdev'];
      const rawIndex = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

      if (portfolio) {
        const finalHtml = injectOgMetaTags(
          rawIndex,
          portfolio,
          req.headers.host || '',
          `https://${req.headers.host || ''}/#/${portfolio.username}`
        );
        res.setHeader('Content-Type', 'text/html');
        return res.send(finalHtml);
      }

      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Forge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
