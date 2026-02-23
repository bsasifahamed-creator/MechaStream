import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

const COMPONENTS = [
  {
    name: "Navbar",
    desc: "Top navigation with logo and links.",
    props: [
      { prop: "logo", type: "string", required: false, desc: "Brand name or logo text" },
      { prop: "links", type: "string[]", required: false, desc: "Navigation link labels" },
    ],
    example: `{ "logo": "Brand", "links": ["Home", "Features", "Pricing"] }`,
  },
  {
    name: "Hero",
    desc: "Main headline and CTA section.",
    props: [
      { prop: "headline", type: "string", required: false, desc: "Main heading" },
      { prop: "subheadline", type: "string", required: false, desc: "Supporting text" },
      { prop: "ctaText", type: "string", required: false, desc: "Button label" },
      { prop: "ctaLink", type: "string", required: false, desc: "Button URL" },
    ],
    example: `{ "headline": "Build Something Great", "subheadline": "The platform that helps you ship faster.", "ctaText": "Get Started", "ctaLink": "/signup" }`,
  },
  {
    name: "Features",
    desc: "Feature grid with icons and descriptions.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Section title" },
      { prop: "items", type: "array", required: false, desc: "{ icon, title, desc }" },
    ],
    example: `{ "title": "Features", "items": [{ "icon": "⚡", "title": "Fast", "desc": "Ship in minutes." }] }`,
  },
  {
    name: "Pricing",
    desc: "Pricing tiers and features.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Section title" },
      { prop: "plans", type: "array", required: false, desc: "{ name, price, features[] }" },
    ],
    example: `{ "title": "Pricing", "plans": [{ "name": "Pro", "price": "$29", "features": ["Unlimited projects"] }] }`,
  },
  {
    name: "Testimonials",
    desc: "Customer quotes and roles.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Section title" },
      { prop: "items", type: "array", required: false, desc: "{ name, role, quote }" },
    ],
    example: `{ "title": "Testimonials", "items": [{ "name": "Jane", "role": "CEO", "quote": "Love it." }] }`,
  },
  {
    name: "CTA",
    desc: "Call-to-action block.",
    props: [
      { prop: "headline", type: "string", required: false, desc: "Headline" },
      { prop: "subtext", type: "string", required: false, desc: "Supporting text" },
      { prop: "ctaText", type: "string", required: false, desc: "Button label" },
    ],
    example: `{ "headline": "Ready to start?", "subtext": "Get started today.", "ctaText": "Sign up" }`,
  },
  {
    name: "Footer",
    desc: "Footer with brand and tagline.",
    props: [
      { prop: "brand", type: "string", required: false, desc: "Brand name" },
      { prop: "tagline", type: "string", required: false, desc: "Short tagline" },
    ],
    example: `{ "brand": "MechaStream", "tagline": "Build with AI." }`,
  },
  {
    name: "Stats",
    desc: "Statistic counters.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Section title" },
      { prop: "items", type: "array", required: false, desc: "{ label, value }" },
    ],
    example: `{ "title": "By the numbers", "items": [{ "label": "Users", "value": "10k+" }] }`,
  },
  {
    name: "Card",
    desc: "Single card with title, description, optional icon and link.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Card title" },
      { prop: "description", type: "string", required: false, desc: "Card body" },
      { prop: "icon", type: "string", required: false, desc: "Optional icon" },
      { prop: "link", type: "string", required: false, desc: "Optional link URL" },
    ],
    example: `{ "title": "Feature", "description": "Description here.", "icon": "★", "link": "/learn" }`,
  },
  {
    name: "Form",
    desc: "Form with configurable fields.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Form title" },
      { prop: "fields", type: "array", required: false, desc: "{ label, type, required }" },
      { prop: "submitText", type: "string", required: false, desc: "Submit button label" },
    ],
    example: `{ "title": "Contact", "fields": [{ "label": "Email", "type": "email", "required": true }], "submitText": "Send" }`,
  },
  {
    name: "Table",
    desc: "Data table with columns and rows.",
    props: [
      { prop: "title", type: "string", required: false, desc: "Table title" },
      { prop: "columns", type: "string[]", required: false, desc: "Column headers" },
      { prop: "rows", type: "array", required: false, desc: "Array of row arrays" },
    ],
    example: `{ "title": "Data", "columns": ["Name", "Status"], "rows": [["Alice", "Active"], ["Bob", "Pending"]] }`,
  },
];

export default function ComponentsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Component Registry</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Every component available in MechaStream and their configurable props.
      </p>
      <p className="text-gray-400 leading-relaxed mb-10">
        The AI can only select from this list. You can add or remove sections in the Schema tab; you cannot invent new component types. This keeps generated code predictable and maintainable.
      </p>

      {COMPONENTS.map((c) => (
        <section key={c.name} className="mb-12">
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">{c.name}</h2>
          <p className="text-gray-400 leading-relaxed mb-4">{c.desc}</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Prop</th>
                  <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Type</th>
                  <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Required</th>
                  <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {c.props.map((p, i) => (
                  <tr key={p.prop} className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}>
                    <td className="p-3 font-mono text-indigo-400">{p.prop}</td>
                    <td className="p-3">{p.type}</td>
                    <td className="p-3">{p.required ? "Yes" : "No"}</td>
                    <td className="p-3">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock title="Example props" language="json" code={c.example} />
        </section>
      ))}

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/export" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: Export to ZIP →
        </Link>
      </div>
    </>
  );
}
