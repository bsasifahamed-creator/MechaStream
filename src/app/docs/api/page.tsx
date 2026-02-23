import Link from "next/link";
import CodeBlock from "@/components/docs/CodeBlock";

const ENDPOINTS = [
  { method: "POST", path: "/api/auth/register", body: true },
  { method: "POST", path: "/api/auth/login", body: true },
  { method: "POST", path: "/api/auth/logout", body: false },
  { method: "GET", path: "/api/auth/me", body: false },
  { method: "POST", path: "/api/generate", body: true },
  { method: "GET", path: "/api/projects", body: false },
  { method: "POST", path: "/api/projects", body: true },
  { method: "GET", path: "/api/projects/:id", body: false },
  { method: "PUT", path: "/api/projects/:id", body: true },
  { method: "DELETE", path: "/api/projects/:id", body: false },
  { method: "POST", path: "/api/export", body: true },
  { method: "POST", path: "/api/deploy/vercel", body: true },
  { method: "POST", path: "/api/deploy/netlify", body: true },
  { method: "GET", path: "/api/billing/usage", body: false },
  { method: "POST", path: "/api/billing/checkout", body: true },
];

export default function ApiPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">API Reference</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Integrate MechaStream generation into your own tools and workflows.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Authentication</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        All API calls (except auth and webhooks) require a Bearer token in the header:
      </p>
      <CodeBlock
        language="bash"
        code="Authorization: Bearer YOUR_TOKEN"
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Endpoints</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        Base URL: your backend (e.g. http://localhost:5000). Send JSON in request body where applicable.
      </p>
      <div className="space-y-4 mb-8">
        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-base font-semibold text-gray-200 mb-2">
              <span className={ep.method === "GET" ? "text-green-400" : ep.method === "POST" ? "text-yellow-400" : "text-indigo-400"}>{ep.method}</span>{" "}
              <span className="font-mono">{ep.path}</span>
            </h3>
            <p className="text-gray-400 text-sm">
              {ep.body ? "Request body: JSON. Response: JSON." : "Response: JSON."}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Error Reference</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Code</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Meaning</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">400 Bad Request</td><td className="p-3">Invalid input</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">401 Unauthorized</td><td className="p-3">Missing or invalid token</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">403 Forbidden</td><td className="p-3">Limit exceeded</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">404 Not Found</td><td className="p-3">Resource not found</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">422 Unprocessable</td><td className="p-3">Schema validation failed</td></tr>
            <tr className="bg-gray-950"><td className="p-3">500 Server Error</td><td className="p-3">Internal error</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/plans" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: Plans & Limits →
        </Link>
      </div>
    </>
  );
}
