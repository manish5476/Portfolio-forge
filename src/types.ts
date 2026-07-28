export type ThemeMode = 'dark' | 'light';

export type ThemePreset = 'cyber-cyan' | 'linear-dark' | 'raycast-purple' | 'emerald-matrix' | 'solar-flare' | 'apple-light';

export interface ThemeTokens {
  preset: ThemePreset;
  accentColor: string;
  glassBlur: 'high' | 'medium' | 'light';
  glowIntensity: number; // 0 - 100
  cornerRadius: number; // e.g. 16, 24
}

export type AvailabilityStatus = 'open_to_work' | 'hiring' | 'contract' | 'unavailable';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  email?: string;
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  hackerrank?: string;
  devto?: string;
  hashnode?: string;
  medium?: string;
  stackoverflow?: string;
  kaggle?: string;
  figma?: string;
  dockerhub?: string;
  npm?: string;
  pypi?: string;
  aws?: string;
  credly?: string;
  producthunt?: string;
  youtube?: string;
}

export interface Profile {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  timezone?: string;
  currentCompany?: string;
  yearsExperience?: number;
  availability: AvailabilityStatus;
  verified: boolean;
  resumeUrl: string;
  socialLinks: SocialLinks;
  theme: ThemeMode;
  accentColor: string;
  themeTokens?: ThemeTokens;
  githubUsername: string;
  githubUsernames?: string[];
  showCommitTimestamp?: boolean;
  totalCommits?: number;
  totalStars?: number;
  totalFollowers?: number;
  portfolioViews?: number;
}

export interface LeetCodeStats {
  username: string;
  rating: number;
  globalRanking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  contestHistory: { contestName: string; rating: number; date: string }[];
}

export interface CodeforcesStats {
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  solvedCount: number;
}

export interface CodeChefStats {
  username: string;
  stars: string;
  rating: number;
  globalRank: number;
}

export interface CompetitiveProgrammingData {
  leetcode?: LeetCodeStats;
  codeforces?: CodeforcesStats;
  codechef?: CodeChefStats;
  badges: { id: string; name: string; issuer: string; icon: string; date: string }[];
}

export type CustomLinkType = 'docs' | 'figma' | 'video' | 'demo' | 'repo' | 'website' | 'other';

export interface ProjectCustomLink {
  id: string;
  type: CustomLinkType;
  label: string;
  url: string;
}

export interface CaseStudyData {
  summary: string;
  architectureDiagramUrl?: string;
  challenges: string[];
  solutions: string[];
  lessonsLearned: string[];
  metrics: { label: string; value: string }[];
  screenshots?: string[];
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
    isFork?: boolean;
    pushedAt?: string;
    createdAt?: string;
  };
  featured?: boolean;
  caseStudy?: CaseStudyData;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: 'award' | 'star' | 'trophy' | 'zap' | 'code' | 'briefcase' | 'graduation-cap' | 'globe';
  category?: 'hackathon' | 'certification' | 'publication' | 'talk' | 'award';
  verifyUrl?: string;
}

export interface ResumeVersion {
  id: string;
  title: string;
  pdfUrl: string;
  atsScore: number;
  updatedAt: string;
}

export interface ResumeVault {
  resumeUrl: string;
  atsScore: number;
  atsKeywords: string[];
  atsRecommendations: string[];
  versions: ResumeVersion[];
}

export interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface PortfolioAudit {
  overallScore: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  securityScore: number;
  auditDetails: { category: string; score: number; text: string }[];
}

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  recruiterVisits: number;
  resumeDownloads: number;
  trafficSources: { name: string; percentage: number; visits: number }[];
  countryVisits: { country: string; code: string; visits: number }[];
  popularProjects: { id: string; title: string; views: number }[];
}

export interface PortfolioData {
  id: string; // portfolio identifier
  ownerId?: string; // Firebase Auth UID of the owner
  username: string; // unique handle e.g. manishsingh
  profile: Profile;
  projects: Project[];
  achievements: Achievement[];
  competitiveProgramming?: CompetitiveProgrammingData;
  resumeVault?: ResumeVault;
  sectionConfigs?: SectionConfig[];
  auditScores?: PortfolioAudit;
  analytics?: AnalyticsData;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface UserAccount {
  uid: string;
  id: string;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'password' | 'google' | 'github' | 'linkedin' | 'demo';
  createdAt: string;
}

