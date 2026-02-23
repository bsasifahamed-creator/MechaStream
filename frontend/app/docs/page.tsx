import Link from "next/link";

const QUICK_LINKS = [
  {
    title: "Quick Start",
    href: "/docs/quickstart",
    description: "Get up and running in 5 minutes.",
  },
  {
    title: "The Studio",
    href: "/docs/studio",
    description: "Learn how the generation Studio works.",
  },
  {
    title: "Schema System",
    href: "/docs/schema",
    description: "Understand how AI generates structured output.",
  },
  {
    title: "API Reference",
    href: "/docs/api",
    description: "Integrate MechaStream into your workflow.",
  },
];

export default function DocsHomePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">
        MechaStream Documentation
      </h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Everything you need to build, export, and deploy web apps with MechaStream.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-lg p-6 transition"
          >
            <h2 className="text-lg font-semibold text-white mb-2">{link.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">
        What is MechaStream?
      </h2>
      <div className="space-y-4 text-gray-400 leading-relaxed">
        <p>
          MechaStream is a vibecoding platform that turns natural language prompts into production-ready web apps. It’s built for founders, product people, and developers who want to ship landing pages, dashboards, and small apps fast without writing every line of code by hand. You describe what you want; MechaStream generates a structured schema and then deterministic React code you can review, edit, and deploy.
        </p>
        <p>
          Unlike raw AI code generation, MechaStream uses a schema-first approach: the AI outputs a JSON schema (pages, sections, theme) that is validated against a fixed component registry. Only then is code generated from that schema. That keeps outputs predictable, limits hallucinations, and lets you adjust structure before any code is written.
        </p>
        <p>
          The flow is simple: you write a prompt in the Studio, review and tweak the generated schema, then view the code and live preview. When you’re happy, you export a ZIP (ready-to-run Next.js project) or deploy live to Vercel or Netlify. Generate → review → export → deploy, all in one place.
        </p>
      </div>
    </>
  );
}
