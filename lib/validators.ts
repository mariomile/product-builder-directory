// lib/validators.ts
// Self-contained — zero imports. Must remain edge-function safe (Deno compatible).
// Do NOT import from lib/constants.ts or any Next.js module.
// These type definitions are intentionally independent of lib/constants.ts.

export type ResourceType =
  | "tool"
  | "course"
  | "article"
  | "newsletter"
  | "book"
  | "podcast"
  | "video"
  | "community"
  | "x_post"
  | "framework";

export type ResourcePillar =
  | "discovery"
  | "design"
  | "delivery"
  | "strategy"
  | "stack"
  | "meta_skill";

export type ResourceLevel = "beginner" | "intermediate" | "advanced";

export type ResourceClassification = {
  name: string;
  description: string;
  type: ResourceType;
  pillar: ResourcePillar;
  level: ResourceLevel;
  tags: string[];
  expert_take: string;
  is_free: boolean;
  language: string;
};

const VALID_TYPES: ResourceType[] = [
  "tool",
  "course",
  "article",
  "newsletter",
  "book",
  "podcast",
  "video",
  "community",
  "x_post",
  "framework",
];

const VALID_PILLARS: ResourcePillar[] = [
  "discovery",
  "design",
  "delivery",
  "strategy",
  "stack",
  "meta_skill",
];

const VALID_LEVELS: ResourceLevel[] = ["beginner", "intermediate", "advanced"];

export class ValidationError extends Error {
  constructor(
    public field: string,
    public reason: string,
  ) {
    super(`Validation failed for field "${field}": ${reason}`);
    this.name = "ValidationError";
  }
}

export function validateResourceClassification(
  raw: unknown,
): ResourceClassification {
  if (typeof raw !== "object" || raw === null) {
    throw new ValidationError("root", "Expected a non-null object");
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.name !== "string" || !obj.name.trim()) {
    throw new ValidationError("name", "Required non-empty string");
  }
  if (typeof obj.description !== "string") {
    throw new ValidationError("description", "Required string");
  }
  if (!VALID_TYPES.includes(obj.type as ResourceType)) {
    throw new ValidationError(
      "type",
      `Must be one of: ${VALID_TYPES.join(", ")}`,
    );
  }
  if (!VALID_PILLARS.includes(obj.pillar as ResourcePillar)) {
    throw new ValidationError(
      "pillar",
      `Must be one of: ${VALID_PILLARS.join(", ")}`,
    );
  }
  if (!VALID_LEVELS.includes(obj.level as ResourceLevel)) {
    throw new ValidationError(
      "level",
      `Must be one of: ${VALID_LEVELS.join(", ")}`,
    );
  }
  if (
    !Array.isArray(obj.tags) ||
    !obj.tags.every((t) => typeof t === "string")
  ) {
    throw new ValidationError("tags", "Must be a string[]");
  }
  if (typeof obj.expert_take !== "string") {
    throw new ValidationError("expert_take", "Required string");
  }
  if (typeof obj.is_free !== "boolean") {
    throw new ValidationError("is_free", "Required boolean");
  }
  if (typeof obj.language !== "string" || !obj.language.trim()) {
    throw new ValidationError("language", "Required non-empty string");
  }

  return obj as unknown as ResourceClassification;
}
