import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Trash2,
  GripVertical,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  StickyNote,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  Type as TypeIcon,
  CheckSquare,
  Lightbulb,
  Hash,
  Layers,
  ChevronUp,
  ChevronDown,
  Hand,
  Diamond,
} from 'lucide-react';
import {
  Block,
  BlockType,
  CanvasBlockLayout,
  Page,
  StickyColor,
  ShapeColor,
  ShapeKind,
} from '../../types';
import { createBlock, SlashItemKind } from './blocks';

interface CanvasProps {
  page: Page;
  pages: Page[];
  onUpdatePage: (page: Page) => void;
  onSelectPage: (id: string) => void;
  onCreatePage: (opts?: { parentId?: string; title?: string }) => string;
  /** Renders a Notion-style block (text/heading/todo/callout/etc) for inline editing inside a canvas card. */
  renderBlock: (
    block: Block,
    onUpdate: (updates: Partial<Block>) => void,
    onSelectPage: (id: string) => void,
  ) => React.ReactNode;
}

const CANVAS_SIZE = 8000;
const DEFAULT_BLOCK_W = 280;
const DEFAULT_BLOCK_H = 120;
const STICKY_SIZE = 180;
const SHAPE_SIZE = 160;
const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const SNAP_GRID = 8;

type ToolMode = 'select' | 'pan' | 'sticky' | 'rect' | 'rounded' | 'circle' | 'diamond' | 'arrow' | 'text' | 'note' | 'todo' | 'callout';

interface ToolDef {
  id: ToolMode;
  Icon: typeof MousePointer2;
  label: string;
  shortcut?: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select', Icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'pan', Icon: Hand, label: 'Pan', shortcut: 'H' },
  { id: 'sticky', Icon: StickyNote, label: 'Sticky note', shortcut: 'S' },
  { id: 'rect', Icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'rounded', Icon: Square, label: 'Rounded' },
  { id: 'circle', Icon: CircleIcon, label: 'Circle', shortcut: 'O' },
  { id: 'diamond', Icon: Diamond, label: 'Diamond' },
  { id: 'arrow', Icon: ArrowRight, label: 'Connector', shortcut: 'A' },
  { id: 'text', Icon: TypeIcon, label: 'Text', shortcut: 'T' },
  { id: 'todo', Icon: CheckSquare, label: 'To-do' },
  { id: 'callout', Icon: Lightbulb, label: 'Callout' },
  { id: 'note', Icon: Hash, label: 'Heading' },
];

const SHAPE_COLOR_HEX: Record<ShapeColor, { bg: string; border: string; text: string }> = {
  white: { bg: '#ffffff', border: '#cbd5e1', text: '#0f172a' },
  gray: { bg: '#f3f4f6', border: '#9ca3af', text: '#1f2937' },
  blue: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  green: { bg: '#dcfce7', border: '#10b981', text: '#064e3b' },
  yellow: { bg: '#fef9c3', border: '#f59e0b', text: '#78350f' },
  red: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
  purple: { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
};

const STICKY_COLOR_HEX: Record<StickyColor, string> = {
  yellow: '#fde68a',
  pink: '#fbcfe8',
  blue: '#bfdbfe',
  green: '#bbf7d0',
  orange: '#fed7aa',
  purple: '#e9d5ff',
  gray: '#e5e7eb',
};

export function Canvas({ page, onUpdatePage, onSelectPage, renderBlock }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(page.canvasViewport ?? { x: 200, y: 200, scale: 1 });

  const [tool, setTool] = useState<ToolMode>('select');
  const [stickyColor, setStickyColor] = useState<StickyColor>('yellow');
  const [shapeColor, setShapeColor] = useState<ShapeColor>('white');
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [panning, setPanning] = useState<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [drag, setDrag] = useState<{
    blockId: string;
    startCanvas: { x: number; y: number };
    startLayouts: Map<string, CanvasBlockLayout>;
  } | null>(null);
  const [resize, setResize] = useState<{ id: string; startX: number; startY: number; baseW: number; baseH: number } | null>(null);
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [arrowDraft, setArrowDraft] = useState<{ fromBlockId: string; pointer: { x: number; y: number } } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const layout = page.canvasLayout ?? {};

  /* --------- persistence (lightly debounced viewport save) --------- */
  const viewportPersistRef = useRef<number | null>(null);
  useEffect(() => {
    if (viewportPersistRef.current) window.clearTimeout(viewportPersistRef.current);
    viewportPersistRef.current = window.setTimeout(() => {
      onUpdatePage({ ...page, canvasViewport: viewport, updatedAt: new Date() });
    }, 600);
    return () => {
      if (viewportPersistRef.current) window.clearTimeout(viewportPersistRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.x, viewport.y, viewport.scale]);

  /* --------- layout helpers --------- */
  const getLayout = useCallback(
    (blockId: string, index: number): CanvasBlockLayout => {
      if (layout[blockId]) return layout[blockId];
      const cols = 3;
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        x: 60 + col * (DEFAULT_BLOCK_W + 40),
        y: 60 + row * (DEFAULT_BLOCK_H + 40),
        w: DEFAULT_BLOCK_W,
        h: DEFAULT_BLOCK_H,
        z: index,
      };
    },
    [layout],
  );

  /* --------- mutations --------- */
  const updateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      const blocks = page.blocks.map((b) =>
        b.id === blockId ? ({ ...b, ...updates, updatedAt: new Date() } as Block) : b,
      );
      onUpdatePage({ ...page, blocks, updatedAt: new Date() });
    },
    [page, onUpdatePage],
  );

  const writeLayouts = useCallback(
    (patches: Record<string, Partial<CanvasBlockLayout>>) => {
      const next = { ...layout };
      for (const [id, patch] of Object.entries(patches)) {
        next[id] = { ...(next[id] ?? { x: 0, y: 0 }), ...patch };
      }
      onUpdatePage({ ...page, canvasLayout: next, updatedAt: new Date() });
    },
    [layout, page, onUpdatePage],
  );

  const deleteBlocks = useCallback(
    (ids: Set<string>) => {
      const blocks = page.blocks.filter((b) => !ids.has(b.id));
      const nextLayout: Record<string, CanvasBlockLayout> = {};
      for (const [id, l] of Object.entries(layout)) {
        if (!ids.has(id)) nextLayout[id] = l;
      }
      // Also cleanse arrows that point to deleted blocks.
      const cleanedBlocks = blocks.map((b) => {
        if (b.type === 'arrow') {
          const next: any = { ...b };
          if (next.fromBlockId && ids.has(next.fromBlockId)) next.fromBlockId = undefined;
          if (next.toBlockId && ids.has(next.toBlockId)) next.toBlockId = undefined;
          return next;
        }
        return b;
      });
      onUpdatePage({ ...page, blocks: cleanedBlocks, canvasLayout: nextLayout, updatedAt: new Date() });
      setSelectedIds(new Set());
    },
    [page, layout, onUpdatePage],
  );

  const duplicateSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const newBlocks: Block[] = [];
    const newLayouts: Record<string, CanvasBlockLayout> = { ...layout };
    const newSelected = new Set<string>();
    for (const id of selectedIds) {
      const original = page.blocks.find((b) => b.id === id);
      if (!original) continue;
      const newId = crypto.randomUUID();
      const copy = { ...original, id: newId, createdAt: new Date(), updatedAt: new Date() } as Block;
      newBlocks.push(copy);
      const origLayout = layout[id] ?? getLayout(id, page.blocks.indexOf(original));
      newLayouts[newId] = { ...origLayout, x: origLayout.x + 24, y: origLayout.y + 24 };
      newSelected.add(newId);
    }
    onUpdatePage({
      ...page,
      blocks: [...page.blocks, ...newBlocks],
      canvasLayout: newLayouts,
      updatedAt: new Date(),
    });
    setSelectedIds(newSelected);
  }, [selectedIds, page, layout, onUpdatePage, getLayout]);

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (selectedIds.size === 0) return;
      const patches: Record<string, Partial<CanvasBlockLayout>> = {};
      for (const id of selectedIds) {
        const l = layout[id] ?? getLayout(id, page.blocks.findIndex((b) => b.id === id));
        patches[id] = { x: l.x + dx, y: l.y + dy };
      }
      writeLayouts(patches);
    },
    [selectedIds, layout, page.blocks, writeLayouts, getLayout],
  );

  const maxZ = useMemo(() => {
    let m = 0;
    for (const l of Object.values(layout)) if (l.z !== undefined && l.z > m) m = l.z;
    return m;
  }, [layout]);

  const bringToFront = useCallback(() => {
    const patches: Record<string, Partial<CanvasBlockLayout>> = {};
    let z = maxZ + 1;
    for (const id of selectedIds) {
      patches[id] = { z: z++ };
    }
    writeLayouts(patches);
  }, [selectedIds, maxZ, writeLayouts]);

  const sendToBack = useCallback(() => {
    const patches: Record<string, Partial<CanvasBlockLayout>> = {};
    let z = -1;
    for (const id of selectedIds) {
      patches[id] = { z: z-- };
    }
    writeLayouts(patches);
  }, [selectedIds, writeLayouts]);

  /* --------- coordinate conversion --------- */
  const clientToCanvas = useCallback(
    (cx: number, cy: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (cx - rect.left - viewport.x) / viewport.scale,
        y: (cy - rect.top - viewport.y) / viewport.scale,
      };
    },
    [viewport],
  );

  const snap = (n: number) => Math.round(n / SNAP_GRID) * SNAP_GRID;

  /* --------- insertion --------- */
  const insertAt = useCallback(
    (kind: SlashItemKind | ToolMode, canvasX: number, canvasY: number) => {
      let block: Block;
      let w = DEFAULT_BLOCK_W;
      let h = DEFAULT_BLOCK_H;
      switch (kind) {
        case 'sticky':
          block = { ...createBlock('sticky'), content: '', color: stickyColor } as Block;
          w = h = STICKY_SIZE;
          break;
        case 'rect':
        case 'rounded':
        case 'circle':
        case 'diamond':
          block = { ...createBlock('shape'), shape: kind as ShapeKind, color: shapeColor } as Block;
          w = h = SHAPE_SIZE;
          break;
        case 'text':
          block = createBlock('text');
          w = 240;
          h = 60;
          break;
        case 'note':
          block = createBlock('h1');
          w = 320;
          h = 80;
          break;
        case 'todo':
          block = createBlock('todo');
          w = 240;
          h = 56;
          break;
        case 'callout':
          block = createBlock('callout');
          w = 280;
          h = 120;
          break;
        default:
          block = createBlock('text');
      }
      const newLayout: CanvasBlockLayout = {
        x: snap(canvasX - w / 2),
        y: snap(canvasY - h / 2),
        w,
        h,
        z: maxZ + 1,
      };
      onUpdatePage({
        ...page,
        blocks: [...page.blocks, block],
        canvasLayout: { ...layout, [block.id]: newLayout },
        updatedAt: new Date(),
      });
      setSelectedIds(new Set([block.id]));
      setEditingId(block.id);
      // Stay in the same tool for rapid insertion of multiples; user presses V to switch back.
    },
    [page, layout, onUpdatePage, stickyColor, shapeColor, maxZ],
  );

  /* --------- keyboard --------- */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // Don't intercept while typing in inputs / contentEditable
      const t = e.target as HTMLElement;
      const typing =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t.isContentEditable;

      if (e.code === 'Space' && !typing) {
        e.preventDefault();
        setSpaceHeld(true);
      }
      if (typing) return;

      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey) {
        const map: Record<string, ToolMode> = { v: 'select', h: 'pan', s: 'sticky', r: 'rect', o: 'circle', a: 'arrow', t: 'text' };
        const tlc = e.key.toLowerCase();
        if (map[tlc]) {
          e.preventDefault();
          setTool(map[tlc]);
        }
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        deleteBlocks(selectedIds);
      }
      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(new Set(page.blocks.map((b) => b.id)));
      }
      // Nudge with arrow keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && selectedIds.size > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 16 : 2;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        nudgeSelected(dx, dy);
      }
      // Escape clears selection / cancels tools
      if (e.key === 'Escape') {
        setSelectedIds(new Set());
        setArrowDraft(null);
        setTool('select');
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [selectedIds, deleteBlocks, duplicateSelected, nudgeSelected, page.blocks]);

  /* --------- mouse on the canvas background --------- */
  const onMouseDownBg = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Ignore if click started on a block — block handlers cover that.
    if (target.closest('.canvas-block') || target.closest('.canvas-overlay')) return;

    // Right click: nothing for now.
    if (e.button === 2) return;

    // Pan if: pan tool, space held, or middle button
    if (tool === 'pan' || spaceHeld || e.button === 1) {
      setPanning({ startX: e.clientX, startY: e.clientY, baseX: viewport.x, baseY: viewport.y });
      return;
    }

    // Shape / sticky / text creation: insert at click point and stop.
    if (
      tool === 'sticky' ||
      tool === 'rect' ||
      tool === 'rounded' ||
      tool === 'circle' ||
      tool === 'diamond' ||
      tool === 'text' ||
      tool === 'note' ||
      tool === 'todo' ||
      tool === 'callout'
    ) {
      const c = clientToCanvas(e.clientX, e.clientY);
      insertAt(tool, c.x, c.y);
      return;
    }

    // Marquee selection (select tool)
    if (tool === 'select') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMarquee({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
      if (!e.shiftKey) setSelectedIds(new Set());
    }
  };

  /* --------- global mouse handlers (move/up) --------- */
  useEffect(() => {
    if (!panning && !drag && !resize && !marquee && !arrowDraft) return;
    const onMove = (e: MouseEvent) => {
      if (panning) {
        setViewport((v) => ({ ...v, x: panning.baseX + (e.clientX - panning.startX), y: panning.baseY + (e.clientY - panning.startY) }));
      } else if (drag) {
        const c = clientToCanvas(e.clientX, e.clientY);
        const dx = c.x - drag.startCanvas.x;
        const dy = c.y - drag.startCanvas.y;
        const patches: Record<string, Partial<CanvasBlockLayout>> = {};
        for (const [id, l] of drag.startLayouts) {
          patches[id] = { x: snap(l.x + dx), y: snap(l.y + dy) };
        }
        writeLayouts(patches);
      } else if (resize) {
        const dx = (e.clientX - resize.startX) / viewport.scale;
        const dy = (e.clientY - resize.startY) / viewport.scale;
        writeLayouts({
          [resize.id]: {
            w: Math.max(80, snap(resize.baseW + dx)),
            h: Math.max(40, snap(resize.baseH + dy)),
          },
        });
      } else if (marquee) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setMarquee({ ...marquee, endX: e.clientX - rect.left, endY: e.clientY - rect.top });
      } else if (arrowDraft) {
        const c = clientToCanvas(e.clientX, e.clientY);
        setArrowDraft({ ...arrowDraft, pointer: c });
      }
    };
    const onUp = (e: MouseEvent) => {
      if (marquee) {
        // Convert marquee box to canvas coords and compute selection.
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const a = clientToCanvas(rect.left + Math.min(marquee.startX, marquee.endX), rect.top + Math.min(marquee.startY, marquee.endY));
          const b = clientToCanvas(rect.left + Math.max(marquee.startX, marquee.endX), rect.top + Math.max(marquee.startY, marquee.endY));
          const ids = new Set<string>(selectedIds);
          page.blocks.forEach((blk, idx) => {
            if (blk.type === 'arrow') return; // arrows aren't selectable via marquee for now
            const l = layout[blk.id] ?? getLayout(blk.id, idx);
            const w = l.w ?? DEFAULT_BLOCK_W;
            const h = l.h ?? DEFAULT_BLOCK_H;
            if (l.x >= a.x && l.y >= a.y && l.x + w <= b.x && l.y + h <= b.y) {
              ids.add(blk.id);
            }
          });
          setSelectedIds(ids);
        }
      }
      if (arrowDraft) {
        // Find a block under the cursor; if found and not the same block, create an arrow.
        const dropTarget = findBlockAt(e.clientX, e.clientY);
        if (dropTarget && dropTarget !== arrowDraft.fromBlockId) {
          const newArrow: Block = {
            ...(createBlock('arrow') as any),
            fromBlockId: arrowDraft.fromBlockId,
            toBlockId: dropTarget,
          };
          onUpdatePage({
            ...page,
            blocks: [...page.blocks, newArrow],
            updatedAt: new Date(),
          });
        }
      }
      setPanning(null);
      setDrag(null);
      setResize(null);
      setMarquee(null);
      setArrowDraft(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panning, drag, resize, marquee, arrowDraft, viewport.scale, layout, page.blocks]);

  // Locate block under client coords (used for arrow drop target).
  const findBlockAt = useCallback(
    (cx: number, cy: number): string | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const c = clientToCanvas(cx, cy);
      // Iterate blocks top to bottom of z order
      const sorted = [...page.blocks].sort((a, b) => {
        const za = (layout[a.id]?.z ?? 0);
        const zb = (layout[b.id]?.z ?? 0);
        return zb - za;
      });
      for (const blk of sorted) {
        if (blk.type === 'arrow') continue;
        const l = layout[blk.id] ?? getLayout(blk.id, page.blocks.indexOf(blk));
        const w = l.w ?? DEFAULT_BLOCK_W;
        const h = l.h ?? DEFAULT_BLOCK_H;
        if (c.x >= l.x && c.x <= l.x + w && c.y >= l.y && c.y <= l.y + h) return blk.id;
      }
      return null;
    },
    [clientToCanvas, page.blocks, layout, getLayout],
  );

  /* --------- zoom --------- */
  const onWheel = (e: React.WheelEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = 1 + direction * 0.1;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, viewport.scale * factor));
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldX = (cx - viewport.x) / viewport.scale;
    const worldY = (cy - viewport.y) / viewport.scale;
    setViewport({ x: cx - worldX * newScale, y: cy - worldY * newScale, scale: newScale });
  };

  const adjustZoom = (factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - viewport.x) / viewport.scale;
    const worldY = (cy - viewport.y) / viewport.scale;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, viewport.scale * factor));
    setViewport({ x: cx - worldX * newScale, y: cy - worldY * newScale, scale: newScale });
  };

  const resetView = () => setViewport({ x: 200, y: 200, scale: 1 });

  /* --------- block sort by z --------- */
  const sortedBlocks = useMemo(() => {
    return [...page.blocks].sort((a, b) => {
      const za = layout[a.id]?.z ?? page.blocks.indexOf(a);
      const zb = layout[b.id]?.z ?? page.blocks.indexOf(b);
      return za - zb;
    });
  }, [page.blocks, layout]);

  /* --------- block click / drag start --------- */
  const onBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    if (tool === 'arrow') {
      // Begin arrow draft from this block.
      const c = clientToCanvas(e.clientX, e.clientY);
      setArrowDraft({ fromBlockId: blockId, pointer: c });
      return;
    }
    if (spaceHeld || tool === 'pan') {
      // Allow background pan even when starting from a block.
      setPanning({ startX: e.clientX, startY: e.clientY, baseX: viewport.x, baseY: viewport.y });
      return;
    }
    // Selection
    let nextSelected = new Set(selectedIds);
    if (e.shiftKey) {
      if (nextSelected.has(blockId)) nextSelected.delete(blockId);
      else nextSelected.add(blockId);
    } else {
      if (!nextSelected.has(blockId)) nextSelected = new Set([blockId]);
    }
    setSelectedIds(nextSelected);

    // Begin drag with all selected blocks
    const c = clientToCanvas(e.clientX, e.clientY);
    const startLayouts = new Map<string, CanvasBlockLayout>();
    for (const id of nextSelected) {
      const idx = page.blocks.findIndex((b) => b.id === id);
      startLayouts.set(id, layout[id] ?? getLayout(id, idx));
    }
    setDrag({ blockId, startCanvas: c, startLayouts });
  };

  const cursor =
    panning ? 'grabbing'
    : spaceHeld || tool === 'pan' ? 'grab'
    : tool === 'sticky' || tool === 'rect' || tool === 'rounded' || tool === 'circle' || tool === 'diamond' || tool === 'text' || tool === 'todo' || tool === 'callout' || tool === 'note' ? 'crosshair'
    : tool === 'arrow' ? 'crosshair'
    : 'default';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-130px)] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] bg-[length:20px_20px] overflow-hidden select-none"
      onMouseDown={onMouseDownBg}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor }}
    >
      {/* Top toolbar */}
      <div className="canvas-overlay absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white border border-gray-200 rounded-xl shadow-lg flex items-center gap-0.5 p-1">
        {TOOLS.map((t) => {
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={(e) => {
                e.stopPropagation();
                setTool(t.id);
              }}
              title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <t.Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {/* Sticky color swatches */}
        {tool === 'sticky' && (
          <div className="flex items-center gap-1">
            {(Object.keys(STICKY_COLOR_HEX) as StickyColor[]).map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  setStickyColor(c);
                }}
                className={`w-5 h-5 rounded-full border ${stickyColor === c ? 'ring-2 ring-blue-500 border-white' : 'border-gray-300'}`}
                style={{ background: STICKY_COLOR_HEX[c] }}
                title={c}
              />
            ))}
          </div>
        )}
        {(tool === 'rect' || tool === 'rounded' || tool === 'circle' || tool === 'diamond') && (
          <div className="flex items-center gap-1">
            {(Object.keys(SHAPE_COLOR_HEX) as ShapeColor[]).map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  setShapeColor(c);
                }}
                className={`w-5 h-5 rounded-md border ${shapeColor === c ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: SHAPE_COLOR_HEX[c].bg, borderColor: SHAPE_COLOR_HEX[c].border }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>

      {/* World */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG layer for arrows */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#4b5563" />
            </marker>
            <marker id="arrow-head-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6" />
            </marker>
          </defs>
          {page.blocks
            .filter((b): b is Extract<Block, { type: 'arrow' }> => b.type === 'arrow')
            .map((arr) => {
              const a = arr.fromBlockId ? layoutCenter(arr.fromBlockId, layout, page.blocks, getLayout) : arr.fromPoint;
              const b = arr.toBlockId ? layoutCenter(arr.toBlockId, layout, page.blocks, getLayout) : arr.toPoint;
              if (!a || !b) return null;
              const selected = selectedIds.has(arr.id);
              const stroke = selected ? '#3b82f6' : '#4b5563';
              const headId = selected ? 'url(#arrow-head-blue)' : 'url(#arrow-head)';
              return (
                <g key={arr.id} className="canvas-block pointer-events-auto" onMouseDown={(e) => onBlockMouseDown(e as any, arr.id)}>
                  {/* Hit area: invisible thick line */}
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} style={{ cursor: 'pointer' }} />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={stroke}
                    strokeWidth={selected ? 2.5 : 2}
                    strokeDasharray={arr.style === 'dashed' ? '6 4' : undefined}
                    markerEnd={headId}
                  />
                </g>
              );
            })}
          {arrowDraft && (() => {
            const from = layoutCenter(arrowDraft.fromBlockId, layout, page.blocks, getLayout);
            if (!from) return null;
            return (
              <line
                x1={from.x}
                y1={from.y}
                x2={arrowDraft.pointer.x}
                y2={arrowDraft.pointer.y}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                markerEnd="url(#arrow-head-blue)"
              />
            );
          })()}
        </svg>

        {/* Blocks */}
        {sortedBlocks.map((block, index) => {
          if (block.type === 'arrow') return null; // arrows drawn in SVG layer
          const l = layout[block.id] ?? getLayout(block.id, index);
          const isSelected = selectedIds.has(block.id);
          return (
            <CanvasBlockView
              key={block.id}
              block={block}
              layout={l}
              selected={isSelected}
              editing={editingId === block.id}
              onMouseDown={(e) => onBlockMouseDown(e, block.id)}
              onDoubleClick={() => setEditingId(block.id)}
              onCommitEdit={() => setEditingId(null)}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onStartResize={(e) => {
                e.stopPropagation();
                setResize({ id: block.id, startX: e.clientX, startY: e.clientY, baseW: l.w ?? DEFAULT_BLOCK_W, baseH: l.h ?? DEFAULT_BLOCK_H });
              }}
              renderInlineBlock={(b, onU) => renderBlock(b, onU, onSelectPage)}
            />
          );
        })}
      </div>

      {/* Marquee box */}
      {marquee && (
        <div
          className="canvas-overlay absolute pointer-events-none bg-blue-200/20 border border-blue-400/60 rounded-sm"
          style={{
            left: Math.min(marquee.startX, marquee.endX),
            top: Math.min(marquee.startY, marquee.endY),
            width: Math.abs(marquee.endX - marquee.startX),
            height: Math.abs(marquee.endY - marquee.startY),
          }}
        />
      )}

      {/* Bottom-right: zoom + view tools */}
      <div className="canvas-overlay absolute bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg flex items-center gap-1 p-1 z-20">
        <button onClick={() => adjustZoom(1 / 1.2)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Zoom out (⌘+scroll)">
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="text-xs text-gray-600 min-w-[44px] text-center font-medium">{Math.round(viewport.scale * 100)}%</div>
        <button onClick={() => adjustZoom(1.2)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={resetView} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Reset view">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selection action bar */}
      {selectedIds.size > 0 && (
        <div className="canvas-overlay absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-xl shadow-lg flex items-center gap-0.5 p-1 z-20">
          <div className="px-3 text-xs font-semibold text-white/80">
            {selectedIds.size} selected
          </div>
          <div className="w-px h-5 bg-white/20" />
          <button onClick={bringToFront} title="Bring to front" className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={sendToBack} title="Send to back" className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={duplicateSelected} title="Duplicate (⌘D)" className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white">
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => deleteBlocks(selectedIds)} title="Delete (Del)" className="p-1.5 rounded-md hover:bg-red-500/40 text-white/80 hover:text-white">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hint */}
      <div className="canvas-overlay absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] text-gray-500 z-20 pointer-events-none max-w-md">
        <span className="font-medium">V</span> select · <span className="font-medium">H</span>/hold space pan · <span className="font-medium">S</span> sticky · <span className="font-medium">R</span> rect · <span className="font-medium">O</span> circle · <span className="font-medium">A</span> arrow · ⌘+scroll zoom
      </div>
    </div>
  );
}

/* ============================================================
   Single canvas block (sticky, shape, or inline-editable block)
============================================================ */

interface CanvasBlockViewProps {
  block: Block;
  layout: CanvasBlockLayout;
  selected: boolean;
  editing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onCommitEdit: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onStartResize: (e: React.MouseEvent) => void;
  renderInlineBlock: (b: Block, onU: (u: Partial<Block>) => void) => React.ReactNode;
}

function CanvasBlockView({
  block,
  layout,
  selected,
  editing,
  onMouseDown,
  onDoubleClick,
  onCommitEdit,
  onUpdate,
  onStartResize,
  renderInlineBlock,
}: CanvasBlockViewProps) {
  const w = layout.w ?? DEFAULT_BLOCK_W;
  const h = layout.h ?? DEFAULT_BLOCK_H;
  const ring = selected ? 'ring-2 ring-blue-500 ring-offset-1' : '';

  /* --- sticky --- */
  if (block.type === 'sticky') {
    const color = STICKY_COLOR_HEX[block.color] ?? STICKY_COLOR_HEX.yellow;
    return (
      <div
        className={`canvas-block absolute shadow-md rounded-md p-3 ${ring}`}
        style={{ transform: `translate(${layout.x}px, ${layout.y}px)`, width: w, height: h, background: color, zIndex: layout.z }}
        onMouseDown={onMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        {editing ? (
          <textarea
            autoFocus
            defaultValue={block.content}
            onBlur={(e) => {
              onUpdate({ content: e.target.value } as any);
              onCommitEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent border-none outline-none resize-none text-[15px] font-medium text-gray-900"
          />
        ) : (
          <div className="w-full h-full text-[15px] font-medium text-gray-900 whitespace-pre-wrap break-words overflow-hidden">
            {block.content || <span className="text-gray-500/60 italic">Double-click to edit</span>}
          </div>
        )}
        <ResizeHandle onMouseDown={onStartResize} visible={selected} />
      </div>
    );
  }

  /* --- shape --- */
  if (block.type === 'shape') {
    const colors = SHAPE_COLOR_HEX[block.color] ?? SHAPE_COLOR_HEX.white;
    let radius = '0px';
    if (block.shape === 'rounded') radius = '16px';
    if (block.shape === 'circle') radius = '50%';

    const inner = editing ? (
      <textarea
        autoFocus
        defaultValue={block.content || ''}
        onBlur={(e) => {
          onUpdate({ content: e.target.value } as any);
          onCommitEdit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full h-full bg-transparent border-none outline-none resize-none text-center text-sm font-medium"
        style={{ color: colors.text }}
      />
    ) : (
      <div
        className="w-full h-full flex items-center justify-center text-sm font-medium px-2 text-center whitespace-pre-wrap break-words overflow-hidden"
        style={{ color: colors.text }}
      >
        {block.content || <span className="opacity-40">Double-click to edit</span>}
      </div>
    );

    if (block.shape === 'diamond') {
      return (
        <div
          className={`canvas-block absolute ${ring}`}
          style={{ transform: `translate(${layout.x}px, ${layout.y}px)`, width: w, height: h, zIndex: layout.z }}
          onMouseDown={onMouseDown}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDoubleClick();
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: colors.bg,
              border: `2px solid ${colors.border}`,
              transform: 'rotate(45deg) scale(0.71)',
              transformOrigin: 'center',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">{inner}</div>
          <ResizeHandle onMouseDown={onStartResize} visible={selected} />
        </div>
      );
    }

    return (
      <div
        className={`canvas-block absolute ${ring}`}
        style={{
          transform: `translate(${layout.x}px, ${layout.y}px)`,
          width: w,
          height: h,
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: radius,
          zIndex: layout.z,
        }}
        onMouseDown={onMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        {inner}
        <ResizeHandle onMouseDown={onStartResize} visible={selected} />
      </div>
    );
  }

  /* --- standard editable block (text/heading/todo/callout/code/etc) --- */
  return (
    <div
      className={`canvas-block absolute bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${ring}`}
      style={{ transform: `translate(${layout.x}px, ${layout.y}px)`, width: w, minHeight: h, zIndex: layout.z }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-sm cursor-grab active:cursor-grabbing transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"
        title="Drag"
      >
        <GripVertical className="w-3 h-3 text-gray-500" />
      </div>
      <div className="p-3">{renderInlineBlock(block, onUpdate)}</div>
      <ResizeHandle onMouseDown={onStartResize} visible={selected} />
    </div>
  );
}

function ResizeHandle({ onMouseDown, visible }: { onMouseDown: (e: React.MouseEvent) => void; visible: boolean }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute bottom-0 right-0 w-3 h-3 cursor-se-resize ${visible ? 'opacity-80' : 'opacity-0 hover:opacity-60'}`}
      title="Resize"
    >
      <svg viewBox="0 0 10 10" className="w-full h-full text-gray-500">
        <path d="M0 10 L10 0 M4 10 L10 4 M8 10 L10 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

/* ============================================================
   Helpers
============================================================ */

function layoutCenter(
  blockId: string,
  layout: Record<string, CanvasBlockLayout>,
  blocks: Block[],
  getLayout: (id: string, idx: number) => CanvasBlockLayout,
): { x: number; y: number } | null {
  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx === -1) return null;
  const l = layout[blockId] ?? getLayout(blockId, idx);
  const w = l.w ?? DEFAULT_BLOCK_W;
  const h = l.h ?? DEFAULT_BLOCK_H;
  return { x: l.x + w / 2, y: l.y + h / 2 };
}
