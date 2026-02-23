/**
 * MechaStream — Schema types for schema-first app definition.
 * ComponentName is a union of allowed components only.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT REGISTRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ComponentName =
  | "Hero"
  | "Navbar"
  | "Features"
  | "Pricing"
  | "Testimonials"
  | "CTA"
  | "Footer"
  | "Dashboard"
  | "Table"
  | "Form"
  | "Card"
  | "Modal"
  | "Sidebar"
  | "Stats"
  | "Chart";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME & META
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ThemeConfig {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

export interface MetaConfig {
  title: string;
  type: string;
  theme: ThemeConfig;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION & PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SectionConfig {
  component: ComponentName;
  variant: string;
  props: Record<string, unknown>;
}

export interface PageConfig {
  name: string;
  route: string;
  sections: SectionConfig[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APP SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AppSchema {
  meta: MetaConfig;
  pages: PageConfig[];
}
