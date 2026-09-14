"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  type Block,
  type BlockType,
  BLOCK_CATALOG,
  emptyBlock,
} from "@/lib/blocks";

type UploadFn = (file: File) => Promise<string | null>;

const textPlaceholder: Partial<Record<BlockType, string>> = {
  paragraph: "Escribe un párrafo…",
  heading2: "Título de sección",
  heading3: "Subtítulo",
  quote: "Una cita o frase destacada…",
  callout: "Nota o aviso para el lector…",
};

/** Área de texto enriquecido (contentEditable) con barra de formato. */
function RichText({
  block,
  onChange,
  className,
}: {
  block: Block;
  onChange: (html: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    if (ref.current && ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content || "";
    }
    // solo al montar / cambiar de bloque
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  const cmd = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="relative">
      {focused && (
        <div className="absolute -top-10 left-0 z-10 flex items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-card">
          <ToolBtn onMouseDown={() => cmd("bold")} label="Negrita">
            <b>B</b>
          </ToolBtn>
          <ToolBtn onMouseDown={() => cmd("italic")} label="Cursiva">
            <i>i</i>
          </ToolBtn>
          <ToolBtn onMouseDown={() => cmd("insertUnorderedList")} label="Lista">
            •
          </ToolBtn>
          <ToolBtn
            onMouseDown={() => {
              const url = prompt("URL del enlace:");
              if (url) cmd("createLink", url);
            }}
            label="Enlace"
          >
            🔗
          </ToolBtn>
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-empty={!block.content}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        className={`block-prose min-h-[1.6em] rounded-lg outline-none focus:ring-2 focus:ring-sky/40 ${className ?? ""}`}
        style={{ lineHeight: 1.7 }}
      />
      {!block.content && (
        <div className="pointer-events-none absolute inset-0 text-ink-muted" style={{ lineHeight: 1.7 }}>
          {textPlaceholder[block.type]}
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  onMouseDown,
  label,
}: {
  children: React.ReactNode;
  onMouseDown: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-ink hover:bg-line"
    >
      {children}
    </button>
  );
}

const smallInput =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-pink focus-visible:outline-none";

export function BlockEditor({
  value,
  onChange,
  upload,
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
  upload: UploadFn;
}) {
  const [menuAt, setMenuAt] = useState<number | null>(null);

  const update = (id: string, patch: Partial<Block>) =>
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const updateMeta = (id: string, meta: Partial<NonNullable<Block["meta"]>>) =>
    onChange(value.map((b) => (b.id === id ? { ...b, meta: { ...b.meta, ...meta } } : b)));
  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const insert = (at: number, type: BlockType) => {
    const next = [...value];
    next.splice(at, 0, emptyBlock(type));
    onChange(next);
    setMenuAt(null);
  };

  return (
    <div className="space-y-3">
      {value.map((block, i) => (
        <div key={block.id} className="group relative rounded-xl border border-line bg-white p-4">
          {/* Controles */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              {BLOCK_CATALOG.find((c) => c.type === block.type)?.label ?? block.type}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded-md px-2 py-1 text-ink-muted hover:bg-line" title="Subir">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="rounded-md px-2 py-1 text-ink-muted hover:bg-line" title="Bajar">↓</button>
              <button type="button" onClick={() => remove(block.id)} className="rounded-md px-2 py-1 text-pink hover:bg-pink-tint" title="Eliminar">🗑</button>
            </div>
          </div>

          {/* Contenido según tipo */}
          {block.type === "divider" ? (
            <div className="rainbow-bar h-1 w-24 rounded-full" />
          ) : block.type === "image" ? (
            <div className="space-y-2">
              {block.meta?.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.meta.src} alt="" className="max-h-56 w-full rounded-lg object-cover" />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink">
                  Subir imagen
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) { const url = await upload(f); if (url) updateMeta(block.id, { src: url }); }
                  }} />
                </label>
                <input className={smallInput} style={{ flex: 1, minWidth: 160 }} placeholder="…o pega una URL de imagen" value={block.meta?.src ?? ""} onChange={(e) => updateMeta(block.id, { src: e.target.value })} />
              </div>
              <input className={smallInput} placeholder="Texto alternativo / descripción (opcional)" value={block.meta?.alt ?? ""} onChange={(e) => updateMeta(block.id, { alt: e.target.value })} />
              <input className={smallInput} placeholder="Pie de foto (opcional)" value={block.meta?.caption ?? ""} onChange={(e) => updateMeta(block.id, { caption: e.target.value })} />
            </div>
          ) : block.type === "video" ? (
            <div className="space-y-2">
              <input className={smallInput} placeholder="Link de YouTube o Vimeo" value={block.meta?.url ?? ""} onChange={(e) => {
                const url = e.target.value;
                updateMeta(block.id, { url, provider: url.includes("vimeo") ? "vimeo" : "youtube" });
              }} />
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink">
                  …o subir video
                  <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) { const url = await upload(f); if (url) updateMeta(block.id, { src: url }); }
                  }} />
                </label>
                {block.meta?.src && <span className="text-xs text-ink-muted">Video subido ✓</span>}
              </div>
            </div>
          ) : (
            <RichText
              block={block}
              onChange={(html) => update(block.id, { content: html })}
              className={
                block.type === "heading2"
                  ? "text-2xl font-extrabold text-ink"
                  : block.type === "heading3"
                  ? "text-xl font-bold text-ink"
                  : block.type === "quote"
                  ? "border-l-4 border-pink pl-4 text-lg italic text-ink-soft"
                  : block.type === "callout"
                  ? "rounded-xl bg-sky-tint p-4 text-ink"
                  : "text-ink-soft"
              }
            />
          )}

          {/* Botón para insertar bloque debajo */}
          <div className="mt-3 flex justify-center">
            <button type="button" onClick={() => setMenuAt(menuAt === i + 1 ? null : i + 1)} className="rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-muted hover:bg-line">
              + agregar bloque
            </button>
          </div>
          {menuAt === i + 1 && <AddMenu onPick={(t) => insert(i + 1, t)} />}
        </div>
      ))}

      {value.length === 0 && (
        <div>
          <button type="button" onClick={() => setMenuAt(0)} className="w-full rounded-xl border-2 border-dashed border-line py-6 text-sm font-bold text-ink-muted hover:bg-line">
            + Agregar el primer bloque
          </button>
          {menuAt === 0 && <AddMenu onPick={(t) => insert(0, t)} />}
        </div>
      )}
    </div>
  );
}

function AddMenu({ onPick }: { onPick: (t: BlockType) => void }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-2 shadow-card sm:grid-cols-4">
      {BLOCK_CATALOG.map((c) => (
        <button
          key={c.type}
          type="button"
          onClick={() => onPick(c.type)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-sky-tint"
        >
          <span className="w-6 text-center">{c.icon}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
