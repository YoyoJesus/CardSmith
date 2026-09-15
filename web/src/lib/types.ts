export type CardLayout = "bar" | "classic" | "centered" | "header";
export type CardSize = "us" | "eu" | "square";

export interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  linkedin: string;
  github: string;
  twitter: string;
  layout: CardLayout;
  primaryColor: string;
  textColor: string;
  bgColor: string;
  size: CardSize;
}

export const defaultData: BusinessCardData = {
  name: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  linkedin: "",
  github: "",
  twitter: "",
  layout: "bar",
  primaryColor: "22327F",
  textColor: "1b1b1b",
  bgColor: "ffffff",
  size: "us",
};

export const MAX_CARD_FIELD_LENGTH = 500;

const textFields = [
  "name",
  "title",
  "company",
  "email",
  "phone",
  "website",
  "location",
  "linkedin",
  "github",
  "twitter",
] as const satisfies readonly (keyof BusinessCardData)[];

export function sanitizeStoredCardData(value: unknown): BusinessCardData {
  const sanitized = { ...defaultData };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return sanitized;
  }

  const saved = value as Record<string, unknown>;
  for (const field of textFields) {
    const candidate = saved[field];
    if (
      typeof candidate === "string" &&
      candidate.length <= MAX_CARD_FIELD_LENGTH
    ) {
      sanitized[field] = candidate;
    }
  }

  if (
    typeof saved.layout === "string" &&
    ["bar", "classic", "centered", "header"].includes(saved.layout)
  ) {
    sanitized.layout = saved.layout as CardLayout;
  }
  if (
    typeof saved.size === "string" &&
    ["us", "eu", "square"].includes(saved.size)
  ) {
    sanitized.size = saved.size as CardSize;
  }

  for (const field of ["primaryColor", "textColor", "bgColor"] as const) {
    const candidate = saved[field];
    if (typeof candidate === "string" && /^[0-9a-f]{6}$/i.test(candidate)) {
      sanitized[field] = candidate;
    }
  }

  return sanitized;
}
