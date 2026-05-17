import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  File as FileIcon,
  Calendar,
  Smile,
  Image as CoverIcon,
  Star,
  X,
  Type,
} from 'lucide-react';
import { Block, BlockType, Page, CalloutColor } from '../../types';
import {
  SLASH_ITEMS,
  SlashItem,
  SlashItemKind,
  convertBlock,
  createBlock,
  detectMarkdownShortcut,
  filterSlashItems,
  isInlineTextBlock,
} from './blocks';
import { SlashMenu } from './SlashMenu';
import { PageLinkPopup } from './PageLinkPopup';
import { IconPicker } from './IconPicker';
import { Backlinks } from './Backlinks';

interface NotionPageProps {
  page: Page;
  pages: Page[];
  onUpdatePage: (page: Page) => void;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (opts?: { parentId?: string; title?: string }) => string;
  onDeletePage: (pageId: string) => void;
  onBack: () => void;
}

type AnchorPos = { top: number; left: number } | null;

interface SlashState {
  blockId: string;
  query: string;
  index: number;
  anchor: AnchorPos;
}

interface LinkState {
  blockId: string;
  query: string;
  index: number;
  anchor: AnchorPos;
  /** Position in the contentEditable where the [[ started — restored when popup closes. */
  startMarker: string; // an HTML marker we inject; replaced on commit.
}

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600',
  'https://images.unsplash.com/photo-1487546331507-fcf8a5d27ab3?w=1600',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600',
];

export function NotionPage({
  page,
  pages,
  onUpdatePage,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onBack,
}: NotionPageProps) {
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [linkPopup, setLinkPopup] = useState<LinkState | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<AnchorPos>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [focusBlockId, setFocusBlockId] = useState<{ id: string; pos?: 'start' | 'end' } | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const updatePage = useCallback(
    (updates: Partial<Page>) => onUpdatePage({ ...page, ...updates, updatedAt: new Date() }),
    [onUpdatePage, page],
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      const next = page.blocks.map((b) =>
        b.id === blockId ? ({ ...b, ...updates, updatedAt: new Date() } as Block) : b,
      );
      updatePage({ blocks: next });
    },
    [page.blocks, updatePage],
  );

  const replaceBlock = useCallback(
    (blockId: string, newBlock: Block) => {
      const next = page.blocks.map((b) => (b.id === blockId ? newBlock : b));
      updatePage({ blocks: next });
    },
    [page.blocks, updatePage],
  );

  const insertBlockAfter = useCallback(
    (afterId: string | null, newBlock: Block, focus: boolean = true) => {
      const idx = afterId ? page.blocks.findIndex((b) => b.id === afterId) : -1;
      const next = [...page.blocks];
      next.splice(idx + 1, 0, newBlock);
      updatePage({ blocks: next });
      if (focus) setFocusBlockId({ id: newBlock.id, pos: 'start' });
    },
    [page.blocks, updatePage],
  );

  const deleteBlock = useCallback(
    (blockId: string, focusPrev: boolean = true) => {
      const idx = page.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      const next = page.blocks.filter((b) => b.id !== blockId);
      if (next.length === 0) {
        const fresh = createBlock('text');
        updatePage({ blocks: [fresh] });
        setFocusBlockId({ id: fresh.id, pos: 'start' });
        return;
      }
      updatePage({ blocks: next });
      if (focusPrev) {
        const target = next[Math.max(0, idx - 1)];
        if (target) setFocusBlockId({ id: target.id, pos: 'end' });
      }
    },
    [page.blocks, updatePage],
  );

  const duplicateBlock = useCallback(
    (blockId: string) => {
      const b = page.blocks.find((x) => x.id === blockId);
      if (!b) return;
      const copy = { ...b, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() } as Block;
      insertBlockAfter(blockId, copy, false);
    },
    [page.blocks, insertBlockAfter],
  );

  const moveBlock = useCallback(
    (fromId: string, toId: string) => {
      const next = [...page.blocks];
      const fromIdx = next.findIndex((b) => b.id === fromId);
      const toIdx = next.findIndex((b) => b.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      updatePage({ blocks: next });
    },
    [page.blocks, updatePage],
  );

  // Focus a block on next render after we requested it.
  useEffect(() => {
    if (!focusBlockId) return;
    const el = blockRefs.current.get(focusBlockId.id);
    if (!el) return;
    el.focus();
    placeCursor(el, focusBlockId.pos ?? 'end');
    setFocusBlockId(null);
  }, [focusBlockId, page.blocks]);

  // Auto-grow title textarea.
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [page.title, page.id]);

  // Slash menu commit
  const commitSlash = useCallback(
    (kind: SlashItemKind) => {
      if (!slash) return;
      const targetBlock = page.blocks.find((b) => b.id === slash.blockId);
      if (!targetBlock) return;
      const el = blockRefs.current.get(targetBlock.id);

      if (kind === 'subpage') {
        // Create a new child page and insert a link to it.
        const newId = onCreatePage({ parentId: page.id, title: 'Untitled' });
        const linkHtml = ` <a class="page-link" data-page-id="${newId}">📄 Untitled</a>`;
        // Replace the "/query" substring in the current block with the link.
        const currentHTML = el?.innerHTML ?? ('content' in targetBlock ? (targetBlock as any).content : '');
        const cleaned = currentHTML.replace(/\/[^\s<]*$/, '');
        updateBlock(targetBlock.id, { content: cleaned + linkHtml } as any);
        setSlash(null);
        return;
      }

      // Strip the "/query" from current content.
      const currentText = el?.innerHTML ?? ('content' in targetBlock ? (targetBlock as any).content : '');
      const cleaned = currentText.replace(/\/[^\s<]*$/, '');
      const converted = convertBlock(targetBlock, kind, cleaned);
      replaceBlock(targetBlock.id, converted);
      setSlash(null);
      setFocusBlockId({ id: targetBlock.id, pos: 'end' });
    },
    [slash, page.blocks, page.id, onCreatePage, replaceBlock, updateBlock],
  );

  // Page link commit
  const commitLink = useCallback(
    (linkedPageId: string, linkedTitle: string) => {
      if (!linkPopup) return;
      const el = blockRefs.current.get(linkPopup.blockId);
      if (!el) return;
      const html = el.innerHTML;
      // Replace `[[query` (no closing brackets yet) with the link element.
      const linkedPage = pages.find((p) => p.id === linkedPageId);
      const emoji = linkedPage?.emoji ?? '📄';
      const safeTitle = (linkedTitle || 'Untitled').replace(/[<>&]/g, (c) =>
        c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;',
      );
      const linkHtml = `<a class="page-link" data-page-id="${linkedPageId}">${emoji} ${safeTitle}</a>&nbsp;`;
      const replaced = html.replace(/\[\[[^\]]*$/, linkHtml);
      el.innerHTML = replaced;
      placeCursorAtEnd(el);
      // Persist
      const block = page.blocks.find((b) => b.id === linkPopup.blockId);
      if (block) updateBlock(block.id, { content: replaced } as any);
      setLinkPopup(null);
    },
    [linkPopup, pages, page.blocks, updateBlock],
  );

  const createAndCommitLink = useCallback(
    (title: string) => {
      const newId = onCreatePage({ title });
      commitLink(newId, title);
    },
    [onCreatePage, commitLink],
  );

  // Keyboard handling at editor scope (slash + link popup nav)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (slash) {
        const items = filterSlashItems(slash.query);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlash({ ...slash, index: Math.min(items.length - 1, slash.index + 1) });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlash({ ...slash, index: Math.max(0, slash.index - 1) });
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          if (items.length > 0) {
            e.preventDefault();
            const idx = Math.min(slash.index, items.length - 1);
            commitSlash(items[idx].kind);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSlash(null);
        }
        return;
      }
      if (linkPopup) {
        const q = linkPopup.query.trim().toLowerCase();
        const filtered = q
          ? pages.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 8)
          : pages.slice(0, 8);
        const total = filtered.length + (linkPopup.query.trim().length > 0 ? 1 : 0);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setLinkPopup({ ...linkPopup, index: Math.min(total - 1, linkPopup.index + 1) });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setLinkPopup({ ...linkPopup, index: Math.max(0, linkPopup.index - 1) });
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          if (total > 0) {
            e.preventDefault();
            const idx = Math.min(linkPopup.index, total - 1);
            if (idx < filtered.length) {
              commitLink(filtered[idx].id, filtered[idx].title);
            } else {
              createAndCommitLink(linkPopup.query.trim());
            }
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setLinkPopup(null);
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [slash, linkPopup, pages, commitSlash, commitLink, createAndCommitLink]);

  // Handle clicks on page-link anchors inside content
  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.page-link') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const id = link.getAttribute('data-page-id');
        if (id) onSelectPage(id);
      }
    },
    [onSelectPage],
  );

  return (
    <div className="flex-1 bg-white min-h-screen" onClick={handleContentClick}>
      {/* Cover */}
      {page.cover ? (
        <div
          className="relative h-56 w-full bg-cover bg-center group"
          style={{ backgroundImage: `url(${page.cover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-lg hover:bg-white shadow"
            >
              Change cover
            </button>
            <button
              onClick={() => updatePage({ cover: undefined })}
              className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-lg hover:bg-white shadow"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      {/* Sticky header bar */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-20">
        <div className="max-w-3xl mx-auto px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Pages</span>
          </button>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <button
              onClick={() => updatePage({ favorite: !page.favorite })}
              className={`p-1.5 rounded-md hover:bg-gray-100 ${page.favorite ? 'text-amber-500' : 'text-gray-400'}`}
              title="Favorite"
            >
              <Star className="w-4 h-4" fill={page.favorite ? 'currentColor' : 'none'} />
            </button>
            <span>Last edited {new Date(page.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={`max-w-3xl mx-auto px-8 ${page.cover ? 'pt-12' : 'pt-16'} pb-24`}>
        {/* Cover/icon shortcuts (visible when not yet set) */}
        {(!page.emoji || !page.cover) && (
          <div className="flex items-center gap-3 mb-3 -ml-1 opacity-60 hover:opacity-100 transition-opacity">
            {!page.emoji && (
              <button
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setShowIconPicker({ top: rect.bottom + 6, left: rect.left });
                }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Add icon</span>
              </button>
            )}
            {!page.cover && (
              <button
                onClick={() => setShowCoverPicker(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
              >
                <CoverIcon className="w-3.5 h-3.5" />
                <span>Add cover</span>
              </button>
            )}
          </div>
        )}

        {/* Page icon */}
        {page.emoji && (
          <button
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setShowIconPicker({ top: rect.bottom + 6, left: rect.left });
            }}
            className="text-6xl mb-2 hover:bg-gray-50 rounded-lg p-1 -ml-1 transition-colors"
          >
            {page.emoji}
          </button>
        )}

        {/* Title */}
        <textarea
          ref={titleRef}
          value={page.title}
          onChange={(e) => updatePage({ title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const first = page.blocks[0];
              if (first) setFocusBlockId({ id: first.id, pos: 'start' });
            }
          }}
          rows={1}
          placeholder="Untitled"
          className="w-full bg-transparent border-none outline-none resize-none text-5xl font-bold text-gray-900 placeholder-gray-300 leading-tight mb-6 overflow-hidden"
        />

        {/* Blocks */}
        <div className="space-y-1">
          {page.blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              pages={pages}
              registerRef={(el) => {
                if (el) blockRefs.current.set(block.id, el);
                else blockRefs.current.delete(block.id);
              }}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onReplace={(b) => replaceBlock(block.id, b)}
              onEnter={() => {
                const after = createBlock('text');
                insertBlockAfter(block.id, after);
              }}
              onBackspaceEmpty={() => deleteBlock(block.id)}
              onDuplicate={() => duplicateBlock(block.id)}
              onDelete={() => deleteBlock(block.id)}
              onTurnInto={(kind) => {
                const converted = convertBlock(block, kind);
                replaceBlock(block.id, converted);
              }}
              onSlashOpen={(query, anchor) => setSlash({ blockId: block.id, query, index: 0, anchor })}
              onSlashUpdate={(query) => slash && slash.blockId === block.id && setSlash({ ...slash, query, index: 0 })}
              onSlashClose={() => slash?.blockId === block.id && setSlash(null)}
              onLinkOpen={(query, anchor) =>
                setLinkPopup({ blockId: block.id, query, index: 0, anchor, startMarker: '' })
              }
              onLinkUpdate={(query) => linkPopup && linkPopup.blockId === block.id && setLinkPopup({ ...linkPopup, query, index: 0 })}
              onLinkClose={() => linkPopup?.blockId === block.id && setLinkPopup(null)}
              onSelectPage={onSelectPage}
              onDragStart={() => setDraggedBlock(block.id)}
              onDragEnd={() => {
                setDraggedBlock(null);
                setDropTarget(null);
              }}
              onDragOver={() => setDropTarget(block.id)}
              onDrop={() => {
                if (draggedBlock && draggedBlock !== block.id) moveBlock(draggedBlock, block.id);
                setDropTarget(null);
                setDraggedBlock(null);
              }}
              isDragTarget={dropTarget === block.id && draggedBlock !== block.id}
              isDragging={draggedBlock === block.id}
            />
          ))}
          {page.blocks.length === 0 && (
            <button
              onClick={() => {
                const t = createBlock('text');
                updatePage({ blocks: [t] });
                setFocusBlockId({ id: t.id });
              }}
              className="text-gray-400 hover:text-gray-600 text-sm py-2"
            >
              Click to start writing, or press "/" for commands
            </button>
          )}
        </div>

        {/* Add block at end */}
        <div className="mt-3">
          <button
            onClick={() => {
              const last = page.blocks[page.blocks.length - 1];
              const t = createBlock('text');
              insertBlockAfter(last?.id ?? null, t);
            }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add a block</span>
          </button>
        </div>

        {/* Sub-pages */}
        {pages.some((p) => p.parentId === page.id) && (
          <div className="mt-12">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sub-pages
            </div>
            <div className="space-y-1">
              {pages
                .filter((p) => p.parentId === page.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPage(p.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-lg">{p.emoji || '📄'}</span>
                    <span className="text-sm text-gray-800 font-medium flex-1 truncate">
                      {p.title || 'Untitled'}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Backlinks */}
        <Backlinks currentPageId={page.id} allPages={pages} onSelect={onSelectPage} />
      </div>

      {/* Popups */}
      {slash && (
        <SlashMenu
          query={slash.query}
          selectedIndex={slash.index}
          anchor={slash.anchor}
          onIndexChange={(i) => setSlash({ ...slash, index: i })}
          onPick={commitSlash}
          onClose={() => setSlash(null)}
        />
      )}

      {linkPopup && (
        <PageLinkPopup
          query={linkPopup.query}
          pages={pages.filter((p) => p.id !== page.id)}
          selectedIndex={linkPopup.index}
          anchor={linkPopup.anchor}
          onIndexChange={(i) => setLinkPopup({ ...linkPopup, index: i })}
          onPick={commitLink}
          onCreateAndPick={createAndCommitLink}
          onClose={() => setLinkPopup(null)}
        />
      )}

      {showIconPicker && (
        <IconPicker
          value={page.emoji}
          anchor={showIconPicker}
          onPick={(e) => {
            updatePage({ emoji: e });
            setShowIconPicker(null);
          }}
          onRemove={() => {
            updatePage({ emoji: undefined });
            setShowIconPicker(null);
          }}
          onClose={() => setShowIconPicker(null)}
        />
      )}

      {showCoverPicker && (
        <CoverPickerModal
          current={page.cover}
          onPick={(url) => {
            updatePage({ cover: url });
            setShowCoverPicker(false);
          }}
          onClose={() => setShowCoverPicker(false)}
        />
      )}
    </div>
  );
}

/* ============================================================
   Block rendering
============================================================ */

interface BlockRowProps {
  block: Block;
  pages: Page[];
  registerRef: (el: HTMLDivElement | null) => void;
  onUpdate: (updates: Partial<Block>) => void;
  onReplace: (block: Block) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTurnInto: (kind: SlashItemKind) => void;
  onSlashOpen: (query: string, anchor: AnchorPos) => void;
  onSlashUpdate: (query: string) => void;
  onSlashClose: () => void;
  onLinkOpen: (query: string, anchor: AnchorPos) => void;
  onLinkUpdate: (query: string) => void;
  onLinkClose: () => void;
  onSelectPage: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragTarget: boolean;
  isDragging: boolean;
}

function BlockRow(props: BlockRowProps) {
  const {
    block, pages, registerRef, onUpdate, onEnter, onBackspaceEmpty,
    onDuplicate, onDelete, onTurnInto, onSlashOpen, onSlashUpdate, onSlashClose,
    onLinkOpen, onLinkUpdate, onLinkClose, onSelectPage,
    onDragStart, onDragEnd, onDragOver, onDrop, isDragTarget, isDragging,
  } = props;

  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative flex items-start gap-1 ${
        isDragging ? 'opacity-40' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowMenu(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      {/* Drop indicator */}
      {isDragTarget && (
        <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-blue-500 rounded-full pointer-events-none" />
      )}

      {/* Hover controls */}
      <div
        className={`flex items-center pt-1.5 transition-opacity ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart();
            e.dataTransfer.effectAllowed = 'move';
            // Set a tiny drag image so the cursor stays clean.
            const img = document.createElement('div');
            img.style.width = '1px';
            img.style.height = '1px';
            e.dataTransfer.setDragImage(img, 0, 0);
          }}
          onDragEnd={onDragEnd}
          className="w-5 h-6 flex items-center justify-center text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onSlashOpen('', { top: rect.bottom + 6, left: rect.left });
          }}
          className="w-5 h-6 flex items-center justify-center text-gray-300 hover:text-gray-600"
          title="Click to add block"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-5 h-6 flex items-center justify-center text-gray-300 hover:text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div
              className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1 min-w-[180px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Turn into
              </div>
              {(['text', 'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'toggle', 'quote', 'callout', 'code'] as SlashItemKind[]).map((k) => {
                const item = SLASH_ITEMS.find((it) => it.kind === k);
                if (!item) return null;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      onTurnInto(k);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <item.icon className="w-3.5 h-3.5 text-gray-500" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Block body */}
      <div className="flex-1 min-w-0">
        <BlockBody
          block={block}
          pages={pages}
          registerRef={registerRef}
          onUpdate={onUpdate}
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSelectPage={onSelectPage}
          onSlashOpen={onSlashOpen}
          onSlashUpdate={onSlashUpdate}
          onSlashClose={onSlashClose}
          onLinkOpen={onLinkOpen}
          onLinkUpdate={onLinkUpdate}
          onLinkClose={onLinkClose}
          onMarkdownTransform={(kind, rest) => {
            const converted = convertBlock(block, kind, rest);
            // Replace + focus end via parent? simplest: just replace via onUpdate-ish flow.
            // We need replace + focus. The parent passes onTurnInto which preserves content; we want rest.
            onUpdate(converted);
          }}
        />
      </div>
    </div>
  );
}

interface BlockBodyProps {
  block: Block;
  pages: Page[];
  registerRef: (el: HTMLDivElement | null) => void;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onSelectPage: (id: string) => void;
  onSlashOpen: (query: string, anchor: AnchorPos) => void;
  onSlashUpdate: (query: string) => void;
  onSlashClose: () => void;
  onLinkOpen: (query: string, anchor: AnchorPos) => void;
  onLinkUpdate: (query: string) => void;
  onLinkClose: () => void;
  onMarkdownTransform: (kind: SlashItemKind, rest: string) => void;
}

function BlockBody(props: BlockBodyProps) {
  const { block, pages, registerRef, onUpdate, onEnter, onBackspaceEmpty,
          onSelectPage, onSlashOpen, onSlashUpdate, onSlashClose,
          onLinkOpen, onLinkUpdate, onLinkClose, onMarkdownTransform } = props;

  switch (block.type) {
    case 'text':
      return (
        <Editable
          html={block.content}
          placeholder='Type "/" for commands, "[[" to link a page'
          onChange={(html) => onUpdate({ content: html } as any)}
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlashOpen={onSlashOpen}
          onSlashUpdate={onSlashUpdate}
          onSlashClose={onSlashClose}
          onLinkOpen={onLinkOpen}
          onLinkUpdate={onLinkUpdate}
          onLinkClose={onLinkClose}
          onMarkdownTransform={onMarkdownTransform}
          registerRef={registerRef}
          className="text-base text-gray-800 leading-7 py-0.5"
        />
      );

    case 'heading': {
      const sizes: Record<number, string> = {
        1: 'text-3xl font-bold leading-tight',
        2: 'text-2xl font-semibold leading-snug',
        3: 'text-xl font-semibold leading-snug',
      };
      const pad: Record<number, string> = {
        1: 'pt-6 pb-1',
        2: 'pt-5 pb-1',
        3: 'pt-4 pb-1',
      };
      return (
        <Editable
          html={block.content}
          placeholder={`Heading ${block.level}`}
          onChange={(html) => onUpdate({ content: html } as any)}
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlashOpen={onSlashOpen}
          onSlashUpdate={onSlashUpdate}
          onSlashClose={onSlashClose}
          onLinkOpen={onLinkOpen}
          onLinkUpdate={onLinkUpdate}
          onLinkClose={onLinkClose}
          onMarkdownTransform={onMarkdownTransform}
          registerRef={registerRef}
          className={`${sizes[block.level]} ${pad[block.level]} text-gray-900`}
        />
      );
    }

    case 'bullet':
      return (
        <div className="flex items-start gap-2 py-0.5">
          <span className="text-gray-500 leading-7 select-none mt-[1px]">•</span>
          <Editable
            html={block.content}
            placeholder="List item"
            onChange={(html) => onUpdate({ content: html } as any)}
            onEnter={onEnter}
            onBackspaceEmpty={onBackspaceEmpty}
            onSlashOpen={onSlashOpen}
            onSlashUpdate={onSlashUpdate}
            onSlashClose={onSlashClose}
            onLinkOpen={onLinkOpen}
            onLinkUpdate={onLinkUpdate}
            onLinkClose={onLinkClose}
            onMarkdownTransform={onMarkdownTransform}
            registerRef={registerRef}
            className="flex-1 text-base text-gray-800 leading-7"
          />
        </div>
      );

    case 'numbered':
      return (
        <div className="flex items-start gap-2 py-0.5">
          <span className="text-gray-500 leading-7 select-none min-w-[1.25rem]">1.</span>
          <Editable
            html={block.content}
            placeholder="List item"
            onChange={(html) => onUpdate({ content: html } as any)}
            onEnter={onEnter}
            onBackspaceEmpty={onBackspaceEmpty}
            onSlashOpen={onSlashOpen}
            onSlashUpdate={onSlashUpdate}
            onSlashClose={onSlashClose}
            onLinkOpen={onLinkOpen}
            onLinkUpdate={onLinkUpdate}
            onLinkClose={onLinkClose}
            onMarkdownTransform={onMarkdownTransform}
            registerRef={registerRef}
            className="flex-1 text-base text-gray-800 leading-7"
          />
        </div>
      );

    case 'todo':
      return (
        <div className="flex items-start gap-2 py-0.5">
          <input
            type="checkbox"
            checked={block.checked}
            onChange={(e) => onUpdate({ checked: e.target.checked } as any)}
            className="mt-2 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <Editable
            html={block.content}
            placeholder="To-do"
            onChange={(html) => onUpdate({ content: html } as any)}
            onEnter={onEnter}
            onBackspaceEmpty={onBackspaceEmpty}
            onSlashOpen={onSlashOpen}
            onSlashUpdate={onSlashUpdate}
            onSlashClose={onSlashClose}
            onLinkOpen={onLinkOpen}
            onLinkUpdate={onLinkUpdate}
            onLinkClose={onLinkClose}
            onMarkdownTransform={onMarkdownTransform}
            registerRef={registerRef}
            className={`flex-1 text-base leading-7 ${block.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}
          />
        </div>
      );

    case 'toggle':
      return (
        <div>
          <div className="flex items-start gap-1 py-0.5">
            <button
              onClick={() => onUpdate({ open: !block.open } as any)}
              className="mt-1.5 text-gray-500 hover:text-gray-800 transition-transform"
              style={{ transform: block.open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Editable
              html={block.content}
              placeholder="Toggle"
              onChange={(html) => onUpdate({ content: html } as any)}
              onEnter={onEnter}
              onBackspaceEmpty={onBackspaceEmpty}
              onSlashOpen={onSlashOpen}
              onSlashUpdate={onSlashUpdate}
              onSlashClose={onSlashClose}
              onLinkOpen={onLinkOpen}
              onLinkUpdate={onLinkUpdate}
              onLinkClose={onLinkClose}
              onMarkdownTransform={onMarkdownTransform}
              registerRef={registerRef}
              className="flex-1 text-base text-gray-800 leading-7 font-medium"
            />
          </div>
          {block.open && (
            <div className="ml-6 mt-1 text-sm text-gray-500 italic border-l-2 border-gray-100 pl-3">
              Empty. Add a block below this toggle to nest content.
            </div>
          )}
        </div>
      );

    case 'callout': {
      const colors: Record<CalloutColor, string> = {
        gray: 'bg-gray-50 border-gray-200',
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        yellow: 'bg-amber-50 border-amber-200',
        red: 'bg-red-50 border-red-200',
        purple: 'bg-purple-50 border-purple-200',
      };
      const color = (block.color as CalloutColor) || 'blue';
      return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[color]} my-1`}>
          <button
            onClick={() => {
              const order: CalloutColor[] = ['blue', 'green', 'yellow', 'red', 'purple', 'gray'];
              const next = order[(order.indexOf(color) + 1) % order.length];
              onUpdate({ color: next } as any);
            }}
            className="text-xl select-none hover:scale-110 transition-transform"
            title="Click to cycle color"
          >
            {block.emoji || '💡'}
          </button>
          <Editable
            html={block.content}
            placeholder="Type something…"
            onChange={(html) => onUpdate({ content: html } as any)}
            onEnter={onEnter}
            onBackspaceEmpty={onBackspaceEmpty}
            onSlashOpen={onSlashOpen}
            onSlashUpdate={onSlashUpdate}
            onSlashClose={onSlashClose}
            onLinkOpen={onLinkOpen}
            onLinkUpdate={onLinkUpdate}
            onLinkClose={onLinkClose}
            onMarkdownTransform={onMarkdownTransform}
            registerRef={registerRef}
            className="flex-1 text-base text-gray-800 leading-7"
          />
        </div>
      );
    }

    case 'quote':
      return (
        <div className="border-l-4 border-gray-300 pl-4 py-1 my-1">
          <Editable
            html={block.content}
            placeholder="Empty quote"
            onChange={(html) => onUpdate({ content: html } as any)}
            onEnter={onEnter}
            onBackspaceEmpty={onBackspaceEmpty}
            onSlashOpen={onSlashOpen}
            onSlashUpdate={onSlashUpdate}
            onSlashClose={onSlashClose}
            onLinkOpen={onLinkOpen}
            onLinkUpdate={onLinkUpdate}
            onLinkClose={onLinkClose}
            onMarkdownTransform={onMarkdownTransform}
            registerRef={registerRef}
            className="text-base text-gray-700 italic leading-7"
          />
        </div>
      );

    case 'divider':
      return (
        <div className="py-3">
          <hr className="border-gray-200" />
        </div>
      );

    case 'code':
      return (
        <div className="my-1 rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
          <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-b border-gray-700">
            <select
              value={block.language || 'javascript'}
              onChange={(e) => onUpdate({ language: e.target.value } as any)}
              className="text-xs bg-transparent text-gray-300 border-none outline-none focus:ring-0"
            >
              {['javascript', 'typescript', 'python', 'bash', 'html', 'css', 'json', 'markdown', 'sql'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value } as any)}
            placeholder="// your code…"
            spellCheck={false}
            className="w-full bg-gray-900 text-green-300 font-mono text-sm p-3 outline-none resize-none"
            rows={Math.max(3, (block.content || '').split('\n').length)}
          />
        </div>
      );

    case 'image':
      return <ImageBlockUI block={block} onUpdate={onUpdate} />;

    case 'file':
      return <FileBlockUI block={block} onUpdate={onUpdate} />;

    case 'date':
      return (
        <div className="flex items-center gap-3 py-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={block.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value } as any)}
            placeholder="Label"
            className="text-sm bg-transparent border-none outline-none text-gray-800 font-medium w-28"
          />
          <input
            type={block.includeTime ? 'datetime-local' : 'date'}
            value={
              block.includeTime
                ? new Date(block.date).toISOString().slice(0, 16)
                : new Date(block.date).toISOString().slice(0, 10)
            }
            onChange={(e) => onUpdate({ date: new Date(e.target.value) } as any)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <label className="text-xs text-gray-500 flex items-center gap-1">
            <input
              type="checkbox"
              checked={block.includeTime || false}
              onChange={(e) => onUpdate({ includeTime: e.target.checked } as any)}
            />
            time
          </label>
        </div>
      );

    case 'table':
      return <TableBlockUI block={block} onUpdate={onUpdate} />;

    case 'list':
      // Legacy multi-item list — render simple.
      return (
        <div className="space-y-1 py-1">
          {block.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-gray-500">{block.ordered ? `${idx + 1}.` : '•'}</span>
              <input
                value={item}
                onChange={(e) => {
                  const items = [...block.items];
                  items[idx] = e.target.value;
                  onUpdate({ items } as any);
                }}
                className="flex-1 bg-transparent outline-none text-gray-800"
              />
            </div>
          ))}
        </div>
      );

    default:
      return <div className="text-sm text-gray-400 italic">Unsupported block</div>;
  }
}

/* ============================================================
   Editable contentEditable area
   ============================================================ */

interface EditableProps {
  html: string;
  placeholder: string;
  className?: string;
  onChange: (html: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onSlashOpen: (query: string, anchor: AnchorPos) => void;
  onSlashUpdate: (query: string) => void;
  onSlashClose: () => void;
  onLinkOpen: (query: string, anchor: AnchorPos) => void;
  onLinkUpdate: (query: string) => void;
  onLinkClose: () => void;
  onMarkdownTransform: (kind: SlashItemKind, rest: string) => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

function Editable({
  html,
  placeholder,
  className,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onSlashOpen,
  onSlashUpdate,
  onSlashClose,
  onLinkOpen,
  onLinkUpdate,
  onLinkClose,
  onMarkdownTransform,
  registerRef,
}: EditableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>(html || '');
  const slashOpenRef = useRef(false);
  const linkOpenRef = useRef(false);

  // Initial / external content sync.
  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return; // don't clobber typing
    if (ref.current.innerHTML !== (html || '')) {
      ref.current.innerHTML = html || '';
      lastHtmlRef.current = html || '';
    }
  }, [html]);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;
      registerRef(el);
      if (el && el.innerHTML !== (html || '')) {
        el.innerHTML = html || '';
        lastHtmlRef.current = html || '';
      }
    },
    [registerRef, html],
  );

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const innerHTML = el.innerHTML;
    const plain = el.innerText;
    lastHtmlRef.current = innerHTML;
    onChange(innerHTML);

    // Markdown shortcut: on space, check prefix.
    // We check after onChange so state is consistent, but we evaluate based on current text.
    const sel = window.getSelection();
    const caretText = plain.slice(0, sel?.focusOffset ?? plain.length);
    // Actually the simplest: check if plain text fully matches a shortcut + already includes a trailing space (just typed).
    const shortcut = detectMarkdownShortcut(plain);
    if (shortcut) {
      // Convert: parent gets called with kind + rest. Replace innerHTML to empty so block doesn't keep marker.
      onMarkdownTransform(shortcut.kind, shortcut.rest);
      return;
    }

    // Slash menu trigger: if there's a "/" right before the caret, with no whitespace between caret and the slash.
    const slashMatch = caretText.match(/\/([\w-]*)$/);
    if (slashMatch && plain.startsWith('/') /* basic guard: don't open mid-paragraph */) {
      const rect = getCaretRect(el);
      if (!slashOpenRef.current) {
        slashOpenRef.current = true;
        onSlashOpen(slashMatch[1], rect);
      } else {
        onSlashUpdate(slashMatch[1]);
      }
    } else if (slashOpenRef.current) {
      slashOpenRef.current = false;
      onSlashClose();
    }

    // Page link trigger: detect `[[query` (no closing).
    const linkMatch = caretText.match(/\[\[([^\]\n]*)$/);
    if (linkMatch) {
      const rect = getCaretRect(el);
      if (!linkOpenRef.current) {
        linkOpenRef.current = true;
        onLinkOpen(linkMatch[1], rect);
      } else {
        onLinkUpdate(linkMatch[1]);
      }
    } else if (linkOpenRef.current) {
      linkOpenRef.current = false;
      onLinkClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    // Let slash/link handlers (set up at editor scope) handle ArrowUp/Down/Enter when open.
    if (slashOpenRef.current || linkOpenRef.current) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
        // intercepted by editor-level listener
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
      return;
    }

    if (e.key === 'Backspace') {
      const plain = el.innerText;
      const sel = window.getSelection();
      const atStart = sel && sel.isCollapsed && sel.anchorOffset === 0 && isAtStartOfNode(el, sel);
      if (atStart && plain.length === 0) {
        e.preventDefault();
        onBackspaceEmpty();
      }
    }
  };

  const handleBlur = () => {
    // Final flush; also collapse any popups owned by this block.
    if (slashOpenRef.current) {
      slashOpenRef.current = false;
      onSlashClose();
    }
    if (linkOpenRef.current) {
      linkOpenRef.current = false;
      onLinkClose();
    }
  };

  return (
    <div
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      className={`outline-none focus:outline-none editable-block ${className || ''}`}
      style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
    />
  );
}

/* ============================================================
   Image / File / Table blocks (keep them simple)
   ============================================================ */

function ImageBlockUI({ block, onUpdate }: { block: Extract<Block, { type: 'image' }>; onUpdate: (u: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
      alert('File size exceeds 1MB');
      return;
    }
    const r = new FileReader();
    r.onload = (ev) => onUpdate({ url: ev.target?.result as string, caption: block.caption || f.name });
    r.readAsDataURL(f);
  };
  return (
    <div className="my-1">
      {block.url ? (
        <div className="relative group">
          <img src={block.url} alt={block.caption || ''} className="max-w-full rounded-lg border border-gray-200" />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <ImageIcon className="w-5 h-5 mr-2" /> Click to upload image
        </button>
      )}
      {block.url && (
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Add caption…"
          className="w-full text-sm text-gray-500 bg-transparent border-none outline-none mt-1"
        />
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function FileBlockUI({ block, onUpdate }: { block: Extract<Block, { type: 'file' }>; onUpdate: (u: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
      alert('File size exceeds 1MB');
      return;
    }
    const r = new FileReader();
    r.onload = (ev) =>
      onUpdate({ url: ev.target?.result as string, fileName: f.name, fileSize: f.size, fileType: f.type });
    r.readAsDataURL(f);
  };
  return (
    <div className="my-1">
      {block.url ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="w-9 h-9 bg-blue-100 rounded-md flex items-center justify-center">
            <FileIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{block.fileName}</div>
            {block.fileSize ? (
              <div className="text-xs text-gray-500">{(block.fileSize / 1024).toFixed(1)} KB</div>
            ) : null}
          </div>
          <a
            href={block.url}
            download={block.fileName}
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <FileIcon className="w-4 h-4 mr-2" /> Click to upload file
        </button>
      )}
      <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
    </div>
  );
}

function TableBlockUI({ block, onUpdate }: { block: Extract<Block, { type: 'table' }>; onUpdate: (u: any) => void }) {
  return (
    <div className="my-1 overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {block.headers.map((h, i) => (
              <th key={i} className="border-r last:border-r-0 border-gray-200 p-2">
                <input
                  value={h}
                  onChange={(e) => {
                    const headers = [...block.headers];
                    headers[i] = e.target.value;
                    onUpdate({ headers });
                  }}
                  className="w-full bg-transparent outline-none font-semibold text-sm text-gray-900"
                />
              </th>
            ))}
            <th className="w-10 p-1">
              <button
                onClick={() => {
                  const headers = [...block.headers, `Column ${block.headers.length + 1}`];
                  const rows = block.rows.map((r) => [...r, '']);
                  onUpdate({ headers, rows });
                }}
                className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-400"
              >
                <Plus className="w-4 h-4 mx-auto" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-gray-100">
              {row.map((cell, ci) => (
                <td key={ci} className="border-r last:border-r-0 border-gray-100 p-2">
                  <input
                    value={cell}
                    onChange={(e) => {
                      const rows = block.rows.map((r) => [...r]);
                      rows[ri][ci] = e.target.value;
                      onUpdate({ rows });
                    }}
                    className="w-full bg-transparent outline-none text-sm text-gray-800"
                  />
                </td>
              ))}
              <td className="w-10 p-1">
                <button
                  onClick={() => {
                    const rows = block.rows.filter((_, i) => i !== ri);
                    onUpdate({ rows: rows.length ? rows : [block.headers.map(() => '')] });
                  }}
                  className="w-7 h-7 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={block.headers.length + 1} className="border-t border-gray-100 p-1">
              <button
                onClick={() => {
                  const rows = [...block.rows, block.headers.map(() => '')];
                  onUpdate({ rows });
                }}
                className="w-full text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md py-1.5 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   Cover picker modal
   ============================================================ */

function CoverPickerModal({
  current,
  onPick,
  onClose,
}: {
  current?: string;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [customUrl, setCustomUrl] = useState(current && !COVER_PRESETS.includes(current) ? current : '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
      alert('File size exceeds 1MB');
      return;
    }
    const r = new FileReader();
    r.onload = (ev) => onPick(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Choose a cover</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {COVER_PRESETS.map((url) => (
            <button
              key={url}
              onClick={() => onPick(url)}
              className={`h-24 rounded-lg bg-cover bg-center border-2 transition-colors ${
                current === url ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
              }`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste image URL…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            disabled={!customUrl.trim()}
            onClick={() => onPick(customUrl.trim())}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40"
          >
            Use
          </button>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full px-4 py-2 border border-dashed border-gray-300 text-sm text-gray-600 rounded-md hover:border-blue-400 hover:text-blue-600"
        >
          Or upload from your device (max 1MB)
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

/* ============================================================
   Utilities
   ============================================================ */

function placeCursor(el: HTMLElement, pos: 'start' | 'end') {
  el.focus();
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;
  range.selectNodeContents(el);
  range.collapse(pos === 'start');
  sel.removeAllRanges();
  sel.addRange(range);
}

function placeCursorAtEnd(el: HTMLElement) {
  placeCursor(el, 'end');
}

function isAtStartOfNode(_el: HTMLElement, sel: Selection): boolean {
  if (!sel.anchorNode) return false;
  // If selection is at the very first text/node position
  return sel.anchorOffset === 0;
}

function getCaretRect(fallbackEl: HTMLElement): AnchorPos {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0).cloneRange();
    const rect = range.getBoundingClientRect();
    if (rect && rect.width + rect.height > 0) {
      return { top: rect.bottom + 6, left: rect.left };
    }
  }
  const r = fallbackEl.getBoundingClientRect();
  return { top: r.bottom + 6, left: r.left };
}
