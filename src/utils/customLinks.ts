import React from 'react';
import { BookOpen, Figma, Video, Globe, ExternalLink, Github, Link as LinkIcon, FileText } from 'lucide-react';
import { CustomLinkType, ProjectCustomLink, Project } from '../types';

export const CUSTOM_LINK_TYPES: { type: CustomLinkType; label: string; defaultLabel: string; icon: any }[] = [
  { type: 'docs', label: 'Documentation', defaultLabel: 'Documentation', icon: BookOpen },
  { type: 'figma', label: 'Figma Design', defaultLabel: 'Figma Design', icon: Figma },
  { type: 'video', label: 'Demo Video', defaultLabel: 'Demo Video', icon: Video },
  { type: 'demo', label: 'Live Demo', defaultLabel: 'Live Demo', icon: ExternalLink },
  { type: 'repo', label: 'GitHub Repository', defaultLabel: 'GitHub Source', icon: Github },
  { type: 'website', label: 'Website', defaultLabel: 'Project Website', icon: Globe },
  { type: 'other', label: 'Custom Link', defaultLabel: 'Resource Link', icon: LinkIcon },
];

export function getLinkTypeInfo(type: CustomLinkType) {
  return CUSTOM_LINK_TYPES.find((t) => t.type === type) || {
    type: 'other' as CustomLinkType,
    label: 'Custom Link',
    defaultLabel: 'Resource Link',
    icon: LinkIcon,
  };
}

/**
 * Returns all active links for a project including customLinks,
 * falling back to hostedUrl and repoUrl if customLinks does not explicitly contain them.
 */
export function getAllProjectLinks(project: Project): ProjectCustomLink[] {
  const links: ProjectCustomLink[] = [...(project.customLinks || [])];

  // If project has hostedUrl and no custom link with that exact URL
  if (project.hostedUrl && !links.some((l) => l.url === project.hostedUrl || l.type === 'demo')) {
    links.unshift({
      id: `legacy_hosted_${project.id}`,
      type: 'demo',
      label: 'Live Preview',
      url: project.hostedUrl,
    });
  }

  // If project has repoUrl and no custom link with that exact URL
  if (project.repoUrl && !links.some((l) => l.url === project.repoUrl || l.type === 'repo')) {
    links.push({
      id: `legacy_repo_${project.id}`,
      type: 'repo',
      label: 'GitHub Repo',
      url: project.repoUrl,
    });
  }

  return links;
}
