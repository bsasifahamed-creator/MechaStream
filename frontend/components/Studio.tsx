"use client";

import { useState } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Section {
  component: string;
  variant: string;
  props: Record<string, unknown>;
}

interface Page {
  name: string;
  route: string;
  sections: Section[];
}

interface Theme {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

interface Schema {
  meta: {
    title: string;
    type: string;
    theme: Theme;
  };
  pages: Page[];
}

interface GenerateResponse {
  success: boolean;
  schema?: Schema;
  pages?: Record<string, { name: string; route: string; code: string }>;
  warning?: string;
  errors?: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ALLOWED_COMPONENTS = [
  "Hero", "Navbar", "Features", "Pricing", "Testimonials",
  "CTA", "Footer", "Dashboard", "Table", "Form",
  "Card", "Modal", "Sidebar", "Stats", "Chart"
];

const TABS = ["Prompt", "Schema", "Code", "Preview"] as const;
type Tab = (typeof TABS)[number];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ComplexityWarning = ({ message }: { message: string }) => (
  <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 text-sm">
    ⚠️ {message}
  </div>
);

const ErrorPanel = ({ errors }: { errors: string[] }) => (
  <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm space-y-1">
    <div className="font-semibold mb-2">Schema Validation Failed:</div>
    {errors.map((e, i) => <div key={i}>• {e}</div>)}
  </div>
);

const SchemaPanel = ({
  schema,
  onUpdate
}: {
  schema: Schema;
  onUpdate: (schema: Schema) => void;
}) => {
  const addSection = (pageIndex: number, component: string) => {
    const updated = JSON.parse(JSON.stringify(schema)) as Schema;
    updated.pages[pageIndex].sections.push({
      component,
      variant: "default",
      props: {}
    });
    onUpdate(updated);
  };

  const removeSection = (pageIndex: number, sectionIndex: number) => {
    const updated = JSON.parse(JSON.stringify(schema)) as Schema;
    updated.pages[pageIndex].sections.splice(sectionIndex, 1);
    onUpdate(updated);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="text-white font-semibold text-sm uppercase tracking-wider">App Meta</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Title</div>
            <div className="text-white">{schema.meta.title}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Type</div>
            <div className="text-white capitalize">{schema.meta.type}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Primary Color</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: schema.meta.theme.primaryColor }} />
              <span className="text-white">{schema.meta.theme.primaryColor}</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Font</div>
            <div className="text-white capitalize">{schema.meta.theme.fontFamily}</div>
          </div>
        </div>
      </div>

      {schema.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-sm">
              {page.name}
              <span className="text-gray-500 ml-2 font-normal">{page.route}</span>
            </div>
            <div className="text-gray-500 text-xs">{page.sections.length} sections</div>
          </div>
          <div className="flex flex-col gap-2">
            {page.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex items-center justify-between bg-gray-700/50 rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-white text-sm">{section.component}</span>
                  <span className="text-gray-500 text-xs">{section.variant}</span>
                </div>
                <button type="button" onClick={() => removeSection(pageIndex, sectionIndex)} className="text-red-400 hover:text-red-300 text-xs transition">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <select
              className="w-full bg-gray-700 text-gray-300 text-sm rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-indigo-500"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  addSection(pageIndex, e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="" disabled>+ Add component...</option>
              {ALLOWED_COMPONENTS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <details className="bg-gray-800 rounded-lg">
        <summary className="px-4 py-3 text-gray-400 text-sm cursor-pointer hover:text-white transition">
          View Raw JSON Schema
        </summary>
        <pre className="p-4 text-xs text-green-400 overflow-auto max-h-64">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </details>
    </div>
  );
};

const CodePanel = ({ pages }: { pages: Record<string, { name: string; route: string; code: string }> }) => {
  const routes = Object.keys(pages);
  const [activeRoute, setActiveRoute] = useState(routes[0] || "/");

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-4 pt-4 pb-0">
        {routes.map((route) => (
          <button
            key={route}
            type="button"
            onClick={() => setActiveRoute(route)}
            className={`px-3 py-1.5 text-xs rounded-t transition ${activeRoute === route ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            {pages[route].name}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-gray-800 mx-4 mb-4 rounded-lg overflow-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <span className="text-gray-500 text-xs">{activeRoute}</span>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(pages[activeRoute]?.code || ""); }}
            className="text-indigo-400 hover:text-indigo-300 text-xs transition"
          >
            Copy Code
          </button>
        </div>
        <pre className="p-4 text-xs text-gray-300 overflow-auto whitespace-pre-wrap">
          {pages[activeRoute]?.code}
        </pre>
      </div>
    </div>
  );
};

const PreviewPanel = ({ pages }: { pages: Record<string, { name: string; route: string; code: string }> }) => {
  const routes = Object.keys(pages);
  const [activeRoute, setActiveRoute] = useState(routes[0] || "/");

  const pageComponentName = (name: string) => name.replace(/\s/g, "") + "Page";
  const codeForPreview = (code: string, pageName: string) => {
    let out = code.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\s*/i, "").trim();
    out = out.replace(/export\s+default\s+/, "window." + pageComponentName(pageName) + " = ");
    return out;
  };

  const buildPreviewHTML = (code: string, pageName: string) => {
    const componentName = pageComponentName(pageName);
    const scriptCode = codeForPreview(code, pageName) + `
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(window.${componentName}));`;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>body { margin: 0; background: #030712; } * { box-sizing: border-box; }</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${scriptCode}
  </script>
</body>
</html>`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-4 pt-4 pb-0">
        {routes.map((route) => (
          <button
            key={route}
            type="button"
            onClick={() => setActiveRoute(route)}
            className={`px-3 py-1.5 text-xs rounded-t transition ${activeRoute === route ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            {pages[route].name}
          </button>
        ))}
      </div>
      <div className="flex-1 mx-4 mb-4 rounded-lg overflow-hidden border border-gray-700">
        <iframe
          srcDoc={buildPreviewHTML(pages[activeRoute]?.code || "", pages[activeRoute]?.name || "Page")}
          className="w-full h-full bg-gray-950 min-h-[400px]"
          sandbox="allow-scripts"
          title="Preview"
        />
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN STUDIO COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Studio() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Prompt");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [pages, setPages] = useState<Record<string, { name: string; route: string; code: string }>>({});

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrors([]);
    setWarning(null);
    try {
      const res = await fetch("/api/studio-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data: GenerateResponse = await res.json();
      if (!data.success) {
        setErrors(data.errors || ["Unknown error occurred"]);
        setLoading(false);
        return;
      }
      if (data.warning) setWarning(data.warning);
      if (data.schema) setSchema(data.schema);
      if (data.pages) setPages(data.pages);
      setActiveTab("Schema");
    } catch {
      setErrors(["Failed to connect to server. Is the API running?"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-sm font-bold">M</div>
          <span className="font-semibold text-white">MechaStream</span>
          <span className="text-gray-600 text-sm">Studio</span>
        </div>
        <div className="text-gray-600 text-xs">v1.0 — Builder Mode</div>
      </header>

      <div className="flex border-b border-gray-800 px-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm transition border-b-2 -mb-px ${activeTab === tab ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            {tab}
            {tab === "Schema" && schema && (
              <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Ready</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "Prompt" && (
          <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
            <div className="text-gray-400 text-sm">Describe the app you want to build. Keep it clear and concise.</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A SaaS landing page for a project management tool with pricing and testimonials"
              className="w-full h-36 bg-gray-800 text-white text-sm rounded-lg p-4 border border-gray-700 resize-none focus:outline-none focus:border-indigo-500 placeholder-gray-600 transition"
            />
            {warning && <ComplexityWarning message={warning} />}
            {errors.length > 0 && <ErrorPanel errors={errors} />}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition text-sm"
            >
              {loading ? "Generating..." : "Generate App →"}
            </button>
            <div className="text-gray-600 text-xs text-center">AI generates a schema first. You review before seeing code.</div>
          </div>
        )}

        {activeTab === "Schema" && (
          <div className="max-w-2xl mx-auto">
            {schema ? (
              <>
                <SchemaPanel schema={schema} onUpdate={setSchema} />
                <div className="px-4 pb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("Code")}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition text-sm"
                  >
                    Looks Good → View Code
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-600 text-sm text-center py-20">Generate an app first to see schema here.</div>
            )}
          </div>
        )}

        {activeTab === "Code" && (
          <div className="h-full">
            {Object.keys(pages).length > 0 ? <CodePanel pages={pages} /> : <div className="text-gray-600 text-sm text-center py-20">No code generated yet.</div>}
          </div>
        )}

        {activeTab === "Preview" && (
          <div className="h-full" style={{ minHeight: "calc(100vh - 120px)" }}>
            {Object.keys(pages).length > 0 ? <PreviewPanel pages={pages} /> : <div className="text-gray-600 text-sm text-center py-20">No preview available yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
