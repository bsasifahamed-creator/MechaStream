import React, { useRef, useEffect } from 'react';

interface PreviewManagerProps {
  code: string;
  dependencies: string[];
  theme: {
    background: string;
    color: string;
  };
}

const PreviewManager: React.FC<PreviewManagerProps> = ({ code, dependencies, theme }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const handler = setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ code, deps: dependencies, theme }, '*');
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [code, dependencies, theme]);

  return (
    <iframe
      ref={iframeRef}
      src="/preview.html"
      title="Live Preview"
      sandbox="allow-scripts"
      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: theme.background }}
    />
  );
};

export default PreviewManager;