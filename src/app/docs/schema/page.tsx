import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

const APP_SCHEMA_CODE = `export type ComponentName =
  | "Hero" | "Navbar" | "Features" | "Pricing" | "Testimonials"
  | "CTA" | "Footer" | "Dashboard" | "Table" | "Form"
  | "Card" | "Modal" | "Sidebar" | "Stats" | "Chart";

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

export interface AppSchema {
  meta: MetaConfig;
  pages: PageConfig[];
}`;

export default function SchemaPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Schema System</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        How MechaStream structures AI output into predictable, controlled code.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Why Schema-First?</h2>
      <div className="space-y-4 text-gray-400 leading-relaxed">
        <p>
          Raw AI code generation often produces inconsistent structure, wrong imports, or invented components. MechaStream avoids that by generating a JSON schema first. The schema describes pages, sections, and theme using a fixed vocabulary the AI must follow.
        </p>
        <p>
          That schema is validated against our Pydantic/TypeScript models. Only allowed components and valid field values pass. Then a deterministic code builder turns the schema into React + Tailwind—no AI in the code step. So you get predictable output and a single place (the schema) to review and edit before any code exists.
        </p>
        <p>
          You can tweak the schema in the Studio (add/remove sections, change theme) and re-view code and preview without re-prompting. Schema-first is the single source of truth.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Schema Structure</h2>
      <CodeBlock title="AppSchema (TypeScript)" language="typescript" code={APP_SCHEMA_CODE} />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Meta Object</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Field</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Type</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Options</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3 font-mono text-indigo-400">title</td><td className="p-3">string</td><td className="p-3">any</td><td className="p-3">App name</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3 font-mono text-indigo-400">type</td><td className="p-3">string</td><td className="p-3">landing, dashboard, portfolio, saas</td><td className="p-3">Page type</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3 font-mono text-indigo-400">primaryColor</td><td className="p-3">string</td><td className="p-3">hex code</td><td className="p-3">Brand color</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3 font-mono text-indigo-400">fontFamily</td><td className="p-3">string</td><td className="p-3">inter, poppins, roboto, manrope</td><td className="p-3">Font choice</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3 font-mono text-indigo-400">borderRadius</td><td className="p-3">string</td><td className="p-3">sharp, rounded, pill</td><td className="p-3">Corner style</td></tr>
            <tr className="bg-gray-950"><td className="p-3 font-mono text-indigo-400">spacing</td><td className="p-3">string</td><td className="p-3">compact, normal, relaxed</td><td className="p-3">Layout density</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Pages & Sections</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        Each page has a <code className="text-indigo-400 bg-gray-800 px-1 rounded">name</code>, <code className="text-indigo-400 bg-gray-800 px-1 rounded">route</code> (must start with /), and an ordered list of <code className="text-indigo-400 bg-gray-800 px-1 rounded">sections</code>. Each section specifies a component from the registry, a variant, and optional props. Limits: max 5 pages, max 6 sections per page.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Complexity Detection</h2>
      <p className="text-gray-400 leading-relaxed mb-2">
        Trigger words that activate a complexity warning (and may cause the AI to simplify your request):
      </p>
      <p className="text-gray-400 text-sm font-mono bg-gray-800 rounded px-2 py-1 inline-block mb-4">
        animation, 3d, parallax, real-time, websocket, custom css, fully custom, advanced, complex, dynamic chart, video background, particle, canvas
      </p>
      <p className="text-gray-400 leading-relaxed">
        When detected, you&apos;ll see a warning and the model may reduce the prompt to a simpler equivalent. Rephrase to avoid these terms if you want the full request.
      </p>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/components" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: Component Registry →
        </Link>
      </div>
    </>
  );
}
