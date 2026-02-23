import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

export default function QuickStartPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Quick Start</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        From zero to deployed in under 10 minutes.
      </p>

      <ol className="space-y-10 list-none">
        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Create your account</h2>
          <p className="text-gray-400 leading-relaxed">
            Go to mechastream.com/register. Enter your name, email, and password. Free plan is activated automatically.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. Open the Studio</h2>
          <p className="text-gray-400 leading-relaxed">
            Navigate to /studio after logging in. The Studio is your main workspace.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Write your first prompt</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            In the Prompt tab, describe your app.
          </p>
          <CodeBlock
            title="Example prompt"
            language="text"
            code={`A SaaS landing page for a project 
management tool called TaskFlow. 
Include pricing with 3 tiers and 
a testimonials section.`}
          />
        </li>

        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Review the schema</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            MechaStream generates a structured JSON schema before writing any code. Review it in the Schema tab. Add or remove sections as needed.
          </p>
          <CodeBlock
            title="Example schema output"
            language="json"
            code={`{
  "meta": {
    "title": "TaskFlow",
    "type": "landing",
    "theme": {
      "primaryColor": "#6366f1",
      "fontFamily": "inter",
      "borderRadius": "rounded",
      "spacing": "normal"
    }
  },
  "pages": [
    {
      "name": "Home",
      "route": "/",
      "sections": [
        { "component": "Navbar", "variant": "default", "props": {} },
        { "component": "Hero", "variant": "default", "props": {} },
        { "component": "Features", "variant": "default", "props": {} },
        { "component": "Pricing", "variant": "default", "props": {} },
        { "component": "Testimonials", "variant": "default", "props": {} },
        { "component": "Footer", "variant": "default", "props": {} }
      ]
    }
  ]
}`}
          />
        </li>

        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Preview your app</h2>
          <p className="text-gray-400 leading-relaxed">
            Click the Preview tab to see your app rendered live in the browser. No deployment needed yet.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Export or deploy</h2>
          <p className="text-gray-400 leading-relaxed">
            When satisfied, go to the Export tab. Download a ZIP or deploy live to Vercel or Netlify in one click.
          </p>
        </li>
      </ol>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link
          href="/docs/studio"
          className="text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Next: Learn about the Studio →
        </Link>
      </div>
    </>
  );
}
