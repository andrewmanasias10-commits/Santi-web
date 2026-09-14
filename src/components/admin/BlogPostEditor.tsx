'use client'

/**
 * BlogPostEditor v6
 * - Sistema de PÁGINAS tipo Canva (cada página = sección del artículo)
 * - Botón + siempre visible para agregar bloques (no solo en hover)
 * - Subida real de imágenes desde escritorio (drag&drop + clic)
 * - Alineación de imágenes en tiempo real
 * - Barra de formato rica
 * - Vista previa fiel al blog público
 */

import { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type BlockType =
  | 'paragraph' | 'heading1' | 'heading2' | 'heading3'
  | 'quote' | 'callout' | 'bullet' | 'numbered'
  | 'code' | 'divider' | 'image'

export type ImageAlign = 'full' | 'center' | 'left' | 'right'

export interface Block {
  id: string
  type: BlockType
  content: string
  meta?: { src?: string; alt?: string; caption?: string; align?: ImageAlign; emoji?: string; sideText?: string }
}

export interface Page {
  id: string
  blocks: Block[]
}

interface Post {
  id?: string; title?: string; excerpt?: string; content?: any
  category?: string; cover_url?: string; color?: string
  is_published?: boolean; read_time?: number; slug?: string
  author_name?: string; tags?: string[]
}

function uid() { return Math.random().toString(36).slice(2, 9) }
function mkBlock(type: BlockType = 'paragraph'): Block {
  return { id: uid(), type, content: '', meta: {} }
}
function mkPage(): Page { return { id: uid(), blocks: [mkBlock()] } }

function safePages(raw: any): Page[] {
  // Puede venir como páginas (array de {id, blocks}) o como bloques planos
  if (Array.isArray(raw) && raw.length > 0) {
    // Si el primer elemento tiene 'blocks', es formato páginas
    if (raw[0]?.blocks) return raw as Page[]
    // Si el primer elemento tiene 'type', es formato bloques planos → una sola página
    if (raw[0]?.type) return [{ id: uid(), blocks: raw as Block[] }]
  }
  return [mkPage()]
}

// Aplanar páginas → array de bloques para el blog público
function flattenPages(pages: Page[]): Block[] {
  return pages.flatMap(p => p.blocks)
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
}
function wordCount(pages: Page[]) {
  return flattenPages(pages).reduce((a, b) =>
    a + (b.content?.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length || 0), 0)
}
function readTime(pages: Page[]) { return Math.max(1, Math.round(wordCount(pages) / 200)) }

const CATS = ['Para familias', 'Para profesionales', 'Recursos', 'Noticias', 'General']

// Tema de color por post (igual que el blog público)
const PREV_THEME: Record<string, { main: string; soft: string; tint: string; deep: string }> = {
  pink: { main: '#ff82ae', soft: '#ffd9e6', tint: '#fff2f6', deep: '#c74b78' },
  orange: { main: '#ffa600', soft: '#ffe4b3', tint: '#fff6e6', deep: '#b87700' },
  sky: { main: '#3dc5ff', soft: '#c9edff', tint: '#eef9ff', deep: '#1892cc' },
  green: { main: '#a4c21f', soft: '#e4f0b8', tint: '#f6fbe6', deep: '#728a10' },
}

const CATALOG: { type: BlockType; emoji: string; label: string; desc: string }[] = [
  { type: 'paragraph', emoji: '¶',   label: 'Párrafo',        desc: 'Texto normal' },
  { type: 'heading1',  emoji: 'H1',  label: 'Título grande',  desc: 'Encabezado H1' },
  { type: 'heading2',  emoji: 'H2',  label: 'Título medio',   desc: 'Sección H2' },
  { type: 'heading3',  emoji: 'H3',  label: 'Subtítulo',      desc: 'Subsección H3' },
  { type: 'image',     emoji: '🖼',  label: 'Imagen',         desc: 'Sube o URL' },
  { type: 'quote',     emoji: '❝',   label: 'Cita',           desc: 'Texto destacado' },
  { type: 'callout',   emoji: '💡',  label: 'Aviso',          desc: 'Cuadro de nota' },
  { type: 'bullet',    emoji: '•',   label: 'Lista viñeta',   desc: 'Ítem con bullet' },
  { type: 'numbered',  emoji: '1.',  label: 'Lista numerada', desc: 'Ítem numerado' },
  { type: 'code',      emoji: '</>',  label: 'Código',         desc: 'Bloque de código' },
  { type: 'divider',   emoji: '—',   label: 'Separador',      desc: 'Línea divisoria' },
]

// ── Upload ────────────────────────────────────────────────────────────────────

async function uploadImg(file: File, sb: ReturnType<typeof createClient>): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const name = `blog-${uid()}-${Date.now()}.${ext}`
  const { error } = await sb.storage.from('blog-covers').upload(name, file, {
    contentType: file.type, upsert: true, cacheControl: '3600',
  })
  if (error) throw error
  return sb.storage.from('blog-covers').getPublicUrl(name).data.publicUrl
}

// ── FormatBar ─────────────────────────────────────────────────────────────────

function FormatBar({ target, onFormat, savedRangeRef, onSaveRange }: {
  target: HTMLElement | null
  onFormat: () => void
  // Pasamos el REF en vez del valor — así siempre leemos el rango más reciente
  // (la prop estática quedaba obsoleta entre renders y los comandos se aplicaban
  // sobre una selección vieja, por eso "viñetas" y "tamaño" parecían no hacer nada).
  savedRangeRef: React.MutableRefObject<Range | null>
  onSaveRange: () => void
}) {
  const [lm, setLm] = useState(false)
  const [lu, setLu] = useState('')
  const linkSavedRange = useRef<Range | null>(null)

  // Restaura la selección guardada SOLO si la actual no está dentro del editor.
  // Si el editor ya tiene su selección viva, la respetamos (no la pisamos con
  // una vieja). Esto era el bug por el que viñetas/tamaño se aplicaban en el
  // lugar equivocado o sobre nada.
  const restoreRange = (override?: Range | null) => {
    if (!target) return
    const sel = window.getSelection()
    const liveInEditor =
      sel && sel.rangeCount > 0 && target.contains(sel.anchorNode)
    if (liveInEditor && !override) {
      target.focus()
      return // mantiene la selección actual
    }
    target.focus()
    const r = override || savedRangeRef.current
    if (!r || !sel) return
    sel.removeAllRanges()
    sel.addRange(r)
  }

  // Ejecuta un comando preservando la selección
  const ex = (cmd: string, val?: string, rangeOverride?: Range | null) => {
    restoreRange(rangeOverride)
    document.execCommand(cmd, false, val)
    onFormat()
  }

  // Aplica un tamaño en píxeles a la selección actual.
  // Truco: forzamos modo LEGACY para que execCommand('fontSize', '7') genere
  // <font size="7"> (no <span style="font-size: xxx-large">). Después los
  // reemplazamos por <span style="font-size: Xpx"> con el tamaño real elegido.
  const applyFontSize = (px: string) => {
    if (!target) return
    restoreRange()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    // Asegurar modo legacy para obtener <font size="7"> reemplazable
    try { document.execCommand('styleWithCSS', false, 'false') } catch {}
    document.execCommand('fontSize', false, '7')
    const fontTags = target.querySelectorAll('font[size="7"]')
    fontTags.forEach(s => {
      const sp = document.createElement('span')
      sp.style.fontSize = px
      sp.innerHTML = (s as HTMLElement).innerHTML
      s.replaceWith(sp)
    })
    onFormat()
  }

  // Validar y aplicar link — agrega https:// si falta protocolo
  const applyLink = () => {
    let url = lu.trim()
    if (!url) { setLm(false); setLu(''); return }
    // Detecta protocolo válido. Si es un email, usa mailto:
    if (!/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(url)) {
      if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(url)) {
        url = 'mailto:' + url
      } else {
        url = 'https://' + url
      }
    }
    ex('createLink', url, linkSavedRange.current)
    // Marca los nuevos links para abrir en nueva pestaña
    if (target) {
      target.querySelectorAll('a:not([data-blog-link])').forEach(a => {
        a.setAttribute('data-blog-link', '1')
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
      })
      onFormat()
    }
    setLm(false); setLu('')
  }

  const openLinkMode = () => {
    onSaveRange()
    // Capturamos el range actual para usarlo al aplicar el link
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && target?.contains(sel.anchorNode)) {
      linkSavedRange.current = sel.getRangeAt(0).cloneRange()
    } else {
      linkSavedRange.current = savedRangeRef.current
    }
    setLm(true)
  }

  const B: React.CSSProperties = {
    width: 30, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid #ececec', borderRadius: 6, background: '#fff',
    color: '#444', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
  }
  const BW: React.CSSProperties = { ...B, width: 'auto', padding: '0 9px' }
  const sep = <span style={{ width:1, height:20, background:'#ececec', margin:'0 3px' }} />

  return (
    <div
      style={{ display:'flex', alignItems:'center', gap:2, flexWrap:'wrap', padding:'5px 8px', marginBottom:8, background:'#fff', border:'1px solid #ececec', borderRadius:10, boxShadow:'0 2px 16px rgba(0,0,0,.1)' }}
      onMouseDown={e => {
        const el = e.target as HTMLElement
        const tag = el.tagName
        const inputType = (el as HTMLInputElement).type
        const isFormControl =
          tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || inputType === 'color'
        if (!isFormControl) e.preventDefault()
      }}
    >
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('bold') }} title="Negrita"><b>B</b></button>
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('italic') }} title="Cursiva"><i>I</i></button>
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('underline') }} title="Subrayado"><u>U</u></button>
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('strikeThrough') }} title="Tachado"><s>S</s></button>
      {sep}
      <button type="button" style={BW} onMouseDown={e => { e.preventDefault(); ex('insertUnorderedList') }} title="Lista con viñetas">• Lista</button>
      <button type="button" style={BW} onMouseDown={e => { e.preventDefault(); ex('insertOrderedList') }} title="Lista numerada">1. Lista</button>
      {sep}
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('justifyLeft') }} title="Alinear izquierda">⬅</button>
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('justifyCenter') }} title="Centrar">⬛</button>
      <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('justifyRight') }} title="Alinear derecha">➡</button>
      {sep}
      <select
        defaultValue=""
        onMouseDown={() => onSaveRange()}
        onChange={e => { const v = e.target.value; e.target.value = ''; if (v) applyFontSize(v) }}
        style={{ height:28, fontSize:11, border:'1px solid #ececec', borderRadius:6, background:'#fff', color:'#444', padding:'0 4px', cursor:'pointer' }}
        title="Tamaño de texto"
      >
        <option value="">Tamaño</option>
        <option value="12px">Pequeño</option>
        <option value="16px">Normal</option>
        <option value="20px">Grande</option>
        <option value="26px">Muy grande</option>
        <option value="34px">Extra</option>
      </select>
      {sep}
      <label style={{ display:'inline-flex', alignItems:'center', gap:3, cursor:'pointer' }}
        onMouseDown={() => onSaveRange()} title="Color de texto">
        <span style={{ fontSize:12, color:'#888', fontWeight:700 }}>A</span>
        <input type="color" defaultValue="#1a1a1a"
          onInput={e => ex('foreColor', (e.target as HTMLInputElement).value)}
          style={{ width:22, height:22, border:'none', background:'none', padding:0, cursor:'pointer' }} />
      </label>
      <label style={{ display:'inline-flex', alignItems:'center', gap:3, cursor:'pointer' }}
        onMouseDown={() => onSaveRange()} title="Color de resaltado">
        <span style={{ fontSize:10, color:'#888' }}>BG</span>
        <input type="color" defaultValue="#fff59d"
          onInput={e => ex('hiliteColor', (e.target as HTMLInputElement).value)}
          style={{ width:22, height:22, border:'none', background:'none', padding:0, cursor:'pointer' }} />
      </label>
      {sep}
      {lm ? (
        <>
          <input
            autoFocus type="text" placeholder="https://... o tu@correo.com" value={lu}
            onChange={e => setLu(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink() }
              else if (e.key === 'Escape') { setLm(false); setLu('') }
            }}
            style={{ height:26, fontSize:12, border:'1px solid #ececec', borderRadius:6, padding:'0 8px', width:200 }} />
          <button type="button"
            onMouseDown={e => { e.preventDefault(); applyLink() }}
            style={{ ...B, background:'#16a34a', color:'#fff', border:'none' }}
            title="Aplicar enlace">✓</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); setLm(false); setLu('') }} style={B} title="Cancelar">✕</button>
        </>
      ) : (
        <>
          <button type="button" style={B} onMouseDown={e => { e.preventDefault(); openLinkMode() }} title="Insertar enlace (selecciona texto antes)">🔗</button>
          <button type="button" style={B} onMouseDown={e => { e.preventDefault(); ex('unlink') }} title="Quitar enlace">✂</button>
        </>
      )}
      {sep}
      <button type="button" style={{ ...B, fontSize:10, width:46 }} onMouseDown={e => { e.preventDefault(); ex('removeFormat') }} title="Limpiar formato">✕ fmt</button>
    </div>
  )
}

// ── RichTextArea ──────────────────────────────────────────────────────────────

function RichTextArea({ blockId, initialHtml, placeholder, style, onCommit }: {
  blockId: string; initialHtml: string; placeholder?: string
  style?: React.CSSProperties; onCommit: (html: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const lastId = useRef('')
  const [focused, setFocused] = useState(false)
  const [empty, setEmpty] = useState(!initialHtml)
  const savedRangeRef = useRef<Range | null>(null)
  const [, forceUpdate] = useState(0)

  const saveRange = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  useLayoutEffect(() => {
    if (!ref.current || lastId.current === blockId) return
    ref.current.innerHTML = initialHtml || ''
    lastId.current = blockId
    setEmpty(!initialHtml)
  }, [blockId, initialHtml])

  return (
    <div style={{ position:'relative' }} data-editor-root="1">
      {focused && (
        <FormatBar
          target={ref.current}
          onFormat={() => { forceUpdate(n=>n+1); if (ref.current) onCommit(ref.current.innerHTML) }}
          savedRangeRef={savedRangeRef}
          onSaveRange={saveRange}
        />
      )}
      {empty && !focused && placeholder && (
        <div style={{ position:'absolute', top:0, left:0, pointerEvents:'none', color:'#ccc', lineHeight:1.75, userSelect:'none', ...style }}>
          {placeholder}
        </div>
      )}
      <div ref={ref} contentEditable suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={e => {
          // Si el foco va a la FormatBar, no ocultarla
          const related = e.relatedTarget as HTMLElement | null
          if (related && e.currentTarget.closest('[data-editor-root]')?.contains(related)) return
          setFocused(false)
          if (ref.current) onCommit(ref.current.innerHTML)
        }}
        onInput={() => { const v = ref.current?.innerHTML || ''; setEmpty(v==='' || v==='<br>') }}
        onMouseUp={saveRange}
        onKeyUp={saveRange}
        style={{ outline:'none', minHeight:28, wordBreak:'break-word', lineHeight:1.75, ...style }}
      />
    </div>
  )
}

// ── SideTextArea — texto editable al lado de la imagen ───────────────────────

function SideTextArea({ blockId, value, onChange, placeholder }: {
  blockId: string
  value: string
  onChange: (html: string) => void
  placeholder: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const lastId = useRef('')
  const [focused, setFocused] = useState(false)
  const [empty, setEmpty] = useState(!value)

  useLayoutEffect(() => {
    if (!ref.current || lastId.current === blockId + '_side') return
    ref.current.innerHTML = value || ''
    lastId.current = blockId + '_side'
    setEmpty(!value)
  }, [blockId, value])

  const savedRangeRef = useRef<Range | null>(null)
  const saveRange = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange()
  }

  return (
    <div style={{ position:'relative', minHeight:40 }}>
      {focused && (
        <FormatBar
          target={ref.current}
          onFormat={() => ref.current && onChange(ref.current.innerHTML)}
          savedRangeRef={savedRangeRef}
          onSaveRange={saveRange}
        />
      )}
      {empty && !focused && (
        <div style={{
          position:'absolute', top:0, left:0, pointerEvents:'none',
          color:'#ccc', fontFamily:'inherit', fontSize:16,
          lineHeight:1.75, userSelect:'none',
        }}>{placeholder}</div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (ref.current) onChange(ref.current.innerHTML) }}
        onInput={() => { const v = ref.current?.innerHTML || ''; setEmpty(v==='' || v==='<br>') }}
        onMouseUp={saveRange}
        onKeyUp={saveRange}
        style={{
          outline:'none', minHeight:40, wordBreak:'break-word',
          fontFamily:'inherit', fontSize:16, lineHeight:1.75,
          color:'#1a1a1a',
        }}
      />
    </div>
  )
}

// ── ImageBlock ────────────────────────────────────────────────────────────────

function ImageBlock({ block, onUpdateMeta, sb }: {
  block: Block
  onUpdateMeta: (m: Partial<NonNullable<Block['meta']>>) => void
  sb: ReturnType<typeof createClient>
}) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [urlVal, setUrlVal] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const doUpload = async (file: File) => {
    const ok = ['image/jpeg','image/png','image/webp','image/gif']
    if (!ok.includes(file.type)) { setErr('Usa JPG, PNG, WebP o GIF'); return }
    if (file.size > 10 * 1024 * 1024) { setErr('Máx. 10 MB'); return }
    setErr(''); setUploading(true)
    try { onUpdateMeta({ src: await uploadImg(file, sb) }) }
    catch(e:any) { setErr(e.message || 'Error al subir') }
    finally { setUploading(false) }
  }

  const src = block.meta?.src
  const align: ImageAlign = block.meta?.align || 'full'

  const ALIGNS: { key: ImageAlign; label: string }[] = [
    { key:'full',   label:'↔ Ancho' },
    { key:'left',   label:'⬅ Izq.' },
    { key:'center', label:'⬛ Centro' },
    { key:'right',  label:'Der. ➡' },
  ]

  if (src) {
    const isFloat = align === 'left' || align === 'right'
    const imgW = align==='full' ? '100%' : align==='center' ? '68%' : '42%'

    return (
      <div>
        {/* Layout: imagen + texto lateral si está flotada */}
        {isFloat ? (
          <div style={{ marginBottom:10 }}>
            {/* Float: imagen flota, texto rodea y continúa debajo */}
            <div style={{ overflow:'hidden' }}>
              <div style={{
                float: align==='left' ? 'left' : 'right',
                width: imgW,
                marginRight: align==='left' ? 18 : 0,
                marginLeft: align==='right' ? 18 : 0,
                marginBottom: 8,
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <img src={src} alt={block.meta?.alt||''} style={{ width:'100%', display:'block', objectFit:'cover' }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,.65)', color:'#fff', border:'none', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  🔄 Cambiar
                </button>
              </div>
              {/* Texto fluye al lado y continúa debajo cuando se acaba el espacio */}
              <SideTextArea
                blockId={block.id}
                value={block.meta?.sideText || ''}
                onChange={v => onUpdateMeta({ sideText: v })}
                placeholder={align==='left'
                  ? 'El texto fluye al lado derecho de la imagen y continúa debajo...'
                  : 'El texto fluye al lado izquierdo de la imagen y continúa debajo...'}
              />
              <div style={{ clear:'both' }} />
            </div>
          </div>
        ) : (
          /* Imagen centrada o ancho completo */
          <div style={{ marginBottom:10 }}>
            <div style={{
              width: imgW, position:'relative',
              display: 'block',
              margin: align==='center' ? '0 auto' : undefined,
            }}>
              <img src={src} alt={block.meta?.alt||''} style={{ width:'100%', display:'block', borderRadius:10, maxHeight:420, objectFit:'cover' }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,.65)', color:'#fff', border:'none', borderRadius:7, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                🔄 Cambiar
              </button>
            </div>
          </div>
        )}

        {/* Controles de alineación */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#aaa', fontFamily:'inherit', marginRight:2 }}>Posición:</span>
          {ALIGNS.map(a => (
            <button key={a.key} type="button" onClick={() => onUpdateMeta({ align: a.key })} style={{
              padding:'4px 10px', fontSize:11, fontWeight:700,
              border:`1.5px solid ${align===a.key ? '#ff82ae' : '#ececec'}`,
              background: align===a.key ? '#ffffff' : '#fff',
              color: align===a.key ? '#ff82ae' : '#888',
              borderRadius:7, cursor:'pointer', fontFamily:'inherit',
            }}>{a.label}</button>
          ))}
          <button type="button" onClick={() => onUpdateMeta({ src: undefined, sideText: undefined })} style={{
            padding:'4px 10px', fontSize:11, fontWeight:700, marginLeft:'auto',
            border:'1.5px solid #fca5a5', background:'#fef2f2', color:'#dc2626',
            borderRadius:7, cursor:'pointer', fontFamily:'inherit',
          }}>✕ Quitar imagen</button>
        </div>

        {/* Pie de foto */}
        <input type="text" placeholder="Pie de foto (opcional)" value={block.meta?.caption||''}
          onChange={e => onUpdateMeta({ caption: e.target.value, alt: e.target.value })}
          style={{ display:'block', width:'100%', border:'none', borderBottom:'1px solid #ffffff', padding:'4px 0', fontSize:12, color:'#aaa', fontStyle:'italic', outline:'none', background:'transparent', fontFamily:'inherit', boxSizing:'border-box' }} />
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
          onChange={e => { const f=e.target.files?.[0]; if(f) doUpload(f); e.target.value='' }} />
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) doUpload(f) }}
        style={{
          border:`2.5px dashed ${dragging ? '#ff82ae' : '#ececec'}`,
          borderRadius:14, padding:'36px 20px', textAlign:'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragging ? '#ffffff' : '#ffffff',
          transition:'all .2s',
        }}
      >
        {uploading ? (
          <div style={{ color:'#ff82ae', fontFamily:'inherit' }}>
            <div style={{ fontSize:32, marginBottom:8, animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</div>
            <div style={{ fontSize:14, fontWeight:700 }}>Subiendo imagen...</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:42, marginBottom:10, opacity:.6 }}>🖼</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#555', fontFamily:'inherit', marginBottom:6 }}>Arrastra tu imagen aquí</div>
            <div style={{ fontSize:12, color:'#aaa', fontFamily:'inherit', marginBottom:16 }}>o haz clic para seleccionar desde tu dispositivo</div>
            <div style={{ display:'inline-block', background:'#ff82ae', color:'#fff', padding:'9px 22px', borderRadius:10, fontSize:13, fontWeight:800, fontFamily:'inherit' }}>
              📁 Seleccionar imagen
            </div>
            <div style={{ fontSize:11, color:'#ccc', fontFamily:'inherit', marginTop:12 }}>JPG · PNG · WebP · GIF · Máx. 10 MB</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:'none' }}
        onChange={e => { const f=e.target.files?.[0]; if(f) doUpload(f); e.target.value='' }} />
      {/* URL alternativa */}
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <input type="url" placeholder="...o pega una URL de imagen" value={urlVal}
          onChange={e => setUrlVal(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter' && urlVal.trim()) { onUpdateMeta({ src: urlVal.trim() }); setUrlVal('') } }}
          style={{ flex:1, height:36, padding:'0 12px', border:'1px solid #ececec', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit' }} />
        <button type="button"
          onClick={() => { if(urlVal.trim()) { onUpdateMeta({ src: urlVal.trim() }); setUrlVal('') } }}
          style={{ padding:'0 16px', height:36, background:'#ff82ae', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
          Usar URL
        </button>
      </div>
      {err && <p style={{ color:'#e53e3e', fontSize:12, margin:'6px 0 0', fontFamily:'inherit' }}>{err}</p>}
    </div>
  )
}

// ── BlockContent ──────────────────────────────────────────────────────────────

function BlockContent({ block, upd, updMeta, sb }: {
  block: Block
  upd: (p: Partial<Block>) => void
  updMeta: (m: Partial<NonNullable<Block['meta']>>) => void
  sb: ReturnType<typeof createClient>
}) {
  const rte = (ph: string, st?: React.CSSProperties) => ({
    blockId: block.id, initialHtml: block.content||'',
    placeholder: ph, style: st,
    onCommit: (html: string) => upd({ content: html }),
  })

  if (block.type==='paragraph') return <RichTextArea {...rte('Escribe aquí...', { fontFamily:'inherit', fontSize:16, color:'#1a1a1a' })} />
  if (block.type==='heading1')  return <RichTextArea {...rte('Título H1...', { fontFamily:'inherit', fontSize:30, fontWeight:'700', lineHeight:'1.2', color:'#1a1a1a' })} />
  if (block.type==='heading2')  return <RichTextArea {...rte('Título H2...', { fontFamily:'inherit', fontSize:22, fontWeight:'700', color:'#1a1a1a' })} />
  if (block.type==='heading3')  return <RichTextArea {...rte('Subtítulo H3...', { fontFamily:'inherit', fontSize:17, fontWeight:'700', color:'#1a1a1a' })} />

  if (block.type==='quote') return (
    <div style={{ borderLeft:'4px solid #ff82ae', paddingLeft:16, background:'linear-gradient(to right,#ffffff,transparent)', padding:'12px 16px', borderLeftWidth:4, borderLeftStyle:'solid', borderLeftColor:'#ff82ae', borderRadius:'0 8px 8px 0' }}>
      <RichTextArea {...rte('Una cita importante...', { fontFamily:'inherit', fontSize:17, fontStyle:'italic', color:'#4d4d4d' })} />
    </div>
  )
  if (block.type==='callout') {
    const EMOJIS = ['💡','⚠️','📌','✅','❌','🔥','💬','📢','🎯','💎']
    const curEmoji = block.meta?.emoji || '💡'
    const nextEmoji = () => {
      const i = EMOJIS.indexOf(curEmoji)
      updMeta({ emoji: EMOJIS[(i + 1) % EMOJIS.length] })
    }
    return (
      <div style={{ display:'flex', gap:12, background:'#ffffff', border:'1.5px solid #ececec', borderRadius:12, padding:'12px 16px', alignItems:'flex-start' }}>
        <button
          type="button"
          onClick={nextEmoji}
          title="Clic para cambiar emoji"
          style={{ fontSize:'1.4rem', background:'rgba(0,0,0,.05)', border:'none', borderRadius:8, width:38, height:38, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}
        >
          {curEmoji}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <RichTextArea {...rte('Escribe aquí el texto del aviso...', { fontFamily:'inherit', fontSize:15, color:'#1a1a1a' })} />
        </div>
      </div>
    )
  }
  if (block.type==='bullet') return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
      <span style={{ color:'#ff82ae', fontSize:20, lineHeight:'1.6', flexShrink:0, marginTop:2, userSelect:'none' }}>•</span>
      <textarea
        value={block.content.replace(/<[^>]+>/g, '')}
        onChange={e => upd({ content: e.target.value })}
        placeholder="Punto de lista..."
        rows={Math.max(1, Math.ceil((block.content.replace(/<[^>]+>/g, '').length || 1) / 60))}
        style={{ flex:1, border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:16, color:'#1a1a1a', background:'transparent', lineHeight:1.75, padding:0, overflow:'hidden' }}
        onInput={e => { const t = e.currentTarget; t.style.height='auto'; t.style.height=t.scrollHeight+'px' }}
      />
    </div>
  )
  if (block.type==='numbered') return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
      <span style={{ color:'#ff82ae', fontSize:14, fontWeight:700, fontFamily:'inherit', lineHeight:'1.75', flexShrink:0, minWidth:22, marginTop:1, userSelect:'none' }}>1.</span>
      <textarea
        value={block.content.replace(/<[^>]+>/g, '')}
        onChange={e => upd({ content: e.target.value })}
        placeholder="Punto numerado..."
        rows={Math.max(1, Math.ceil((block.content.replace(/<[^>]+>/g, '').length || 1) / 60))}
        style={{ flex:1, border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:16, color:'#1a1a1a', background:'transparent', lineHeight:1.75, padding:0, overflow:'hidden' }}
        onInput={e => { const t = e.currentTarget; t.style.height='auto'; t.style.height=t.scrollHeight+'px' }}
      />
    </div>
  )
  if (block.type==='code') return (
    <textarea value={block.content} onChange={e => upd({ content: e.target.value })}
      placeholder="// Código aquí..." rows={Math.max(3,(block.content||'').split('\n').length+1)}
      style={{ width:'100%', border:'none', resize:'vertical', fontFamily:"'Fira Mono',Consolas,monospace", fontSize:13, lineHeight:1.6, color:'#d4d4d4', background:'#1e1e1e', outline:'none', padding:'12px 16px', borderRadius:10, boxSizing:'border-box' }} />
  )
  if (block.type==='divider') return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'4px 0' }}>
      <div style={{ flex:1, height:2, background:'linear-gradient(to right,transparent,#ececec,transparent)', borderRadius:2 }} />
      <span style={{ fontSize:14, color:'#ccc' }}>✦</span>
      <div style={{ flex:1, height:2, background:'linear-gradient(to left,transparent,#ececec,transparent)', borderRadius:2 }} />
    </div>
  )
  if (block.type==='image') return <ImageBlock block={block} onUpdateMeta={updMeta} sb={sb} />

  return null
}

// ── BlockMenu — posición fija calculada desde el botón ────────────────────────

function BlockMenu({ onSelect, onClose, anchorRef }: {
  onSelect: (t: BlockType) => void
  onClose: () => void
  anchorRef?: React.RefObject<HTMLButtonElement | null>
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!anchorRef?.current) return
    const r = anchorRef.current.getBoundingClientRect()
    const menuW = 390
    let left = r.left + r.width / 2 - menuW / 2
    if (left < 12) left = 12
    if (left + menuW > window.innerWidth - 12) left = window.innerWidth - menuW - 12
    const viewH = window.visualViewport?.height ?? window.innerHeight
    const menuH = Math.min(380, viewH - 24)
    let top = r.bottom + 10
    if (top + menuH > viewH - 12) top = r.top - menuH - 10
    if (top < 12) top = 12
    setPos({ top, left })
  }, [])

  return createPortal(
    <>
      <div style={{ position:'fixed', inset:0, zIndex:9998 }} onClick={onClose} />
      <div style={{
        position:'fixed', top: pos.top, left: pos.left,
        zIndex:9999, width:390,
        background:'#fff', border:'1.5px solid #ececec',
        borderRadius:18, boxShadow:'0 20px 60px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.08)',
        padding:16,
        maxHeight: `calc(100dvh - ${pos.top + 12}px)`,
        overflowY: 'auto',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, paddingBottom:10, borderBottom:'1px solid #ffffff' }}>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'#aaa', fontFamily:'inherit' }}>
            ✦ Añadir bloque
          </span>
          <button type="button" onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:20, lineHeight:1, padding:0 }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
          {CATALOG.map(ct => (
            <button key={ct.type} type="button" onClick={() => { onSelect(ct.type); onClose() }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:'1.5px solid #ffffff', borderRadius:12, cursor:'pointer', background:'#ffffff', textAlign:'left', transition:'all .12s' }}
              onMouseEnter={e => {
                e.currentTarget.style.background='#ffffff'
                e.currentTarget.style.borderColor='#ff82ae'
                e.currentTarget.style.transform='translateY(-1px)'
                e.currentTarget.style.boxShadow='0 4px 12px rgba(196,120,60,.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background='#ffffff'
                e.currentTarget.style.borderColor='#ffffff'
                e.currentTarget.style.transform='none'
                e.currentTarget.style.boxShadow='none'
              }}
            >
              <span style={{ width:34, height:34, borderRadius:9, background:'#fff', border:'1px solid #ececec', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0, fontFamily:'inherit' }}>
                {ct.emoji}
              </span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a', fontFamily:'inherit', marginBottom:2 }}>{ct.label}</div>
                <div style={{ fontSize:10, color:'#aaa', fontFamily:'inherit', lineHeight:1.3 }}>{ct.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>, document.body
  )
}


// ── SingleBlock (bloque dentro de una página) ─────────────────────────────────

function SingleBlock({ block, pageId, idx, total, onUpdate, onUpdateMeta, onDelete, onMove, onAddAfter, sb }: {
  block: Block; pageId: string; idx: number; total: number
  onUpdate: (p: Partial<Block>) => void
  onUpdateMeta: (m: Partial<NonNullable<Block['meta']>>) => void
  onDelete: () => void
  onMove: (dir: -1|1) => void
  onAddAfter: (type: BlockType) => void
  sb: ReturnType<typeof createClient>
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const blockAccent: Partial<Record<BlockType,string>> = {
    heading1:'#7c3aed', heading2:'#2563eb', heading3:'#0891b2',
    quote:'#ff82ae', callout:'#ffa600', image:'#059669', code:'#374151',
  }
  const accent = blockAccent[block.type] || '#aaa'

  return (
    <div style={{ position:'relative', marginBottom:4 }}>
      <div style={{
        background:'#fff',
        border:`1.5px solid #ffffff`,
        borderLeft:`3px solid ${accent}55`,
        borderRadius:12,
        boxShadow:'0 1px 4px rgba(0,0,0,.04)',
        transition:'box-shadow .2s',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow=`0 4px 20px ${accent}18`}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,.04)'}
      >
        {/* Header del bloque */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 10px', background:'#ffffff', borderBottom:'1px solid #ffffff', borderRadius:'9px 9px 0 0' }}>
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color: accent+'cc', fontFamily:'inherit' }}>
            {CATALOG.find(c=>c.type===block.type)?.emoji} {CATALOG.find(c=>c.type===block.type)?.label}
          </span>
          <div style={{ display:'flex', gap:3 }}>
            {idx > 0       && <Btn icon="↑" tip="Subir"    onClick={() => onMove(-1)} />}
            {idx < total-1 && <Btn icon="↓" tip="Bajar"    onClick={() => onMove(1)} />}
            <Btn icon="🗑" tip="Eliminar" onClick={onDelete} danger />
          </div>
        </div>
        {/* Contenido */}
        <div style={{ padding:'12px 16px' }}>
          <BlockContent block={block} upd={onUpdate} updMeta={onUpdateMeta} sb={sb} />
        </div>
      </div>

      {/* Botón + para agregar bloque después — SIEMPRE VISIBLE */}
      <div style={{ display:'flex', justifyContent:'center', position:'relative', height:28, zIndex:20, marginTop:-14 }}>
        <div style={{ position:'relative' }}>
          <button ref={btnRef} type="button"
            onClick={() => setMenuOpen(o => !o)}
            title="Agregar bloque aquí"
            style={{
              width:28, height:28, borderRadius:'50%',
              border:'2px solid #ececec', background:'#fff',
              color:'#999', fontSize:18, lineHeight:1,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 2px 8px rgba(0,0,0,.12)',
              transition:'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#ff82ae'; e.currentTarget.style.color='#ff82ae'; e.currentTarget.style.transform='scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#ececec'; e.currentTarget.style.color='#999'; e.currentTarget.style.transform='scale(1)' }}
          >+</button>
          {menuOpen && (
            <BlockMenu
              onSelect={type => { onAddAfter(type); setMenuOpen(false) }}
              onClose={() => setMenuOpen(false)}
              anchorRef={btnRef}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Btn helper ────────────────────────────────────────────────────────────────

function Btn({ icon, tip, onClick, danger }: { icon:string; tip:string; onClick:()=>void; danger?:boolean }) {
  const isTrash = icon === '🗑'
  return (
    <button type="button" title={tip} onClick={onClick} style={{
      width:26, height:26, borderRadius:6,
      border:`1px solid ${danger ? '#fca5a5' : '#ececec'}`,
      background: danger ? '#fef2f2' : '#fff',
      color: danger ? '#dc2626' : '#666',
      fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {isTrash ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      ) : icon}
    </button>
  )
}

// ── PageCard (una "página" tipo Canva) ────────────────────────────────────────

function PageCard({ page, pageIdx, totalPages, onUpdateBlock, onUpdateBlockMeta, onDeleteBlock, onMoveBlock, onAddBlock, onDeletePage, onMovePage, sb }: {
  page: Page; pageIdx: number; totalPages: number
  onUpdateBlock: (blockId:string, p:Partial<Block>) => void
  onUpdateBlockMeta: (blockId:string, m:Partial<NonNullable<Block['meta']>>) => void
  onDeleteBlock: (blockId:string) => void
  onMoveBlock: (blockId:string, dir:-1|1) => void
  onAddBlock: (afterBlockId:string, type:BlockType) => void
  onDeletePage: () => void
  onMovePage: (dir:-1|1) => void
  sb: ReturnType<typeof createClient>
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="pg-card">
      {/* Cabecera de página */}
      <div className="pg-header">
        <div className="pg-num">
          <span className="pg-num-dot" />
          Página {pageIdx + 1}
        </div>
        <div className="pg-header-actions">
          {pageIdx > 0           && <button className="pg-act-btn" onClick={() => onMovePage(-1)} title="Subir página">↑ Subir</button>}
          {pageIdx < totalPages-1 && <button className="pg-act-btn" onClick={() => onMovePage(1)}  title="Bajar página">↓ Bajar</button>}
          {totalPages > 1        && <button className="pg-act-btn pg-act-del" onClick={onDeletePage} title="Eliminar página">🗑 Eliminar página</button>}
        </div>
      </div>

      {/* Bloques de la página */}
      <div className="pg-body">
        {page.blocks.map((block, idx) => (
          <SingleBlock
            key={block.id}
            block={block} pageId={page.id}
            idx={idx} total={page.blocks.length}
            onUpdate={p => onUpdateBlock(block.id, p)}
            onUpdateMeta={m => onUpdateBlockMeta(block.id, m)}
            onDelete={() => onDeleteBlock(block.id)}
            onMove={dir => onMoveBlock(block.id, dir)}
            onAddAfter={type => onAddBlock(block.id, type)}
            sb={sb}
          />
        ))}
      </div>
    </div>
  )
}

// ── PreviewBlock ──────────────────────────────────────────────────────────────

function PreviewBlock({ block, index }: { block: Block; index: number }) {
  const { type, content, meta } = block
  const sh = { dangerouslySetInnerHTML: { __html: content } }

  if (type==='divider') return <hr style={{ border:'none', borderTop:'1px solid #ececec', margin:'44px 0' }} />
  if (type==='image') {
    if (!meta?.src) return null
    const al = meta.align || 'full'
    const W = { full:'100%', center:'68%', left:'42%', right:'42%' }[al]
    const isFloat = al === 'left' || al === 'right'

    if (isFloat && meta.sideText) {
      // Float: texto rodea la imagen y continúa debajo
      return (
        <div style={{ overflow:'hidden', margin:'24px 0' }}>
          <figure style={{
            float: al==='left' ? 'left' : 'right',
            width: W,
            margin: al==='left' ? '4px 24px 12px 0' : '4px 0 12px 24px',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <img src={meta.src} alt={meta.alt||''} style={{ width:'100%', display:'block' }} />
            {meta.caption && <figcaption style={{ textAlign:'center', fontSize:13, color:'#8c8c8c', marginTop:6, fontStyle:'italic', padding:'4px 8px' }}>{meta.caption}</figcaption>}
          </figure>
          <div
            dangerouslySetInnerHTML={{ __html: meta.sideText }}
            style={{ fontFamily:'inherit', fontSize:17, lineHeight:1.8, color:'#1a1a1a' }}
          />
          <div style={{ clear:'both' }} />
        </div>
      )
    }

    const figSt: React.CSSProperties = {
      width: W, float: isFloat ? (al==='left' ? 'left' : 'right') : undefined,
      display: al==='center' ? 'block' : undefined,
      margin: al==='center' ? '32px auto' : isFloat ? (al==='left' ? '4px 22px 12px 0' : '4px 0 12px 22px') : '32px 0',
    }
    return (
      <figure style={figSt}>
        <img src={meta.src} alt={meta.alt||''} style={{ width:'100%', borderRadius:12, display:'block' }} />
        {meta.caption && <figcaption style={{ textAlign:'center', fontSize:13, color:'#8c8c8c', marginTop:8, fontStyle:'italic' }}>{meta.caption}</figcaption>}
      </figure>
    )
  }
  if (!content) return null
  if (type==='heading1') return <h2 {...sh} style={{ fontFamily:'inherit', fontSize:30, fontWeight:700, color:'#1a1a1a', lineHeight:1.25, margin:'48px 0 12px', letterSpacing:'-.025em' }} />
  if (type==='heading2') return <h3 {...sh} style={{ fontFamily:'inherit', fontSize:22, fontWeight:700, color:'#1a1a1a', lineHeight:1.3, margin:'36px 0 10px', letterSpacing:'-.015em' }} />
  if (type==='heading3') return <h4 {...sh} style={{ fontFamily:'inherit', fontSize:18, fontWeight:700, color:'#1a1a1a', lineHeight:1.4, margin:'28px 0 8px' }} />
  if (type==='quote') return (
    <blockquote style={{ margin:'32px 0', paddingLeft:20, borderLeft:'3px solid #ff82ae' }}>
      <p {...sh} style={{ fontFamily:'inherit', fontSize:20, fontStyle:'italic', color:'#4d4d4d', lineHeight:1.7, margin:0 }} />
    </blockquote>
  )
  if (type==='callout') return (
    <div style={{ background:'#ffffff', borderRadius:12, padding:'16px 20px', margin:'28px 0', display:'flex', gap:12, alignItems:'flex-start' }}>
      <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{meta?.emoji||'💡'}</span>
      <p {...sh} style={{ fontFamily:'inherit', fontSize:15, color:'#1a1a1a', lineHeight:1.65, margin:0 }} />
    </div>
  )
  if (type==='bullet') return (
    <div style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start', paddingLeft:4 }}>
      <span style={{ color:'#ff82ae', fontSize:20, lineHeight:1.7, flexShrink:0 }}>•</span>
      <p {...sh} style={{ fontFamily:'inherit', fontSize:17, color:'#1a1a1a', lineHeight:1.75, margin:0 }} />
    </div>
  )
  if (type==='numbered') return (
    <div style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start', paddingLeft:4 }}>
      <span style={{ color:'#ff82ae', fontSize:14, fontWeight:700, fontFamily:'inherit', flexShrink:0, marginTop:3, minWidth:22 }}>{index+1}.</span>
      <p {...sh} style={{ fontFamily:'inherit', fontSize:17, color:'#1a1a1a', lineHeight:1.75, margin:0 }} />
    </div>
  )
  if (type==='code') return (
    <pre style={{ background:'#1c1c1a', borderRadius:12, padding:'18px 22px', overflow:'auto', margin:'28px 0' }}>
      <code style={{ fontFamily:"'Fira Mono',Consolas,monospace", fontSize:13, color:'#d4d4d4', lineHeight:1.65 }}>{content}</code>
    </pre>
  )
  return <p {...sh} style={{ fontFamily:'inherit', fontSize:18, color:'#1a1a1a', lineHeight:1.8, margin:'0 0 22px' }} />
}

// ── BlogPostEditor (principal) ────────────────────────────────────────────────

export function BlogPostEditor({ post }: { post?: Post }) {
  const router = useRouter()
  const sb = createClient()

  // Fetch author name from auth user ONLY for new posts (no existing author_name)
  useEffect(() => {
    if (post?.author_name) return // keep existing author from DB
    sb.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || ''
      // Only set if it looks like a real name (not email prefix like "andrew")
      if (name && name.includes(' ')) {
        setAuthorName(name)
      }
      // Otherwise keep the default 'Equipo SANTI'
    })
  }, [])

  const [title, setTitle] = useState(post?.title || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [pages, setPages] = useState<Page[]>(() => safePages(post?.content))
  const [category, setCategory] = useState(post?.category || CATS[0])
  const [color, setColor] = useState<string>(post?.color || 'pink')
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [cover, setCover] = useState(post?.cover_url || '')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverDrag, setCoverDrag] = useState(false)
  const [coverErr, setCoverErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(post?.is_published || false)
  const [authorName, setAuthorName] = useState(post?.author_name || 'Equipo SANTI')
  const [showSettings, setShowSettings] = useState(false)
  const [view, setView] = useState<'editor'|'preview'>('editor')
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const isInitializedRef = useRef(false)

  // Refs para capturar los valores más recientes sin closure stale
  const titleRef = useRef(title)
  const excerptRef = useRef(excerpt)
  const pagesRef = useRef(pages)
  const categoryRef = useRef(category)
  const tagsRef = useRef(tags)
  const coverRef = useRef(cover)

  // Sincronizar refs en cada render
  titleRef.current = title
  excerptRef.current = excerpt
  pagesRef.current = pages
  categoryRef.current = category
  tagsRef.current = tags
  coverRef.current = cover

  // Ref para la función de autosave (evita problema de hoisting)
  const doSaveWithRefsRef = useRef<(() => Promise<void>) | undefined>(undefined)

  useEffect(() => {
    // Saltar el primer render para no guardar datos vacíos
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      return
    }
    if (!post?.id) return
    clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => { doSaveWithRefsRef.current?.() }, 2500)
    return () => clearTimeout(autoSaveRef.current)
  }, [title, excerpt, pages, category, tags, cover])

  // ── Mutaciones de páginas / bloques ──────────────────────────────────────

  const updateBlock = useCallback((pageId:string, blockId:string, patch:Partial<Block>) => {
    setPages(ps => ps.map(p => p.id!==pageId ? p : { ...p, blocks: p.blocks.map(b => b.id!==blockId ? b : { ...b, ...patch }) }))
  }, [])

  const updateBlockMeta = useCallback((pageId:string, blockId:string, meta:Partial<NonNullable<Block['meta']>>) => {
    setPages(ps => ps.map(p => p.id!==pageId ? p : { ...p, blocks: p.blocks.map(b => b.id!==blockId ? b : { ...b, meta:{ ...b.meta, ...meta } }) }))
  }, [])

  const deleteBlock = useCallback((pageId:string, blockId:string) => {
    setPages(ps => ps.map(p => {
      if (p.id!==pageId) return p
      const nb = p.blocks.filter(b => b.id!==blockId)
      return { ...p, blocks: nb.length ? nb : [mkBlock()] }
    }))
  }, [])

  const moveBlock = useCallback((pageId:string, blockId:string, dir:-1|1) => {
    setPages(ps => ps.map(p => {
      if (p.id!==pageId) return p
      const bs = [...p.blocks]
      const i = bs.findIndex(b=>b.id===blockId); const j=i+dir
      if (j<0||j>=bs.length) return p
      ;[bs[i],bs[j]] = [bs[j],bs[i]]
      return { ...p, blocks:bs }
    }))
  }, [])

  const addBlockAfter = useCallback((pageId:string, afterBlockId:string, type:BlockType) => {
    const nb = mkBlock(type)
    setPages(ps => ps.map(p => {
      if (p.id!==pageId) return p
      const bs = [...p.blocks]
      const i = bs.findIndex(b=>b.id===afterBlockId)
      bs.splice(i+1, 0, nb)
      return { ...p, blocks:bs }
    }))
  }, [])

  const addPage = () => setPages(ps => [...ps, mkPage()])

  const deletePage = useCallback((pageId:string) => {
    setPages(ps => { const n=ps.filter(p=>p.id!==pageId); return n.length ? n : [mkPage()] })
  }, [])

  const movePage = useCallback((pageId:string, dir:-1|1) => {
    setPages(ps => {
      const i=ps.findIndex(p=>p.id===pageId); const j=i+dir
      if (j<0||j>=ps.length) return ps
      const n=[...ps]; [n[i],n[j]]=[n[j],n[i]]; return n
    })
  }, [])

  // ── Cover upload ──────────────────────────────────────────────────────────

  const handleCoverFile = async (file:File) => {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setCoverErr('Usa JPG, PNG o WebP'); return }
    if (file.size > 10*1024*1024) { setCoverErr('Máx. 10 MB'); return }
    setCoverErr(''); setCoverUploading(true)
    try { setCover(await uploadImg(file, sb)) }
    catch(e:any) { setCoverErr(e.message||'Error al subir') }
    finally { setCoverUploading(false) }
  }

  // ── Save / publish ────────────────────────────────────────────────────────

  // Versión con refs para autosave (evita closure stale)
  // Se asigna al ref para poder ser llamada desde el useEffect sin hoisting
  doSaveWithRefsRef.current = async () => {
    const t = titleRef.current, ex = excerptRef.current
    const pg = pagesRef.current, cat = categoryRef.current
    const tg = tagsRef.current, cv = coverRef.current
    if (!pg || pg.length === 0) return // no guardar si pages está vacío
    const slug = post?.slug || slugify(t) || `post-${uid()}`
    const data = { title:t, excerpt:ex, content:pg, category:cat, color,
      cover_url:cv, slug, read_time:readTime(pg), updated_at:new Date().toISOString(),
      author_name: authorName,
      author_initials: authorName.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase() }
    if (post?.id) {
      const { error } = await sb.from('blog_posts').update(data).eq('id', post.id)
      if (error) console.error('[autosave error]', error.message, JSON.stringify(error))
    }
  }

  const doSave = async (feedback=true) => {
    if (feedback) setSaving(true)
    try {
      const slug = post?.slug || slugify(title) || `post-${uid()}`
      const data = { title, excerpt, content: pages, category, color,
        cover_url:cover, slug, read_time:readTime(pages), updated_at:new Date().toISOString(),
        author_name: authorName,
        author_initials: authorName.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase() }
      if (post?.id) {
        const { error } = await sb.from('blog_posts').update(data).eq('id', post.id)
        if (error) console.error('[save error]', error.message, error.details)
      } else {
        // Usar insert sin .select() para evitar el 400 por select=*
        const { error } = await sb.from('blog_posts').insert({ ...data, is_published:false })
        if (error) { console.error('[insert error]', error.message, error.details); throw error }
        // Buscar el post recién creado por slug
        const { data:created } = await sb.from('blog_posts').select('id').eq('slug', slug).single()
        if (created) router.replace(`/admin/blog/${created.id}`)
      }
    } catch(e:any) {
      console.error('[doSave exception]', e)
    }
    if (feedback) { setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2200) }
  }

  const doPublish = async () => {
    setPublishing(true)
    const n = !isPublished
    await sb.from('blog_posts').update({ is_published:n, published_at:n?new Date().toISOString():null }).eq('id', post!.id)
    setIsPublished(n); setPublishing(false)
  }

  const addTag = () => { const t=tagInput.trim(); if(t&&!tags.includes(t)) setTags([...tags,t]); setTagInput('') }

  const allBlocks = flattenPages(pages)

  return (
    <>
      <style suppressHydrationWarning>{CSS}</style>
      {/* Restaurar viñetas e indentación dentro del contenteditable.
          Tailwind `@tailwind base` resetea ul/ol — sin esto las listas
          insertadas quedan invisibles aunque la estructura sí cambia. */}
      <style suppressHydrationWarning>{`
        [contenteditable] ul {
          list-style: disc !important;
          padding-left: 1.6rem !important;
          margin: .5rem 0 !important;
        }
        [contenteditable] ol {
          list-style: decimal !important;
          padding-left: 1.6rem !important;
          margin: .5rem 0 !important;
        }
        [contenteditable] li {
          margin-bottom: .25rem;
          display: list-item;
        }
        [contenteditable] a {
          color: #ff82ae;
          text-decoration: underline;
        }
      `}</style>
      <div className="v6-layout">

        {/* ── TOPBAR ── */}
        <header className="v6-top">
          <a href="/admin/blog" className="v6-back">← Blog</a>
          <div className="v6-topsep" />
          <span className="v6-toptitle">{title||'Sin título'}</span>
          <div className="v6-topright">
            {saving && <span className="v6-saving">⟳ Guardando...</span>}
            {saved && !saving && <span className="v6-saved">✓ Guardado</span>}
            <span className={`v6-badge ${isPublished?'v6-pub':'v6-draft'}`}>{isPublished?'● Publicado':'○ Borrador'}</span>
            <button className="v6-btn" onClick={()=>setView(v=>v==='editor'?'preview':'editor')}>
              {view==='editor'?'👁 Vista previa':'✏️ Editor'}
            </button>
            <button className={`v6-btn ${showSettings?'v6-btn-on':''}`} onClick={()=>setShowSettings(s=>!s)}>⚙ Ajustes</button>
            <button className="v6-btn" onClick={()=>doSave(true)} disabled={saving}>💾 Guardar</button>
            {post?.id && (
              <button className={`v6-btn ${isPublished?'v6-unpub':'v6-pubBtn'}`} onClick={doPublish} disabled={publishing}>
                {publishing?'...' : isPublished?'⊘ Despublicar':'🌐 Publicar'}
              </button>
            )}
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="v6-body">

          {/* ── EDITOR ── */}
          {view==='editor' && (
            <main className="v6-canvas">
              <div className="v6-paper">

                {/* Portada */}
                <div
                  className={`v6-cover ${cover?'v6-cover-filled':''} ${coverDrag?'v6-cover-drag':''}`}
                  onClick={() => !cover && coverFileRef.current?.click()}
                  onDragOver={e=>{e.preventDefault();setCoverDrag(true)}}
                  onDragLeave={()=>setCoverDrag(false)}
                  onDrop={e=>{e.preventDefault();setCoverDrag(false);const f=e.dataTransfer.files[0];if(f)handleCoverFile(f)}}
                >
                  {cover ? (
                    <>
                      <img src={cover} alt="Portada" className="v6-cover-img" />
                      <div className="v6-cover-ov">
                        <button className="v6-cover-btn" onClick={e=>{e.stopPropagation();coverFileRef.current?.click()}}>🔄 Cambiar</button>
                        <button className="v6-cover-btn v6-cover-del" onClick={e=>{e.stopPropagation();setCover('')}}>✕ Quitar</button>
                      </div>
                    </>
                  ) : (
                    <div className="v6-cover-empty">
                      {coverUploading ? <><div className="v6-cover-spin">⟳</div><span>Subiendo...</span></>
                      : (<>
                        <div className="v6-cover-ico">🖼</div>
                        <strong>Portada del artículo</strong>
                        <span>Arrastra o haz clic · JPG PNG WebP</span>
                        <div className="v6-cover-url-row" onClick={e=>e.stopPropagation()}>
                          <input className="v6-url-inp" placeholder="...o pega una URL"
                            onChange={e=>e.target.value&&setCover(e.target.value)}
                            onKeyDown={e=>{if(e.key==='Enter'){const v=(e.target as HTMLInputElement).value;if(v)setCover(v)}}}
                          />
                        </div>
                        {coverErr && <span style={{color:'#e53e3e',fontSize:12}}>{coverErr}</span>}
                      </>)}
                    </div>
                  )}
                </div>
                <input ref={coverFileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}}
                  onChange={e=>{const f=e.target.files?.[0];if(f)handleCoverFile(f);e.target.value=''}} />

                {/* Título / extracto */}
                <input className="v6-title" placeholder="Título del artículo..."
                  value={title} onChange={e=>setTitle(e.target.value)} />
                <input className="v6-excerpt" placeholder="Extracto o subtítulo (aparece en la lista del blog)..."
                  value={excerpt} onChange={e=>setExcerpt(e.target.value)} />
                <div className="v6-hr" />

                {/* PÁGINAS */}
                {pages.map((page, pi) => (
                  <PageCard
                    key={page.id}
                    page={page} pageIdx={pi} totalPages={pages.length}
                    onUpdateBlock={(bid,p) => updateBlock(page.id, bid, p)}
                    onUpdateBlockMeta={(bid,m) => updateBlockMeta(page.id, bid, m)}
                    onDeleteBlock={bid => deleteBlock(page.id, bid)}
                    onMoveBlock={(bid,d) => moveBlock(page.id, bid, d)}
                    onAddBlock={(afterId,type) => addBlockAfter(page.id, afterId, type)}
                    onDeletePage={() => deletePage(page.id)}
                    onMovePage={d => movePage(page.id, d)}
                    sb={sb}
                  />
                ))}

                {/* Agregar nueva página */}
                <button type="button" className="v6-add-page" onClick={addPage}>
                  <span className="v6-add-page-icon">+</span>
                  Agregar página {pages.length + 1}
                </button>

              </div>
            </main>
          )}

          {/* ── VISTA PREVIA · fiel al blog público ── */}
          {view==='preview' && (
            <main className="v6-preview" style={{ ['--pt' as string]: (PREV_THEME[color]||PREV_THEME.pink).main, ['--pt-soft' as string]: (PREV_THEME[color]||PREV_THEME.pink).soft, ['--pt-tint' as string]: (PREV_THEME[color]||PREV_THEME.pink).tint, ['--pt-deep' as string]: (PREV_THEME[color]||PREV_THEME.pink).deep, background: (PREV_THEME[color]||PREV_THEME.pink).tint }}>
              <div className="v6-prev-paper">
                {/* Hero con portada + título sobrepuesto */}
                {cover ? (
                  <div className="v6-prev-hero">
                    <img src={cover} alt="Portada" />
                    <div className="v6-prev-hero-ov" />
                    <div className="v6-prev-hero-tx">
                      {category && <span className="v6-prev-hcat">{category}</span>}
                      <h1 className="v6-prev-htitle">{title||<span style={{opacity:.55}}>Sin título</span>}</h1>
                      {excerpt && <p className="v6-prev-hex">{excerpt}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="v6-prev-nocover">
                    {category && <span className="v6-prev-cat">{category}</span>}
                    <h1 className="v6-prev-title">{title||<span style={{opacity:.25}}>Sin título</span>}</h1>
                    {excerpt && <p className="v6-prev-ex">{excerpt}</p>}
                  </div>
                )}

                {/* Tarjeta del artículo */}
                <div className="v6-prev-card">
                <div className="v6-prev-meta">
                  <div className="v6-prev-av">{(authorName.split(' ').map(w=>w[0]).join('')||'ES').slice(0,2).toUpperCase()}</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:'#1a1a1a'}}>{authorName}</div>
                    <div style={{fontSize:13,color:'#8c8c8c'}}>{isPublished?'Publicado':'Borrador'} · {readTime(pages)} min de lectura</div>
                  </div>
                  {tags.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:5,marginLeft:'auto'}}>
                    {tags.map(t=><span key={t} className="v6-prev-tag">{t}</span>)}
                  </div>}
                </div>
                {/* Contenido — renderiza las páginas separadas por un divisor visual */}
                {pages.map((page, pi) => (
                  <div key={page.id}>
                    {pi > 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:16, margin:'48px 0 40px' }}>
                        <div style={{ flex:1, height:1, background:'#ececec' }} />
                        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#ccc', fontFamily:'inherit' }}>Página {pi+1}</span>
                        <div style={{ flex:1, height:1, background:'#ececec' }} />
                      </div>
                    )}
                    <div style={{ overflow:'hidden' }}>
                      {page.blocks.map((b,i) => <PreviewBlock key={b.id} block={b} index={i} />)}
                      <div style={{clear:'both'}} />
                    </div>
                  </div>
                ))}
                </div>{/* /v6-prev-card */}
              </div>
            </main>
          )}

          {/* ── AJUSTES ── */}
          {showSettings && (
            <aside className="v6-settings">
              <div className="v6-set-hdr">
                <span>⚙ Ajustes</span>
                <button onClick={()=>setShowSettings(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#aaa',lineHeight:1}}>×</button>
              </div>

              <div className="v6-sec">
                <label className="v6-lbl">Categoría</label>
                <select className="v6-sel" value={category} onChange={e=>setCategory(e.target.value)}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="v6-sec">
                <label className="v6-lbl">Color del tema</label>
                <div style={{display:'flex',gap:8}}>
                  {([['pink','#ff82ae'],['orange','#ffa600'],['sky','#3dc5ff'],['green','#a4c21f']] as const).map(([key,hex])=>(
                    <button key={key} type="button" onClick={()=>setColor(key)} title={key}
                      style={{width:30,height:30,borderRadius:'50%',background:hex,cursor:'pointer',
                        border: color===key ? '3px solid #1a1a1a' : '2px solid #ececec'}} />
                  ))}
                </div>
              </div>

              <div className="v6-sec">
                <label className="v6-lbl">Etiquetas</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>
                  {tags.map(t=>(<span key={t} className="v6-chip">{t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} style={{background:'none',border:'none',cursor:'pointer',color:'#ff82ae',fontSize:14,lineHeight:1,padding:'0 0 0 4px'}}>×</button></span>))}
                </div>
                <div style={{display:'flex',gap:6}}>
                  <input className="v6-inp" placeholder="Nueva etiqueta..." value={tagInput}
                    onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addTag()}} style={{flex:1}} />
                  <button className="v6-btn" onClick={addTag}>+</button>
                </div>
              </div>

              <div className="v6-sec">
                <label className="v6-lbl">Portada (URL)</label>
                <input className="v6-inp" placeholder="https://..." value={cover} onChange={e=>setCover(e.target.value)} />
                {cover && <img src={cover} alt="" style={{width:'100%',borderRadius:8,marginTop:8,height:100,objectFit:'cover'}} />}
                <button className="v6-btn" style={{width:'100%',marginTop:8,justifyContent:'center'}} onClick={()=>coverFileRef.current?.click()}>
                  📁 Subir imagen de portada
                </button>
              </div>

              <div className="v6-sec">
                <label className="v6-lbl">Estadísticas</label>
                <div className="v6-stats">
                  <div className="v6-stat"><span className="v6-sn">{pages.length}</span><span className="v6-sl">páginas</span></div>
                  <div className="v6-stat"><span className="v6-sn">{allBlocks.length}</span><span className="v6-sl">bloques</span></div>
                  <div className="v6-stat"><span className="v6-sn">{wordCount(pages)}</span><span className="v6-sl">palabras</span></div>
                  <div className="v6-stat"><span className="v6-sn">{readTime(pages)}</span><span className="v6-sl">min lect.</span></div>
                </div>
              </div>

              {post?.id && (
                <div className="v6-sec">
                  <label className="v6-lbl">Acciones</label>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {isPublished && (
                      <a href={`/blog/${post.slug}`} target="_blank" className="v6-btn" style={{justifyContent:'center',textDecoration:'none',display:'flex'}}>
                        👁 Ver en el blog
                      </a>
                    )}
                    <button className="v6-btn v6-btn-del" onClick={async()=>{
                      if(!confirm('¿Eliminar este artículo? Esta acción es irreversible.')) return
                      await sb.from('blog_posts').delete().eq('id', post.id)
                      router.push('/admin/blog')
                    }}>🗑 Eliminar artículo</button>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
:root{--brand:#ff82ae;--brand-l:#ffd9e6;--brand-d:#d9568f;--ink:#1a1a1a;--ink2:#4d4d4d;--muted:#8c8c8c;--border:#ececec;--s1:#ffffff;--s2:#ffffff;--s3:#ffffff;}
*,*::before,*::after{box-sizing:border-box;}

.v6-layout{display:flex;flex-direction:column;height:100vh;background:var(--s2);font-family:inherit;}

/* Topbar */
.v6-top{position:fixed;top:0;left:0;right:0;z-index:100;height:52px;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:0 20px;box-shadow:0 1px 10px rgba(0,0,0,.06);}
.v6-back{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--muted);text-decoration:none;padding:5px 10px;border-radius:8px;transition:all .15s;}
.v6-back:hover{background:var(--s2);color:var(--ink);}
.v6-topsep{width:1px;height:20px;background:var(--border);flex-shrink:0;}
.v6-toptitle{flex:1;font-size:13px;font-weight:700;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.v6-topright{display:flex;align-items:center;gap:7px;flex-shrink:0;}
.v6-saving{font-size:12px;color:var(--muted);}
.v6-saved{font-size:12px;color:#16a34a;font-weight:700;}
.v6-badge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;}
.v6-pub{background:#dcf5e7;color:#1a6636;}
.v6-draft{background:#ffffff;color:var(--muted);}
.v6-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;white-space:nowrap;border:1.5px solid var(--border);background:var(--s1);color:var(--ink2);transition:all .15s;text-decoration:none;}
.v6-btn:hover:not(:disabled){border-color:var(--ink2);background:var(--s2);}
.v6-btn:disabled{opacity:.6;cursor:not-allowed;}
.v6-btn-on{background:var(--s2)!important;border-color:var(--ink2)!important;}
.v6-pubBtn{background:var(--brand)!important;border-color:var(--brand)!important;color:#fff!important;}
.v6-pubBtn:hover:not(:disabled){background:var(--brand-d)!important;}
.v6-unpub{color:var(--muted)!important;}
.v6-unpub:hover:not(:disabled){border-color:#dc2626!important;color:#dc2626!important;}
.v6-btn-del{color:#dc2626!important;border-color:#fecaca!important;}
.v6-btn-del:hover:not(:disabled){background:#fef2f2!important;}

/* Body */
.v6-body{display:flex;flex:1;margin-top:52px;overflow:hidden;}

/* Canvas */
.v6-canvas{flex:1;overflow-y:auto;padding:40px 24px 120px;display:flex;justify-content:center;background:var(--s2);}
.v6-paper{width:100%;max-width:780px;}

/* Portada */
.v6-cover{width:100%;min-height:220px;border-radius:16px;border:2.5px dashed var(--border);cursor:pointer;margin-bottom:36px;position:relative;transition:all .2s;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
.v6-cover:not(.v6-cover-filled):hover,.v6-cover-drag{border-color:var(--brand)!important;background:#ffffff!important;}
.v6-cover-filled{border:none;min-height:260px;}
.v6-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.v6-cover-ov{position:absolute;inset:0;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;gap:10px;opacity:0;transition:opacity .2s;}
.v6-cover:hover .v6-cover-ov{opacity:1;}
.v6-cover-btn{background:rgba(255,255,255,.92);color:#333;border:none;padding:8px 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;}
.v6-cover-del{background:rgba(200,40,40,.85)!important;color:#fff!important;}
.v6-cover-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;text-align:center;color:var(--muted);}
.v6-cover-ico{font-size:40px;opacity:.5;line-height:1;}
.v6-cover-spin{font-size:28px;animation:v6spin 1s linear infinite;}
.v6-cover-empty strong{font-size:15px;color:var(--ink2);}
.v6-cover-empty span{font-size:12px;}
.v6-cover-url-row{margin-top:8px;width:100%;max-width:320px;}
.v6-url-inp{width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;outline:none;text-align:center;}
.v6-url-inp:focus{border-color:var(--brand);}

/* Título */
.v6-title{width:100%;border:none;outline:none;background:transparent;font-family:inherit;font-size:46px;font-weight:700;line-height:1.12;color:var(--ink);letter-spacing:-.03em;margin-bottom:12px;}
.v6-title::placeholder{color:#ddd;}
.v6-excerpt{width:100%;border:none;outline:none;background:transparent;font-family:inherit;font-size:19px;line-height:1.6;color:var(--muted);margin-bottom:28px;font-style:italic;}
.v6-excerpt::placeholder{color:#ececec;}
.v6-hr{border:none;border-top:1.5px solid var(--border);margin-bottom:24px;}

/* PageCard */
.pg-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;margin-bottom:24px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05);}
.pg-header{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:linear-gradient(135deg,#fff2f6,#ffffff);border-bottom:1px solid #ececec;}
.pg-num{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#666;font-family:inherit;}
.pg-num-dot{width:8px;height:8px;border-radius:50%;background:var(--brand);flex-shrink:0;}
.pg-header-actions{display:flex;align-items:center;gap:6px;}
.pg-act-btn{padding:4px 10px;border:1px solid var(--border);border-radius:7px;background:#fff;color:#666;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
.pg-act-btn:hover{border-color:#888;color:#333;}
.pg-act-del{color:#dc2626!important;border-color:#fecaca!important;}
.pg-act-del:hover{background:#fef2f2!important;}
.pg-body{padding:16px;}

/* Botón agregar página */
.v6-add-page{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:18px;border:2.5px dashed rgba(0,0,0,.1);border-radius:16px;background:transparent;cursor:pointer;color:#bbb;font-size:14px;font-weight:800;font-family:inherit;transition:all .18s;margin-top:8px;}
.v6-add-page:hover{border-color:var(--brand);color:var(--brand);background:var(--brand-l);}
.v6-add-page-icon{width:28px;height:28px;border-radius:50%;border:2.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;}

/* Vista previa (fiel al blog público) */
.v6-preview{flex:1;overflow-y:auto;padding:34px 24px 90px;display:flex;justify-content:center;}
.v6-prev-paper{width:100%;max-width:760px;}
/* Hero con portada + título sobrepuesto */
.v6-prev-hero{position:relative;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px -26px rgba(0,0,0,.4);margin-bottom:0;}
.v6-prev-hero img{display:block;width:100%;height:360px;object-fit:cover;}
.v6-prev-hero-ov{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,0,0,.02),rgba(0,0,0,.12) 40%,rgba(0,0,0,.78));}
.v6-prev-hero-tx{position:absolute;left:0;right:0;bottom:0;padding:34px 40px 36px;color:#fff;}
.v6-prev-hcat{display:inline-block;padding:6px 15px;border-radius:100px;background:var(--pt);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;}
.v6-prev-htitle{font-family:inherit;font-size:40px;font-weight:800;line-height:1.08;letter-spacing:-.02em;margin:0;text-shadow:0 2px 20px rgba(0,0,0,.35);}
.v6-prev-hex{margin:14px 0 0;font-size:17px;line-height:1.5;color:rgba(255,255,255,.92);font-style:italic;max-width:600px;}
/* Header sin portada */
.v6-prev-nocover{background:#fff;border:1px solid var(--border);border-top:6px solid var(--pt);border-radius:24px;padding:40px 44px;box-shadow:0 16px 40px -26px rgba(0,0,0,.2);}
.v6-prev-cat{display:inline-flex;padding:6px 15px;border-radius:100px;background:var(--pt-soft);color:var(--pt-deep);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;}
.v6-prev-title{font-family:inherit;font-size:38px;font-weight:800;line-height:1.1;letter-spacing:-.02em;color:var(--ink);margin:0 0 12px;}
.v6-prev-ex{font-family:inherit;font-size:18px;font-style:italic;color:var(--muted);line-height:1.6;margin:0;}
/* Tarjeta del artículo */
.v6-prev-card{background:#fff;border:1px solid var(--border);border-radius:22px;padding:34px 40px 42px;margin-top:26px;box-shadow:0 16px 40px -28px rgba(0,0,0,.18);overflow-wrap:anywhere;word-break:break-word;}
.v6-prev-meta{display:flex;align-items:center;gap:14px;font-size:13px;color:var(--muted);margin-bottom:28px;padding-bottom:24px;border-bottom:1.5px solid var(--border);}
.v6-prev-av{width:48px;height:48px;border-radius:50%;background:var(--pt);color:#fff;display:grid;place-items:center;font-size:15px;font-weight:800;flex-shrink:0;}
.v6-prev-tag{padding:4px 12px;background:var(--pt-soft);color:var(--pt-deep);border-radius:100px;font-size:11px;font-weight:800;}

/* Ajustes */
.v6-settings{width:298px;background:var(--s1);border-left:1px solid var(--border);overflow-y:auto;padding:20px 18px;flex-shrink:0;}
.v6-set-hdr{display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:800;color:var(--ink);margin-bottom:22px;}
.v6-sec{margin-bottom:22px;}
.v6-lbl{display:block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
.v6-inp{width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;background:var(--s2);color:var(--ink);outline:none;transition:border-color .15s;}
.v6-inp:focus{border-color:var(--brand);}
.v6-sel{width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;background:var(--s2);color:var(--ink);outline:none;cursor:pointer;}
.v6-chip{display:inline-flex;align-items:center;padding:3px 10px;background:var(--brand-l);color:var(--brand);border-radius:20px;font-size:12px;font-weight:700;}
.v6-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.v6-stat{background:var(--s2);border-radius:10px;padding:12px 8px;text-align:center;}
.v6-sn{display:block;font-size:22px;font-weight:800;color:var(--ink);}
.v6-sl{display:block;font-size:10px;color:var(--muted);margin-top:2px;font-weight:700;letter-spacing:.04em;}

@keyframes v6spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes menuPop{from{opacity:0;transform:scale(.95) translateY(-4px);}to{opacity:1;transform:scale(1) translateY(0);}}
`
