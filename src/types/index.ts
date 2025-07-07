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

// Custom Fields System
export interface CustomField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  options?: string[]; // For select type
  required?: boolean;
  defaultValue?: any;
  createdAt: Date;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
}

// Activity Timeline
export interface TimelineEntry {
  id: string;
  type: 'created' | 'updated' | 'activity' | 'milestone' | 'document' | 'note' | 'payment' | 'status_change' | 'custom_field';
  timestamp: Date;
  description: string;
  details?: any;
  userId?: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
}

// Color Coding and Tags
export interface PartnerTag {
  id: string;
  name: string;
  color: string;
  textColor?: string;
  createdAt: Date;
}

// Saved Filters and Views
export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status?: string[];
    dealType?: string[];
    tags?: string[];
    customFields?: { fieldId: string; value: any }[];
    search?: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  createdAt: Date;
}

// History and Undo
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'bulk_action';
  entityType: 'partner' | 'partners';
  entityId: string | string[];
  previousState?: any;
  newState?: any;
  description: string;
}

// Enhanced Partner types
export interface DealTerms {
  equityPercentage?: number;
  revSharePercentage?: number;
  monthlyFee?: number;
  vestingPeriodMonths?: number;
  customTerms?: string;
}

export interface ActivityEntry {
  id: string;
  type: 'call' | 'meeting' | 'payment' | 'email' | 'contract' | 'other';
  date: Date;
  description: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  completedDate?: Date;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'proposal' | 'report' | 'other';
  filePath: string;
  uploadDate: Date;
  size?: number;
}

export interface PerformanceFlags {
  reviewNeeded: boolean;
  highRisk: boolean;
  paymentIssues: boolean;
  communicationGap: boolean;
}

// Per-Field Change History
export interface FieldChange {
  id: string;
  fieldPath: string; // e.g., "name", "primaryContact.email", "customFields.1.value"
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId?: string;
  userName?: string;
  changeType: 'create' | 'update' | 'delete';
  reason?: string;
}

export interface FieldHistory {
  fieldPath: string;
  changes: FieldChange[];
  currentValue: any;
}

// Relationship Mapping
export interface Relationship {
  id: string;
  fromEntityType: 'partner' | 'prospect' | 'project' | 'contact';
  fromEntityId: string;
  toEntityType: 'partner' | 'prospect' | 'project' | 'contact';
  toEntityId: string;
  relationshipType: 'parent' | 'child' | 'sibling' | 'vendor' | 'client' | 'referral' | 'competitor' | 'custom';
  strength: 'weak' | 'medium' | 'strong';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkNode {
  id: string;
  type: 'partner' | 'prospect' | 'project' | 'contact';
  name: string;
  data: any;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  strength: number;
}

// Embedded Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'meeting' | 'task' | 'payment' | 'milestone' | 'review' | 'custom';
  partnerId?: string;
  attendees: string[];
  location?: string;
  reminders: { minutes: number; type: 'email' | 'notification' }[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    count?: number;
  };
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Markdown Editor
export interface MarkdownContent {
  id: string;
  content: string;
  renderedHtml: string;
  lastEditedAt: Date;
  version: number;
  checklistItems?: { id: string; text: string; completed: boolean }[];
}

// Document Annotation
export interface DocumentAnnotation {
  id: string;
  documentId: string;
  type: 'highlight' | 'comment' | 'tag' | 'drawing';
  page: number;
  position: { x: number; y: number; width?: number; height?: number };
  content: string;
  color: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  replies?: DocumentAnnotation[];
}

export interface AnnotatedDocument extends Document {
  annotations: DocumentAnnotation[];
  totalAnnotations: number;
}

// Calculated Fields
export interface CalculatedField extends CustomField {
  formula: string;
  dependencies: string[]; // Field paths this formula depends on
  calculationType: 'sum' | 'average' | 'count' | 'custom';
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  lastCalculated: Date;
}

// Bulk Operations
export interface BulkTemplate {
  id: string;
  name: string;
  type: 'import' | 'export';
  format: 'csv' | 'json' | 'xlsx';
  fieldMappings: { sourceField: string; targetField: string }[];
  transformations: { field: string; operation: string; value?: any }[];
  validationRules: { field: string; rule: string; message: string }[];
  createdAt: Date;
}

export interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'update' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: { row: number; field: string; message: string }[];
  startedAt: Date;
  completedAt?: Date;
  result?: any;
}

// Audit Trail
export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  fieldChanges: FieldChange[];
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface AuditReport {
  id: string;
  entityId: string;
  entityType: string;
  dateRange: { start: Date; end: Date };
  entries: AuditEntry[];
  summary: {
    totalChanges: number;
    fieldChangeCounts: { [field: string]: number };
    userActivity: { [userId: string]: number };
    actionCounts: { [action: string]: number };
  };
  generatedAt: Date;
}

// Global Search
export interface SearchIndex {
  id: string;
  entityType: string;
  entityId: string;
  content: string;
  fieldPath: string;
  searchableText: string;
  lastIndexed: Date;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  fieldPath: string;
  matchedText: string;
  context: string;
  relevanceScore: number;
  highlights: { start: number; end: number }[];
}

export interface SearchQuery {
  query: string;
  entityTypes?: string[];
  fieldPaths?: string[];
  dateRange?: { start: Date; end: Date };
  filters?: { [key: string]: any };
  sortBy?: 'relevance' | 'date' | 'entity';
  limit?: number;
}

// Auto-Generated Reports
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'partner_summary' | 'activity_report' | 'revenue_analysis' | 'custom';
  sections: ReportSection[];
  styling: {
    theme: 'professional' | 'modern' | 'minimal';
    colors: string[];
    fonts: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  type: 'header' | 'stats' | 'table' | 'chart' | 'timeline' | 'text' | 'image';
  title: string;
  content: any;
  config: any;
  order: number;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  entityId: string;
  entityType: string;
  generatedAt: Date;
  format: 'html' | 'pdf' | 'docx';
  content: string;
  metadata: any;
}

// Role-Based Permissions
export interface Permission {
  id: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  conditions?: { [key: string]: any };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Command Palette
export interface Command {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'action' | 'filter' | 'create' | 'edit' | 'search';
  keywords: string[];
  shortcut?: string[];
  icon?: string;
  action: () => void | Promise<void>;
  isEnabled: () => boolean;
  params?: { name: string; type: string; required: boolean }[];
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  filteredCommands: Command[];
  recentCommands: string[];
  favoriteCommands: string[];
}

// Hotkey Customization
export interface HotkeyBinding {
  id: string;
  commandId: string;
  keys: string[];
  description: string;
  isCustom: boolean;
  isEnabled: boolean;
  context?: 'global' | 'partner-list' | 'partner-detail' | 'modal';
}

export interface HotkeyProfile {
  id: string;
  name: string;
  bindings: HotkeyBinding[];
  isActive: boolean;
  createdAt: Date;
}

// Offline Mode & Conflict Resolution
export interface OfflineChange {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  deviceId: string;
  synced: boolean;
}

export interface ConflictResolution {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  resolvedValue?: any;
  resolvedAt?: Date;
}

// Mass Find/Replace
export interface FindReplaceOperation {
  id: string;
  searchPattern: string;
  replacePattern: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  scope: {
    entityTypes: string[];
    fieldPaths: string[];
    entityIds?: string[];
  };
  preview: FindReplaceMatch[];
  executed: boolean;
  executedAt?: Date;
  affectedCount: number;
}

export interface FindReplaceMatch {
  entityType: string;
  entityId: string;
  entityName: string;
  fieldPath: string;
  originalText: string;
  newText: string;
  position: { start: number; end: number };
}

// Enhanced Partner types with new features
export interface Partner {
  id: string;
  name: string;
  dealType: 'equity' | 'rev-share' | 'flat-fee' | 'other';
  dealTerms: DealTerms;
  status: 'active' | 'pending' | 'paused' | 'ended';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  };
  notes: MarkdownContent;
  monthlyRevenue: number;
  totalRevenue: number;
  activityLog: ActivityEntry[];
  milestones: Milestone[];
  documents: AnnotatedDocument[];
  performanceFlags: PerformanceFlags;
  
  // Enhanced features
  customFields: CustomFieldValue[];
  calculatedFields: { [fieldId: string]: any };
  timeline: TimelineEntry[];
  fieldHistory: { [fieldPath: string]: FieldHistory };
  tags: string[];
  color?: string;
  isPinned: boolean;
  sortOrder: number;
  relationships: string[]; // Relationship IDs
  calendarEvents: string[]; // CalendarEvent IDs
  permissions: { [userId: string]: Permission[] };
  
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  version: number;
}

// Global App State with enhanced features
export interface AppState {
  partners: Partner[];
  customFields: CustomField[];
  calculatedFields: CalculatedField[];
  tags: PartnerTag[];
  savedFilters: SavedFilter[];
  history: HistoryEntry[];
  relationships: Relationship[];
  calendarEvents: CalendarEvent[];
  auditTrail: AuditEntry[];
  searchIndex: SearchIndex[];
  reportTemplates: ReportTemplate[];
  users: User[];
  roles: Role[];
  commands: Command[];
  hotkeyProfiles: HotkeyProfile[];
  bulkTemplates: BulkTemplate[];
  offlineChanges: OfflineChange[];
  
  settings: {
    defaultView: 'cards' | 'detail';
    autoSave: boolean;
    showTimeline: boolean;
    compactMode: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    currencyFormat: string;
    enableOfflineMode: boolean;
    syncInterval: number;
    maxHistoryEntries: number;
    enableAuditTrail: boolean;
    enableRealTimeCalculations: boolean;
    defaultReportTemplate: string;
    enableGlobalSearch: boolean;
    searchIndexingInterval: number;
  };
  
  ui: {
    commandPalette: CommandPaletteState;
    activeHotkeyProfile: string;
    currentUser: string;
    lastSyncAt?: Date;
    isOffline: boolean;
    pendingConflicts: ConflictResolution[];
  };
}

// Bulk Actions
export interface BulkAction {
  type: 'delete' | 'update_status' | 'add_tag' | 'remove_tag' | 'update_flags' | 'export';
  payload?: any;
}

// Export Options
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  includeFields: string[];
  filterOptions?: SavedFilter;
  includeTimeline?: boolean;
  includeDocuments?: boolean;
}