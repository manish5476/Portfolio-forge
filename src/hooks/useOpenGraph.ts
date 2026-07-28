import { useEffect } from 'react';
import { PortfolioData } from '../types';

export function useOpenGraph(portfolio: PortfolioData | null) {
  useEffect(() => {
    if (!portfolio || !portfolio.profile) return;

    const { displayName, tagline, bio, avatarUrl } = portfolio.profile;
    const username = portfolio.username;
    const origin = window.location.origin;

    const title = `${displayName} — ${tagline} | Portfolio Forge`;
    const description = bio || `${displayName}'s developer portfolio featuring projects, tech stack, and achievements on Portfolio Forge.`;
    const ogImageUrl = `${origin}/api/og-image/${username}`;
    const pageUrl = `${origin}/#/${username}`;

    // Update Document Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Standard Meta
    setMetaTag('name', 'description', description);

    // Open Graph
    setMetaTag('property', 'og:type', 'profile');
    setMetaTag('property', 'og:site_name', 'Portfolio Forge');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImageUrl);
    setMetaTag('property', 'og:url', pageUrl);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImageUrl);
  }, [portfolio]);
}
