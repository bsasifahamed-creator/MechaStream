/**
 * MechaStream — Schema-first app definition.
 * AI may only output components from the CONTROLLED_REGISTRY.
 * Used for: Prompt → JSON Schema → Deterministic Code Builder
 */

/** Allowed component names only. AI cannot invent components outside this list. */
export const CONTROLLED_COMPONENT_NAMES = [
  'Hero',
  'Navbar',
  'Features',
  'Pricing',
  'Testimonials',
  'CTA',
  'Footer',
  'Dashboard',
  'Table',
  'Form',
  'Card',
  'Modal',
  'Sidebar',
  'Stats',
  'Chart',
] as const;

export type ComponentName = (typeof CONTROLLED_COMPONENT_NAMES)[number];

export type AppType = 'landing' | 'dashboard' | 'portfolio' | 'saas';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';
export type Spacing = 'compact' | 'normal' | 'relaxed';
export type FontFamily = 'inter' | 'poppins' | 'roboto' | 'manrope';

export interface ThemeSchema {
  primaryColor: string;
  fontFamily: FontFamily | string;
  borderRadius: BorderRadius;
  spacing: Spacing;
}

export interface MetaSchema {
  title: string;
  type: AppType;
  theme: ThemeSchema;
}

export interface SectionSchema {
  component: ComponentName;
  variant: string;
  props: Record<string, unknown>;
}

export interface PageSchema {
  name: string;
  route: string;
  sections: SectionSchema[];
}

export interface AppSchema {
  meta: MetaSchema;
  pages: PageSchema[];
}

/** Type guard: check if a string is a valid ComponentName */
export function isComponentName(value: string): value is ComponentName {
  return (CONTROLLED_COMPONENT_NAMES as readonly string[]).includes(value);
}

/** Validate minimal AppSchema shape (for runtime checks before Pydantic). */
export function isAppSchemaLike(value: unknown): value is AppSchema {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  if (!o.meta || typeof o.meta !== 'object') return false;
  const meta = o.meta as Record<string, unknown>;
  if (typeof meta.title !== 'string' || typeof meta.type !== 'string') return false;
  if (!o.pages || !Array.isArray(o.pages)) return false;
  for (const page of o.pages as unknown[]) {
    if (!page || typeof page !== 'object') return false;
    const p = page as Record<string, unknown>;
    if (typeof p.name !== 'string' || typeof p.route !== 'string' || !Array.isArray(p.sections))
      return false;
    for (const sec of (p.sections as unknown[]) || []) {
      if (!sec || typeof sec !== 'object') return false;
      const s = sec as Record<string, unknown>;
      if (!isComponentName(String(s.component)) || typeof s.variant !== 'string') return false;
    }
  }
  return true;
}
