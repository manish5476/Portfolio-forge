import { PortfolioData, Profile } from '../types';

function escapeXml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateOgImageSvg(portfolio: PortfolioData, reqHost: string = ''): string {
  const profile: Partial<Profile> = portfolio?.profile || {};
  const name = escapeXml(profile.displayName || portfolio?.username || 'Developer');
  const tagline = escapeXml(profile.tagline || 'Software Engineer & Innovator');
  const rawBio = profile.bio || '';
  const bio = escapeXml(rawBio.substring(0, 110) + (rawBio.length > 110 ? '...' : ''));
  const projectsCount = portfolio?.projects?.length || 0;
  const avatarUrl = profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${portfolio?.username || 'dev'}`;

  // Extract unique top 4 tech tags
  const techSet = new Set<string>();
  (portfolio?.projects || []).forEach((p) => {
    (p.techStack || []).forEach((t) => {
      if (t) techSet.add(t);
    });
  });
  const topTech = Array.from(techSet).slice(0, 4);

  const techBadgesSvg = topTech
    .map(
      (tech, idx) => `
      <g transform="translate(${idx * 130}, 0)">
        <rect width="115" height="34" rx="10" fill="#0f172a" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="1.5" />
        <text x="57" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#38bdf8" text-anchor="middle">#${escapeXml(
          tech
        )}</text>
      </g>
    `
    )
    .join('');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Canvas -->
    <rect width="1200" height="630" fill="#030712"/>

    <!-- Ambient Mesh Glow Gradients -->
    <circle cx="200" cy="150" r="350" fill="#06b6d4" fill-opacity="0.15" filter="blur(80px)" />
    <circle cx="1000" cy="500" r="400" fill="#3b82f6" fill-opacity="0.12" filter="blur(100px)" />
    <circle cx="600" cy="300" r="250" fill="#8b5cf6" fill-opacity="0.08" filter="blur(90px)" />

    <!-- Grid Pattern Overlay -->
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#030712" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#67e8f9"/>
      </linearGradient>
      <clipPath id="avatarClip">
        <circle cx="140" cy="220" r="70" />
      </clipPath>
    </defs>
    <rect width="1200" height="630" fill="url(#grid)" />

    <!-- Outer Card Frame -->
    <rect x="50" y="50" width="1100" height="530" rx="32" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5" />
    <rect x="50" y="50" width="1100" height="530" rx="32" fill="none" stroke="#06b6d4" stroke-opacity="0.3" stroke-width="1" />

    <!-- Top Left Header Tag -->
    <g transform="translate(90, 95)">
      <rect width="180" height="32" rx="16" fill="#082f49" stroke="#0e7490" stroke-width="1"/>
      <circle cx="20" cy="16" r="5" fill="#22d3ee"/>
      <text x="35" y="21" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#67e8f9" letter-spacing="1">LIVE PORTFOLIO</text>
    </g>

    <!-- Top Right Stats Pill -->
    <g transform="translate(870, 95)">
      <rect width="190" height="36" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
      <text x="95" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="middle">
        <tspan fill="#38bdf8" font-weight="900">${projectsCount}</tspan> Projects Featured
      </text>
    </g>

    <!-- User Avatar Circle with Glowing Ring -->
    <circle cx="140" cy="220" r="74" fill="none" stroke="#06b6d4" stroke-width="3" stroke-opacity="0.8"/>
    <circle cx="140" cy="220" r="70" fill="#0f172a"/>
    <image x="70" y="150" width="140" height="140" href="${escapeXml(avatarUrl)}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />

    <!-- Developer Main Information -->
    <g transform="translate(240, 190)">
      <!-- Name -->
      <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="url(#textGrad)" letter-spacing="-0.5">
        ${name}
      </text>

      <!-- Tagline -->
      <text x="0" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#38bdf8">
        ${tagline}
      </text>

      <!-- Bio / Summary -->
      <text x="0" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400" fill="#94a3b8" width="750">
        ${bio}
      </text>
    </g>

    <!-- Divider Line -->
    <line x1="90" y1="420" x2="1110" y2="420" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>

    <!-- Tech Badges Group -->
    <g transform="translate(90, 460)">
      ${techBadgesSvg}
    </g>

    <!-- Bottom Right Brand Badge -->
    <g transform="translate(860, 465)">
      <text x="150" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#f8fafc" text-anchor="end" letter-spacing="-0.5">
        PORTFOLIO<tspan fill="#06b6d4">FORGE</tspan>
      </text>
      <text x="150" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="end">
        https://${escapeXml(reqHost || 'portfolioforge.dev')}/#/${escapeXml(portfolio.username || '')}
      </text>
    </g>
  </svg>`;
}
