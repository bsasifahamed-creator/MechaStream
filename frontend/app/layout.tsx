import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ConditionalNavLayout from '@/components/ConditionalNavLayout'
import { ProjectProvider } from '@/contexts/ProjectContext'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'MechaStream - Vibe Coding Platform',
  description: 'Code with the flow. Build apps, websites, and experiences with AI-powered tools, live preview, and seamless deployment.',
  keywords: ['coding platform', 'vibe coding', 'AI coding', 'live preview', 'web development', 'app builder', 'MechaStream'],
  authors: [{ name: 'MechaStream Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Critical CSS so layout works even if main stylesheet fails to load */}
        <style dangerouslySetInnerHTML={{ __html: `
          html,body{margin:0;padding:0;min-height:100vh;width:100%;background:#0b1220;color:#fff;font-family:Inter,system-ui,sans-serif;box-sizing:border-box;}
          *,*::before,*::after{box-sizing:border-box;}
          .bg-mono-black,.min-h-screen{background-color:#000;}
          .bg-mono-sidebar-bg{background-color:#0f0f0f;}
          .bg-mono-dark-bg{background-color:#1a1a1a;}
          .border-mono-border-grey{border-color:#e5e7eb;}
          .text-mono-white{color:#fff;}
          .text-mono-accent-blue{color:#3b82f6;}
          .text-mono-medium-grey{color:#6b7280;}
          .text-mono-destructive-red{color:#ef4444;}
          .min-h-screen{min-height:100vh;}
          .w-full{width:100%;}
          .max-w-7xl{max-width:80rem;}
          .mx-auto{margin-left:auto;margin-right:auto;}
          .px-4{padding-left:1rem;padding-right:1rem;}
          .py-2{padding-top:0.5rem;padding-bottom:0.5rem;}
          .flex{display:flex;}
          .gap-x-4{gap:0 1rem;}
          .rounded-lg{border-radius:0.5rem;}
          .border{border-width:1px;}
          input,button{font:inherit;}
        ` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning style={{ backgroundColor: '#0b1220', color: '#fff', minHeight: '100vh' }}>
        <ProjectProvider>
          <ConditionalNavLayout>{children}</ConditionalNavLayout>
        </ProjectProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {/* Debug script for overflow detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Debug helper: logs any element wider than viewport
              window.addEventListener('load', () => {
                const overflows = [];
                const vw = document.documentElement.clientWidth;
                document.querySelectorAll('*').forEach(el => {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > vw + 1) { // tolerance
                    overflows.push({
                      tag: el.tagName,
                      width: rect.width,
                      right: rect.right,
                      selector: getDomPath(el)
                    });
                  }
                });
                if (overflows.length) {
                  console.warn('Overflowing elements:', overflows);
                }

                function getDomPath(el) {
                  if (!el) return '';
                  const stack = [];
                  while (el.parentNode != null) {
                    let sibCount = 0;
                    let sibIndex = 0;
                    for (let i = 0; i < el.parentNode.childNodes.length; i++) {
                      const sib = el.parentNode.childNodes[i];
                      if (sib.nodeName === el.nodeName) {
                        if (sib === el) sibIndex = sibCount;
                        sibCount++;
                      }
                    }
                    const nodeName = el.nodeName.toLowerCase();
                    if (sibCount > 1) {
                      stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
                    } else {
                      stack.unshift(nodeName);
                    }
                    el = el.parentNode;
                  }
                  return stack.slice(1).join(' > '); // skip html
                }
              });
              
              // Additional overflow prevention
              document.addEventListener('DOMContentLoaded', () => {
                // Remove any 100vw usage that might cause overflow
                const styleSheets = document.styleSheets;
                for (let i = 0; i < styleSheets.length; i++) {
                  try {
                    const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                    for (let j = 0; j < rules.length; j++) {
                      const rule = rules[j];
                      if (rule.style && rule.style.width === '100vw') {
                        console.warn('Found 100vw width, consider using 100% instead:', rule.selectorText);
                      }
                    }
                  } catch (e) {
                    // Cross-origin stylesheets will throw error
                  }
                }
              });
            `
          }}
        />
      </body>
    </html>
  )
} 