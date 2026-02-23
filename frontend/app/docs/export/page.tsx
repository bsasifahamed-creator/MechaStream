import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

export default function ExportPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Export to ZIP</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Download your generated app as a ready-to-run Next.js project.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">What&apos;s in the ZIP?</h2>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
        <pre className="m-0">{`/your-app
  /pages
    index.tsx
    (additional pages)
  /components
  package.json
  tailwind.config.js
  tsconfig.json
  next.config.js
  README.md`}</pre>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Running Locally</h2>
      <ol className="space-y-4 list-decimal list-inside text-gray-400">
        <li>Unzip the folder.</li>
        <li>
          <span className="inline-block mb-2">Install dependencies:</span>
          <CodeBlock language="bash" code="cd your-app && npm install" />
        </li>
        <li>
          <span className="inline-block mb-2">Start the dev server:</span>
          <CodeBlock language="bash" code="npm run dev" />
        </li>
        <li>
          <span className="inline-block mb-2">Open in browser:</span>
          <CodeBlock language="bash" code="open http://localhost:3000" />
        </li>
      </ol>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Customizing After Export</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        You can edit components in <code className="text-indigo-400 bg-gray-800 px-1 rounded">pages/*.tsx</code>, change theme colors in the generated JSX or add a Tailwind theme, add new pages by creating new files in <code className="text-indigo-400 bg-gray-800 px-1 rounded">pages/</code>, and connect a real backend by adding API routes or environment variables. The ZIP is a standard Next.js app.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Plan Limits</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Plan</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Exports</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">Free</td><td className="p-3">3 per month</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">Pro</td><td className="p-3">Unlimited</td></tr>
            <tr className="bg-gray-900"><td className="p-3">Agency</td><td className="p-3">Unlimited</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/deploy" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: Deploy Live →
        </Link>
      </div>
    </>
  );
}
