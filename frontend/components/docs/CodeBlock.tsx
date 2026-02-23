"use client";

import { useState, useCallback } from "react";

type Segment = { text: string; className: string };

function highlight(code: string, language: string): Segment[] {
  if (language === "text" || !code.trim()) {
    return [{ text: code, className: "text-gray-300" }];
  }

  const segments: Segment[] = [];
  let remaining = code;

  if (language === "json") {
    const regex = /("(?:[^"\\]|\\.)*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
    let lastEnd = 0;
    let m;
    while ((m = regex.exec(code)) !== null) {
      if (m.index > lastEnd) segments.push({ text: code.slice(lastEnd, m.index), className: "text-gray-300" });
      const val = m[0];
      if (val.startsWith('"')) segments.push({ text: val, className: "text-green-400" });
      else if (val === "true" || val === "false" || val === "null") segments.push({ text: val, className: "text-yellow-400" });
      else segments.push({ text: val, className: "text-yellow-400" });
      lastEnd = regex.lastIndex;
    }
    if (lastEnd < code.length) segments.push({ text: code.slice(lastEnd), className: "text-gray-300" });
    return segments;
  }

  if (language === "typescript" || language === "ts" || language === "tsx") {
    const kw = /\b(const|let|var|function|return|import|export|default|from|type|interface|extends|string|number|boolean|void|async|await)\b/g;
    const combined = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(const|let|var|function|return|import|export|default|from|type|interface|extends|string|number|boolean|void|async|await)\b|\b\d+\.?\d*\b)/g;
    let lastEnd = 0;
    let m;
    while ((m = combined.exec(code)) !== null) {
      if (m.index > lastEnd) segments.push({ text: code.slice(lastEnd, m.index), className: "text-gray-300" });
      const val = m[0];
      if (val.startsWith("//") || val.startsWith("/*")) segments.push({ text: val, className: "text-gray-500" });
      else if (val.startsWith('"') || val.startsWith("'")) segments.push({ text: val, className: "text-green-400" });
      else if (/\b(const|let|var|function|return|import|export|default|from|type|interface|extends|string|number|boolean|void|async|await)\b/.test(val)) segments.push({ text: val, className: "text-indigo-400" });
      else if (/^\d+\.?\d*$/.test(val)) segments.push({ text: val, className: "text-yellow-400" });
      else segments.push({ text: val, className: "text-gray-300" });
      lastEnd = combined.lastIndex;
    }
    if (lastEnd < code.length) segments.push({ text: code.slice(lastEnd), className: "text-gray-300" });
    return segments;
  }

  if (language === "bash") {
    return [{ text: code, className: "text-gray-300" }];
  }

  return [{ text: code, className: "text-gray-300" }];
}

export default function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const segments = highlight(code, language);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        {title ? <span className="text-xs text-gray-500">{title}</span> : <span />}
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto overflow-y-auto max-h-[28rem]">
        <code>
          {segments.map((seg, i) => (
            <span key={i} className={seg.className}>{seg.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}
