export type ThemeMode = 'dark' | 'light';

export type AccentColor = string;

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  email?: string;
}

export interface Profile {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  resumeUrl: string;
  socialLinks: SocialLinks;
  theme: ThemeMode;
  accentColor: AccentColor;
  githubUsername: string;
  githubUsernames?: string[];
  showCommitTimestamp?: boolean;
}

export type CustomLinkType = 'docs' | 'figma' | 'video' | 'demo' | 'repo' | 'website' | 'other';

export interface ProjectCustomLink {
  id: string;
  type: CustomLinkType;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  source: 'github' | 'manual' | 'merged';
  repoUrl?: string;
  hostedUrl?: string;
  imageUrl?: string;
  techStack: string[];
  customLinks?: ProjectCustomLink[];
  githubStats?: {
    stars: number;
    forks: number;
    language: string;
    updatedAt: string;
  };
  featured?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: 'award' | 'star' | 'trophy' | 'zap' | 'code' | 'briefcase' | 'graduation-cap' | 'globe';
}

export interface PortfolioData {
  id: string; // user id
  username: string; // unique handle e.g. alexdev
  profile: Profile;
  projects: Project[];
  achievements: Achievement[];
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}
