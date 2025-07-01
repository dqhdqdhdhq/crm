export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  description?: string;
  dueDate?: Date;
  dueTime?: string;
  timeEstimate?: number;
  tags?: string[];
  categoryId?: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'blocked' | 'done';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  createdAt: Date;
}

export interface DateReminder {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // actual time worked in seconds
  targetDuration: number; // initial duration set in seconds
  status: 'running' | 'paused' | 'completed';
  pausedTime?: number; // total time paused in seconds
}

export interface TimerHistoryEntry {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startTime: Date;
  endTime: Date;
  actualDuration: number; // in seconds
  targetDuration: number; // in seconds
  completionRate: number; // percentage
}

export interface TaskTemplate {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timeEstimate: number;
  tags: string[];
}

// Notion-like page types
export type BlockType = 'text' | 'heading' | 'image' | 'file' | 'date' | 'table' | 'list' | 'quote' | 'divider' | 'code';

export interface BaseBlock {
  id: string;
  type: BlockType;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  alt?: string;
}

export interface FileBlock extends BaseBlock {
  type: 'file';
  url: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
}

export interface DateBlock extends BaseBlock {
  type: 'date';
  date: Date;
  label?: string;
  includeTime?: boolean;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  items: string[];
  ordered: boolean;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  author?: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  content: string;
  language?: string;
}

export type Block = TextBlock | HeadingBlock | ImageBlock | FileBlock | DateBlock | TableBlock | ListBlock | QuoteBlock | DividerBlock | CodeBlock;

export interface Page {
  id: string;
  title: string;
  emoji?: string;
  cover?: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  blocks: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface PageCategory {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

// Prospects CRM Types
export interface Industry {
  id: string;
  name: string;
  color: string;
  icon: string;
  prospectsCount: number;
  contactedCount: number;
  responseRate: number;
}

export interface Prospect {
  id: string;
  industryId: string;
  shopBusinessName: string;
  ownerName: string;
  location: string;
  googleMapsUrl: string;
  reviews: number;
  email: string;
  answered: 'yes' | 'no' | 'interested';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Screenshot {
  id: string;
  industryId: string;
  businessName: string;
  imageUrl: string;
  notes: string;
  sentMessage: string;
  createdAt: Date;
}

export type ContentItem = Task | Note | MediaItem | DateReminder | Page;

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ContentItem[];
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
  upcomingReminders: number;
}