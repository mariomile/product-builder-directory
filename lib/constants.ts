// lib/constants.ts
// Pure data — no imports. Must remain import-free to avoid circular dependency
// and to stay edge-function compatible (Phase 4).

export const TYPE_LABELS: Record<string, string> = {
  tool: "Tool",
  course: "Course",
  article: "Article",
  newsletter: "Newsletter",
  book: "Book",
  podcast: "Podcast",
  video: "Video",
  community: "Community",
  x_post: "X Post",
  framework: "Framework",
};

export const PILLAR_LABELS: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  delivery: "Delivery",
  strategy: "Strategy",
  stack: "Stack & Tools",
  meta_skill: "Meta-skill",
};

// Monochrome terminal badge classes — replaces rainbow typeColors.
// All use outline variant with border/text from terminal palette.
// Primary type badge uses cyan (border-primary text-primary).
export const TYPE_BADGE_CLASSES: Record<string, string> = {
  tool: "border-primary text-primary",
  course: "border-border text-foreground",
  article: "border-border text-foreground",
  newsletter: "border-border text-foreground",
  book: "border-border text-foreground",
  podcast: "border-border text-foreground",
  video: "border-border text-foreground",
  community: "border-border text-foreground",
  x_post: "border-border text-muted-foreground",
  framework: "border-primary text-primary",
};

export const TYPES = [
  { value: "tool", label: "Tool" },
  { value: "course", label: "Course" },
  { value: "article", label: "Article" },
  { value: "newsletter", label: "Newsletter" },
  { value: "book", label: "Book" },
  { value: "podcast", label: "Podcast" },
  { value: "video", label: "Video" },
  { value: "community", label: "Community" },
  { value: "x_post", label: "X Post" },
  { value: "framework", label: "Framework" },
];

export const PILLARS = [
  { value: "discovery", label: "Discovery" },
  { value: "design", label: "Design" },
  { value: "delivery", label: "Delivery" },
  { value: "strategy", label: "Strategy" },
  { value: "stack", label: "Stack & Tools" },
  { value: "meta_skill", label: "Meta-skill" },
];

export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
