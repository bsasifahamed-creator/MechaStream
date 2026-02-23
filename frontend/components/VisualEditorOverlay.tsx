'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface VisualEditorOverlayProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
}

type ExecuteCommandResponse = {
  success?: boolean
  message?: string
  content?: string
  files?: string[]
  error?: string
}

declare global {
  interface Window {
    grapesjs?: any
  }
}

export default function VisualEditorOverlay({ isOpen, onClose, projectName }: VisualEditorOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<any>(null)
  const [isBooting, setIsBooting] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [initialHtml, setInitialHtml] = useState<string>('')
  const [initialCss, setInitialCss] = useState<string>('')
  const [isPreview, setIsPreview] = useState(false)
  const [rightTab, setRightTab] = useState<'styles' | 'layers' | 'traits'>('styles')
  const [leftTab, setLeftTab] = useState<'design' | 'elements' | 'uploads' | 'text' | 'background' | 'styles' | 'brand'>('elements')

  // Rebuild blocks on demand (if panel looks empty)
  const rebuildBlocks = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const bm = editor.BlockManager
    // Ensure Basics category exists once
    try {
      const cats = bm.getCategories()
      const basics = cats && (cats as any).find ? (cats as any).find((c: any) => c.get('id') === 'basics') : null
      if (!basics) bm.addCategory('basics', { id: 'basics', label: 'Basics', open: true })
    } catch {}
    const ensureBlock = (id: string, label: string, content: string) => {
      const existing = bm.get(id)
      if (!existing) bm.add(id, { label, content, category: 'basics', attributes: { class: 'gjs-block' } })
    }
    ensureBlock('section', 'Section', '<section class="py-12"><div class="container mx-auto">Section</div></section>')
    ensureBlock('heading', 'Heading', '<h2 class="text-3xl font-bold">Heading</h2>')
    ensureBlock('paragraph', 'Paragraph', '<p class="text-gray-600">Type your paragraph here</p>')
    ensureBlock('button', 'Button', '<a class="inline-block px-4 py-2 bg-blue-600 text-white rounded">Button</a>')
    ensureBlock('image', 'Image', '<img src="https://picsum.photos/800/400" class="w-full rounded"/>')
    ensureBlock('video', 'Video', '<div class="aspect-video"><iframe class="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe></div>')
    ensureBlock('divider', 'Divider', '<hr class="my-8 border-gray-300"/>')
    ensureBlock('spacer', 'Spacer', '<div style="height:40px"></div>')
    ensureBlock('iconbox', 'Icon Box', '<div class="p-6 rounded border text-center"><div class="text-3xl">⭐</div><div class="font-semibold mt-2">Title</div><div class="text-gray-600">Description</div></div>')
  }, [])

  const rebuildTextBlocks = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const bm = editor.BlockManager
    // Clear and ensure Text category only
    try { (bm.getAll() as any)?.reset?.([]) } catch {}
    try { (bm.getCategories() as any)?.reset?.([]) } catch {}
    bm.addCategory('text', { id: 'text', label: 'Text', open: true })
    const addText = (id: string, label: string, html: string) => {
      if (!bm.get(id)) bm.add(id, { label, content: html, category: 'text' })
    }
    addText('text-heading', 'Heading', '<h2 class="text-3xl font-bold">Heading</h2>')
    addText('text-sub', 'Subheading', '<h3 class="text-xl font-semibold">Subheading</h3>')
    addText('text-body', 'Body text', '<p class="text-gray-600">Start typing here…</p>')
    addText('text-cta', 'CTA Button', '<a class="inline-block px-5 py-2 bg-blue-600 text-white rounded">Get Started</a>')
  }, [])

  const openUploads = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.AssetManager.open()
  }, [])

  const setBackgroundColor = useCallback((color: string) => {
    const editor = editorRef.current
    if (!editor) return
    try {
      const doc = editor.Canvas.getDocument()
      doc.body.style.backgroundColor = color
    } catch {}
  }, [])

  const loadFile = useCallback(async (filePath: string) => {
    const res = await fetch('/api/execute-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'read', projectName, filePath })
    })
    const data = (await res.json()) as ExecuteCommandResponse
    if (!res.ok || data.error) throw new Error(data.error || 'Failed to read file')
    return data.content || ''
  }, [projectName])

  const saveFiles = useCallback(async (html: string, css: string) => {
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}" />
</head>
<body>
${html}
  <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`

    const updateHtml = fetch('/api/execute-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'update', projectName, filePath: 'backend/templates/index.html', content: htmlDoc })
    })
    const updateCss = fetch('/api/execute-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'update', projectName, filePath: 'backend/static/style.css', content: css })
    })
    const [r1, r2] = await Promise.all([updateHtml, updateCss])
    const d1 = (await r1.json()) as ExecuteCommandResponse
    const d2 = (await r2.json()) as ExecuteCommandResponse
    if (!r1.ok || d1.error) throw new Error(d1.error || 'Failed to save HTML')
    if (!r2.ok || d2.error) throw new Error(d2.error || 'Failed to save CSS')
  }, [projectName])

  const ensureGrapesAssets = useCallback(async () => {
    if (window.grapesjs) return
    await new Promise<void>((resolve, reject) => {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
      css.onload = () => resolve()
      css.onerror = () => reject(new Error('Failed to load GrapesJS CSS'))
      document.head.appendChild(css)
    })

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/grapesjs/dist/grapes.min.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load GrapesJS'))
      document.body.appendChild(script)
    })
  }, [])

  const getBodyFromHtml = (html: string) => {
    try {
      const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      return match ? match[1] : html
    } catch {
      return html
    }
  }

  const initEditor = useCallback(async () => {
    if (!isOpen || editorRef.current || !containerRef.current) return
    setIsBooting(true)
    setBootError(null)
    try {
      await ensureGrapesAssets()
      const [html, css] = await Promise.all([
        loadFile('backend/templates/index.html'),
        loadFile('backend/static/style.css')
      ])
      setInitialHtml(html)
      setInitialCss(css)

      const gjs = window.grapesjs
      const editor = gjs.init({
        container: containerRef.current,
        height: '100%',
        width: '100%',
        storageManager: false,
        fromElement: false,
        canvas: {
          styles: [
            'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
          ],
        },
        selectorManager: { componentFirst: true },
        layerManager: {},
        styleManager: {
          sectors: [
            { name: 'Layout', open: true, properties: ['display','position','top','right','bottom','left','width','height','margin','padding'] },
            { name: 'Typography', properties: ['font-family','font-size','font-weight','color','line-height','letter-spacing','text-align'] },
            { name: 'Background', properties: ['background-color','background','box-shadow','opacity'] },
            { name: 'Border', properties: ['border','border-radius'] },
          ]
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px' },
            { name: 'Mobile', width: '375px' },
          ]
        },
        blockManager: {
          appendTo: '#blocks-panel'
        },
        panels: { defaults: [] }
      })

      // Load content
      editor.setComponents(getBodyFromHtml(html))
      if (css?.trim()) editor.setStyle(css)

      // Ensure the main wrapper accepts drops
      try {
        const wrapper = editor.getWrapper()
        wrapper && wrapper.set({ droppable: true })
      } catch {}

      // Basic blocks
      const bm = editor.BlockManager
      // Ensure a single Basics category without wiping existing registry
      const ensureBasicsCategory = () => {
        const cats = bm.getCategories()
        const basics = cats && (cats as any).find ? (cats as any).find((c: any) => c.get('id') === 'basics') : null
        if (!basics) {
          bm.addCategory('basics', { id: 'basics', label: 'Basics', open: true })
        }
      }
      ensureBasicsCategory()

      const ensureBlock = (id: string, label: string, content: string) => {
        const existing = bm.get(id)
        if (!existing) {
          bm.add(id, { label, content, category: 'basics', attributes: { class: 'gjs-block' } })
        } else {
          try { if (existing.get('category') !== 'basics') existing.set('category', 'basics') } catch {}
        }
      }

      ensureBlock('section', 'Section', '<section class="py-12"><div class="container mx-auto">Section</div></section>')
      ensureBlock('heading', 'Heading', '<h2 class="text-3xl font-bold">Heading</h2>')
      ensureBlock('paragraph', 'Paragraph', '<p class="text-gray-600">Type your paragraph here</p>')
      ensureBlock('button', 'Button', '<a class="inline-block px-4 py-2 bg-blue-600 text-white rounded">Button</a>')
      ensureBlock('image', 'Image', '<img src="https://picsum.photos/800/400" class="w-full rounded"/>')
      ensureBlock('video', 'Video', '<div class="aspect-video"><iframe class="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe></div>')
      ensureBlock('divider', 'Divider', '<hr class="my-8 border-gray-300"/>')
      ensureBlock('spacer', 'Spacer', '<div style="height:40px"></div>')
      ensureBlock('iconbox', 'Icon Box', '<div class="p-6 rounded border text-center"><div class="text-3xl">⭐</div><div class="font-semibold mt-2">Title</div><div class="text-gray-600">Description</div></div>')

      // Panels: top bar controls (clear then populate to avoid duplicates)
      const topbar = document.getElementById('topbar-controls')
      if (topbar) {
        topbar.textContent = ''
        ;(['Desktop','Tablet','Mobile'] as const).forEach(name => {
          const btn = document.createElement('button')
          btn.className = 'px-2 py-1 text-xs bg-gray-200 rounded-sm mr-2'
          btn.textContent = name
          btn.onclick = () => editor.setDevice(name)
          topbar.appendChild(btn)
        })
        const editToggle = document.createElement('button')
        editToggle.className = 'ml-auto px-2 py-1 text-xs bg-gray-200 rounded-sm mr-2'
        editToggle.textContent = 'Preview'
        editToggle.onclick = () => {
          editor.runCommand('preview')
          setIsPreview(prev => {
            const next = !prev
            editToggle.textContent = next ? 'Edit' : 'Preview'
            return next
          })
        }
        const undo = document.createElement('button')
        undo.className = 'px-2 py-1 text-xs bg-gray-200 rounded-sm mr-2'
        undo.textContent = 'Undo'
        undo.onclick = () => editor.runCommand('core:undo')
        const redo = document.createElement('button')
        redo.className = 'px-2 py-1 text-xs bg-gray-200 rounded-sm mr-2'
        redo.textContent = 'Redo'
        redo.onclick = () => editor.runCommand('core:redo')
        const save = document.createElement('button')
        save.className = 'px-3 py-1 text-xs bg-blue-600 text-white rounded-sm'
        save.textContent = 'Save'
        save.onclick = async () => {
          const htmlOut = editor.getHtml()
          const cssOut = editor.getCss()
          try {
            await saveFiles(htmlOut, cssOut)
            ;(save as HTMLButtonElement).textContent = 'Saved'
            setTimeout(() => ((save as HTMLButtonElement).textContent = 'Save'), 1200)
          } catch (e: any) {
            alert(e?.message || 'Failed to save')
          }
        }
        topbar.appendChild(editToggle)
        topbar.appendChild(undo)
        topbar.appendChild(redo)
        topbar.appendChild(save)
      }

      // Inject managers into right side panels (clear to avoid duplicates)
      const layersEl = document.getElementById('layers-panel')
      const stylesEl = document.getElementById('styles-panel')
      const traitsEl = document.getElementById('traits-panel')
      if (layersEl) { layersEl.innerHTML = ''; layersEl.appendChild(editor.LayerManager.render()) }
      if (stylesEl) { stylesEl.innerHTML = ''; stylesEl.appendChild(editor.StyleManager.render()) }
      if (traitsEl) { traitsEl.innerHTML = ''; traitsEl.appendChild(editor.TraitManager.render()) }

      // Workaround: re-enable default Drag & Drop Manager if disabled
      try {
        const dnd = editor.Commands.get('core:component-drag')
        if (dnd && typeof dnd.run === 'function') {
          // no-op to ensure it's registered
        }
      } catch {}

      editorRef.current = editor
      setIsBooting(false)
    } catch (e: any) {
      setBootError(e?.message || 'Failed to start editor')
      setIsBooting(false)
    }
  }, [ensureGrapesAssets, isOpen, loadFile, projectName, saveFiles])

  useEffect(() => {
    if (isOpen) initEditor()
    return () => {
      try { editorRef.current?.destroy() } catch {}
      editorRef.current = null
    }
  }, [isOpen, initEditor])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/80 backdrop-blur-sm">
      <div className="absolute inset-0 flex">
        {/* Left toolbox + panel (custom themed) */}
        <div className="w-72 bg-white border-r overflow-auto" style={{
          // theme via CSS variables
          // define these in your site CSS: --ms-accent, --ms-surface, --ms-border
          backgroundColor: 'var(--ms-surface, #ffffff)'
        }}>
          <div className="p-2 border-b" style={{borderColor: 'var(--ms-border, #e5e7eb)'}}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => { setLeftTab('design') }} className={`px-2 py-1 rounded-sm ${leftTab==='design'?'bg-gray-800 text-white':'bg-gray-200'}`}>Design</button>
              <button onClick={() => { setLeftTab('elements'); rebuildBlocks() }} className={`px-2 py-1 rounded-sm ${leftTab==='elements'?'bg-gray-800 text-white':'bg-gray-200'}`}>Elements</button>
              <button onClick={() => { setLeftTab('uploads'); openUploads() }} className={`px-2 py-1 rounded-sm ${leftTab==='uploads'?'bg-gray-800 text-white':'bg-gray-200'}`}>Uploads</button>
              <button onClick={() => { setLeftTab('text'); rebuildTextBlocks() }} className={`px-2 py-1 rounded-sm ${leftTab==='text'?'bg-gray-800 text-white':'bg-gray-200'}`}>Text</button>
              <button onClick={() => setLeftTab('background')} className={`px-2 py-1 rounded-sm ${leftTab==='background'?'bg-gray-800 text-white':'bg-gray-200'}`}>Background</button>
              <button onClick={() => setLeftTab('styles')} className={`px-2 py-1 rounded-sm ${leftTab==='styles'?'bg-gray-800 text-white':'bg-gray-200'}`}>Styles</button>
            </div>
          </div>
          <div className="p-3 space-y-3">
            {leftTab === 'elements' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">Elements</div>
                <button onClick={rebuildBlocks} className="text-xs px-2 py-1 rounded-sm bg-gray-200 hover:bg-gray-300">Reload</button>
                </div>
                <div id="blocks-panel" className="space-y-2"></div>
              </>
            )}
            {leftTab === 'text' && (
              <>
                <div className="font-semibold text-sm">Text</div>
                <div className="text-xs text-gray-600">Drag a text style to the canvas</div>
                <div id="blocks-panel" className="space-y-2"></div>
              </>
            )}
            {leftTab === 'uploads' && (
              <div className="text-sm space-y-2">
                <div className="font-semibold">Uploads</div>
                <input type="file" multiple onChange={(e) => {
                  const editor = editorRef.current
                  if (!editor) return
                  const files = e.target.files
                  if (!files) return
                  const am = editor.AssetManager
                  Array.from(files).forEach(f => {
                    const reader = new FileReader()
                    reader.onload = () => {
                      am.add(reader.result as string)
                    }
                    reader.readAsDataURL(f)
                  })
                  editor.AssetManager.open()
                }} className="text-xs" />
                <button onClick={openUploads} className="text-xs px-2 py-1 rounded-sm bg-gray-200 hover:bg-gray-300">Open Library</button>
              </div>
            )}
            {leftTab === 'background' && (
              <div className="text-sm space-y-2">
                <div className="font-semibold">Background</div>
                <label className="text-xs text-gray-600">Color</label>
                <input type="color" defaultValue="#0b1220" onChange={(e)=> setBackgroundColor(e.target.value)} />
              </div>
            )}
            {leftTab === 'styles' && (
              <div className="text-sm space-y-2">
                <div className="font-semibold">Styles</div>
                <div className="grid grid-cols-6 gap-2">
                  {['#3b82f6','#22c55e','#eab308','#ef4444','#a855f7','#06b6d4','#111827','#f97316'].map(c => (
                    <button key={c} onClick={()=>{
                      const ed=editorRef.current; if(!ed) return; const sel=ed.getSelected();
                      if (sel) sel.addStyle({ color: c });
                    }} style={{background:c}} className="w-6 h-6 rounded-sm" />
                  ))}
                </div>
                <div className="text-xs text-gray-600">Select an element and click a swatch to set text color.</div>
              </div>
            )}
            {leftTab === 'design' && (
              <div className="text-sm space-y-2">
                <div className="font-semibold">Design Templates</div>
                <button onClick={()=>{
                  const ed=editorRef.current; if(!ed) return;
                  ed.setComponents('<section class="py-20"><div class="container mx-auto text-center"><h1 class="text-5xl font-bold mb-4">Hero Title</h1><p class="text-gray-600 max-w-2xl mx-auto">Beautiful, modern landing hero.</p><div class="mt-6"><a class="inline-block px-5 py-2 bg-blue-600 text-white rounded">Get Started</a></div></div></section>')
                }} className="px-2 py-1 rounded-sm bg-gray-200 hover:bg-gray-300">Apply Hero</button>
              </div>
            )}
          </div>
        </div>

        {/* Center canvas */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-2 border-b flex items-center justify-between" style={{borderColor: 'var(--ms-border, #e5e7eb)'}}>
            <div id="topbar-controls" className="flex items-center"></div>
            <button onClick={onClose} className="px-3 py-1 text-xs text-white rounded-sm" style={{background: 'var(--ms-accent, #111827)'}}>Close</button>
          </div>
          <div className="flex-1" ref={containerRef} id="gjs-canvas-container" style={{
            // Ensure canvas fills and allows drops
            minHeight: '100%',
          }}></div>
        </div>

        {/* Right styles/settings panel (custom themed) */}
        <div className="w-80 border-l p-3 text-sm flex flex-col" style={{
          backgroundColor: 'var(--ms-surface-alt, #f9fafb)',
          borderColor: 'var(--ms-border, #e5e7eb)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-700 font-semibold">Inspector</div>
            <div className="flex gap-1">
              <button onClick={() => setRightTab('styles')} className={`px-2 py-1 text-xs rounded-sm ${rightTab==='styles' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Styles</button>
              <button onClick={() => setRightTab('layers')} className={`px-2 py-1 text-xs rounded-sm ${rightTab==='layers' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Layers</button>
              <button onClick={() => setRightTab('traits')} className={`px-2 py-1 text-xs rounded-sm ${rightTab==='traits' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Traits</button>
            </div>
          </div>
          {bootError && <div className="mb-2 text-red-600">{bootError}</div>}
          <div className="flex-1 overflow-auto">
            <div id="styles-panel" style={{ display: rightTab==='styles' ? 'block' : 'none' }} />
            <div id="layers-panel" style={{ display: rightTab==='layers' ? 'block' : 'none' }} />
            <div id="traits-panel" style={{ display: rightTab==='traits' ? 'block' : 'none' }} />
          </div>
        </div>
      </div>

      {isBooting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-sm shadow p-4 text-sm">Booting visual editor…</div>
        </div>
      )}
    </div>
  )
}


