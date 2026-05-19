import {
  AlignLeft,
  Hash,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Lightbulb,
  Quote,
  Minus,
  Code,
  Table as TableIcon,
  Image as ImageIcon,
  File as FileIcon,
  Calendar,
  Link2,
  FilePlus,
} from 'lucide-react';
import { Block, BlockType } from '../../types';

export type SlashItemKind =
  | BlockType
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subpage';

export interface SlashItem {
  kind: SlashItemKind;
  label: string;
  description: string;
  icon: typeof Hash;
  keywords: string[];
  group: 'Basics' | 'Lists' | 'Media' | 'Advanced' | 'Pages';
}

export const SLASH_ITEMS: SlashItem[] = [
  { kind: 'text', label: 'Text', description: 'Plain paragraph', icon: AlignLeft, keywords: ['text', 'paragraph', 'p'], group: 'Basics' },
  { kind: 'h1', label: 'Heading 1', description: 'Big section title', icon: Hash, keywords: ['h1', 'heading', 'title'], group: 'Basics' },
  { kind: 'h2', label: 'Heading 2', description: 'Medium section title', icon: Heading2, keywords: ['h2', 'heading', 'subtitle'], group: 'Basics' },
  { kind: 'h3', label: 'Heading 3', description: 'Small section title', icon: Heading3, keywords: ['h3', 'heading'], group: 'Basics' },
  { kind: 'bullet', label: 'Bulleted list', description: 'Simple bullet point', icon: ListIcon, keywords: ['bullet', 'list', 'ul', '-'], group: 'Lists' },
  { kind: 'numbered', label: 'Numbered list', description: 'Ordered list item', icon: ListOrdered, keywords: ['number', 'ordered', 'ol', '1.'], group: 'Lists' },
  { kind: 'todo', label: 'To-do', description: 'Checkbox you can tick', icon: CheckSquare, keywords: ['todo', 'check', 'task', '[]'], group: 'Lists' },
  { kind: 'toggle', label: 'Toggle', description: 'Collapsible block', icon: ChevronRight, keywords: ['toggle', 'fold', 'collapse'], group: 'Lists' },
  { kind: 'callout', label: 'Callout', description: 'Highlighted note', icon: Lightbulb, keywords: ['callout', 'note', 'info'], group: 'Advanced' },
  { kind: 'quote', label: 'Quote', description: 'Indented quoted text', icon: Quote, keywords: ['quote', 'blockquote'], group: 'Advanced' },
  { kind: 'divider', label: 'Divider', description: 'Horizontal line', icon: Minus, keywords: ['divider', 'hr', '---'], group: 'Advanced' },
  { kind: 'code', label: 'Code', description: 'Code snippet', icon: Code, keywords: ['code', 'snippet'], group: 'Advanced' },
  { kind: 'table', label: 'Table', description: 'Simple table', icon: TableIcon, keywords: ['table', 'grid'], group: 'Advanced' },
  { kind: 'date', label: 'Date', description: 'Pick a date', icon: Calendar, keywords: ['date', 'time'], group: 'Advanced' },
  { kind: 'image', label: 'Image', description: 'Upload an image', icon: ImageIcon, keywords: ['image', 'photo', 'picture'], group: 'Media' },
  { kind: 'file', label: 'File', description: 'Upload a file', icon: FileIcon, keywords: ['file', 'attachment', 'upload'], group: 'Media' },
  { kind: 'subpage', label: 'Sub-page', description: 'Add a nested page', icon: FilePlus, keywords: ['page', 'subpage', 'nested'], group: 'Pages' },
];

export function filterSlashItems(query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}

export function createBlock(kind: SlashItemKind): Block {
  const base = {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  switch (kind) {
    case 'text':
      return { ...base, type: 'text', content: '' };
    case 'h1':
      return { ...base, type: 'heading', content: '', level: 1 };
    case 'h2':
      return { ...base, type: 'heading', content: '', level: 2 };
    case 'h3':
      return { ...base, type: 'heading', content: '', level: 3 };
    case 'heading':
      return { ...base, type: 'heading', content: '', level: 1 };
    case 'bullet':
      return { ...base, type: 'bullet', content: '' };
    case 'numbered':
      return { ...base, type: 'numbered', content: '' };
    case 'todo':
      return { ...base, type: 'todo', content: '', checked: false };
    case 'toggle':
      return { ...base, type: 'toggle', content: '', open: true };
    case 'callout':
      return { ...base, type: 'callout', content: '', emoji: '💡', color: 'blue' };
    case 'quote':
      return { ...base, type: 'quote', content: '' };
    case 'divider':
      return { ...base, type: 'divider' };
    case 'code':
      return { ...base, type: 'code', content: '', language: 'javascript' };
    case 'table':
      return { ...base, type: 'table', headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'image':
      return { ...base, type: 'image', url: '', caption: '' };
    case 'file':
      return { ...base, type: 'file', url: '', fileName: '' };
    case 'date':
      return { ...base, type: 'date', date: new Date() };
    case 'list':
      return { ...base, type: 'list', items: [''], ordered: false };
    case 'sticky':
      return { ...base, type: 'sticky', content: '', color: 'yellow' };
    case 'shape':
      return { ...base, type: 'shape', shape: 'rect', content: '', color: 'white' };
    case 'arrow':
      return { ...base, type: 'arrow', style: 'solid' };
    case 'subpage':
      // Handled by caller (creates a real Page and inserts a pageLink-style block).
      // Fallback to a text placeholder if used directly.
      return { ...base, type: 'text', content: '' };
    default:
      return { ...base, type: 'text', content: '' };
  }
}

/**
 * Convert a block into another type, preserving its `content` field where it makes sense.
 * Used by slash menu transforms and markdown shortcuts.
 */
export function convertBlock(block: Block, kind: SlashItemKind, contentOverride?: string): Block {
  const content =
    contentOverride !== undefined
      ? contentOverride
      : 'content' in block
        ? ((block as any).content as string) || ''
        : '';
  const fresh = createBlock(kind);
  const withContent: any = { ...fresh, id: block.id, createdAt: block.createdAt, updatedAt: new Date() };
  if ('content' in withContent) withContent.content = content;
  return withContent;
}

/**
 * Is this block one that uses a plain-text contentEditable area?
 * (Excludes images, files, divider, table, date, code — they have custom UI.)
 */
export function isInlineTextBlock(block: Block): boolean {
  return (
    block.type === 'text' ||
    block.type === 'heading' ||
    block.type === 'bullet' ||
    block.type === 'numbered' ||
    block.type === 'todo' ||
    block.type === 'toggle' ||
    block.type === 'callout' ||
    block.type === 'quote'
  );
}

/**
 * Markdown shortcuts: detect a prefix like `# ` and return the new block kind + remaining content.
 * Returns null if no shortcut matches.
 */
export function detectMarkdownShortcut(
  rawText: string,
): { kind: SlashItemKind; rest: string } | null {
  // Patterns are checked in order — longest prefixes first.
  const patterns: { regex: RegExp; kind: SlashItemKind }[] = [
    { regex: /^###\s(.*)$/, kind: 'h3' },
    { regex: /^##\s(.*)$/, kind: 'h2' },
    { regex: /^#\s(.*)$/, kind: 'h1' },
    { regex: /^[-*]\s(.*)$/, kind: 'bullet' },
    { regex: /^1\.\s(.*)$/, kind: 'numbered' },
    { regex: /^\[\]\s(.*)$/, kind: 'todo' },
    { regex: /^\[\s\]\s(.*)$/, kind: 'todo' },
    { regex: /^>\s(.*)$/, kind: 'quote' },
    { regex: /^"\s(.*)$/, kind: 'callout' },
    { regex: /^```\s?(.*)$/, kind: 'code' },
    { regex: /^---\s*$/, kind: 'divider' },
  ];
  for (const { regex, kind } of patterns) {
    const m = rawText.match(regex);
    if (m) return { kind, rest: m[1] ?? '' };
  }
  return null;
}
