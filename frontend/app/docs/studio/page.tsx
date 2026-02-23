import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

export default function StudioPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">The Studio</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Your central workspace for generating and managing web apps.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Studio Tabs</h2>

      <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">Prompt Tab</h3>
      <p className="text-gray-400 leading-relaxed mb-2">
        Where you describe your app. Be specific about the app type, name it in the prompt, and list the sections you want (e.g. Hero, Pricing, Testimonials). Avoid terms like &quot;animation&quot;, &quot;3D&quot;, &quot;real-time&quot;, or &quot;fully custom&quot;—those trigger a complexity warning and the AI may simplify your request.
      </p>
      <CodeBlock
        title="Good prompt examples"
        language="text"
        code={`A landing page for a CRM called SalesHub with Hero, Features, Pricing (3 tiers), and Footer.

SaaS homepage for an analytics dashboard. Include Navbar, Hero, CTA, and Footer. Use indigo as primary color.

Portfolio site for a design agency. Sections: Navbar, Hero, Features (3 cards), Testimonials, Contact CTA, Footer.`}
      />

      <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">Schema Tab</h3>
      <p className="text-gray-400 leading-relaxed">
        The schema panel shows app meta (title, type, theme) and each page with its sections. You can add or remove sections from the allowed registry and expand &quot;View Raw JSON Schema&quot; to see the full structure. Reviewing schema before code lets you fix structure without touching generated code.
      </p>

      <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">Code Tab</h3>
      <p className="text-gray-400 leading-relaxed">
        Switch between pages by route tabs. Each page is a single React component with Tailwind styling. Use the copy button to copy the code. The code is deterministic: same schema always produces the same output.
      </p>

      <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">Preview Tab</h3>
      <p className="text-gray-400 leading-relaxed">
        The iframe preview runs the generated code with Tailwind CDN and React. Some styles may differ from a full Next.js build. Use it to sanity-check layout and content before export or deploy.
      </p>

      <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">Export Tab</h3>
      <p className="text-gray-400 leading-relaxed">
        Download a ZIP of a ready-to-run Next.js project, or use the file browser to view file contents. Deploy to Vercel or Netlify by entering your API token (never stored). See Export and Deploy docs for details.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Prompt Tips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-2">DO</h3>
          <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
            <li>Be specific about app type</li>
            <li>Name your app in the prompt</li>
            <li>List the sections you want</li>
            <li>Specify color preferences</li>
            <li>Keep prompts under 100 words</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-2">DON&apos;T</h3>
          <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
            <li>Request animations or 3D effects</li>
            <li>Use terms like &quot;fully custom&quot;</li>
            <li>Ask for real-time data features</li>
            <li>Include conflicting instructions</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/schema" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: Schema System →
        </Link>
      </div>
    </>
  );
}
