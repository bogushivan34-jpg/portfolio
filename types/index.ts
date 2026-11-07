export type Language = "ru" | "en";

export interface MetricItem {
  label: string;
  labelEn?: string;
  value: string;
  valueEn?: string;
  subtext?: string;
  subtextEn?: string;
}

export interface FunnelStep {
  stage: string;
  stageEn?: string;
  /** Short status or figure, e.g. "10 000" or "работает" */
  count: string;
  countEn?: string;
  /** Optional second column (channel type, note) */
  conversion?: string;
  conversionEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface KeyArtifact {
  title: string;
  titleEn?: string;
  type: "site" | "reels" | "print" | "photo" | "brand";
  description: string;
  descriptionEn?: string;
  assetUrl: string;
}

export interface VisualStyle {
  name: string;
  nameEn?: string;
  palette?: string[];
  typography?: string;
  description: string;
  descriptionEn?: string;
}

export interface CaseStudy {
  id: string;
  number: string;
  title: string;
  titleEn?: string;
  client: string;
  clientEn?: string;
  niche: string;
  nicheEn?: string;
  role: string;
  roleEn?: string;
  location: string;
  locationEn?: string;
  period: string;
  image: string;
  /** false keeps the case out of the landing slideshow */
  inHero?: boolean;
  link?: { label: string; url: string };
  tagline: string;
  taglineEn?: string;
  challenge: string;
  challengeEn?: string;
  strategy: string[];
  strategyEn?: string[];
  results: {
    heroMetrics: MetricItem[];
    funnel?: FunnelStep[];
    funnelTitle?: string;
    funnelTitleEn?: string;
    summary?: string;
    summaryEn?: string;
    /** Where the numbers come from */
    source?: string;
    sourceEn?: string;
  };
  visualStyle: VisualStyle;
  keyArtifacts: KeyArtifact[];
}

export interface ServiceStep {
  step: string;
  title: string;
  titleEn?: string;
  includes: string;
  includesEn?: string;
  result: string;
  resultEn?: string;
  description: string;
  descriptionEn?: string;
  image: string;
  example: string;
  exampleEn?: string;
}

export interface Audience {
  who: string;
  whoEn?: string;
  need: string;
  needEn?: string;
}

export interface SkillCategory {
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  skills: { name: string; nameEn?: string; note: string; noteEn?: string }[];
}
