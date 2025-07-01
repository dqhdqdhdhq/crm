import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Bold, 
  Italic, 
  Underline,
  Type,
  Image,
  File,
  Calendar,
  Table,
  List,
  Quote,
  Minus,
  Code,
  Upload,
  GripVertical,
  Copy,
  MoreHorizontal,
  Smile,
  Hash,
  AlignLeft
} from 'lucide-react';
import { Page, Block, BlockType } from '../types';

interface NotionPageProps {
  page: Page;
  onUpdatePage: (page: Page) => void;
  onBack: () => void;
}

export function NotionPage({ page, onUpdatePage, onBack }: NotionPageProps) {
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [showInsertMenu, setShowInsertMenu] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [hoveredGap, setHoveredGap] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePage = (updates: Partial<Page>) => {
    onUpdatePage({
      ...page,
      ...updates,
      updatedAt: new Date()
    });
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = page.blocks.map(block =>
      block.id === blockId 
        ? { ...block, ...updates, updatedAt: new Date() }
        : block
    );
    updatePage({ blocks: updatedBlocks });
  };

  const addBlock = (afterBlockId: string | null, type: BlockType) => {
    const newBlock = createNewBlock(type);
    const afterIndex = afterBlockId 
      ? page.blocks.findIndex(b => b.id === afterBlockId)
      : -1;
    
    const updatedBlocks = [...page.blocks];
    updatedBlocks.splice(afterIndex + 1, 0, newBlock);
    updatePage({ blocks: updatedBlocks });
    setShowBlockMenu(null);
    setShowInsertMenu(null);
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = page.blocks.filter(block => block.id !== blockId);
    updatePage({ blocks: updatedBlocks });
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = page.blocks.find(b => b.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    const updatedBlocks = [...page.blocks];
    updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
    updatePage({ blocks: updatedBlocks });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...page.blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);
    updatePage({ blocks: updatedBlocks });
  };

  const createNewBlock = (type: BlockType): Block => {
    const baseBlock = {
      id: crypto.randomUUID(),
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (type) {
      case 'text':
        return { ...baseBlock, type: 'text', content: '' };
      case 'heading':
        return { ...baseBlock, type: 'heading', content: '', level: 1 };
      case 'image':
        return { ...baseBlock, type: 'image', url: '', caption: '' };
      case 'file':
        return { ...baseBlock, type: 'file', url: '', fileName: '' };
      case 'date':
        return { ...baseBlock, type: 'date', date: new Date() };
      case 'table':
        return { ...baseBlock, type: 'table', headers: ['Column 1', 'Column 2'], rows: [['', '']] };
      case 'list':
        return { ...baseBlock, type: 'list', items: [''], ordered: false };
      case 'quote':
        return { ...baseBlock, type: 'quote', content: '' };
      case 'divider':
        return { ...baseBlock, type: 'divider' };
      case 'code':
        return { ...baseBlock, type: 'code', content: '', language: 'javascript' };
      default:
        return { ...baseBlock, type: 'text', content: '' };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, blockId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size limit (1MB = 1024 * 1024 bytes)
    const maxFileSize = 1024 * 1024; // 1MB
    if (file.size > maxFileSize) {
      alert(`File size exceeds 1MB limit. Please choose a smaller file. Current file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      // Clear the input
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (blockId) {
        if (file.type.startsWith('image/')) {
          updateBlock(blockId, { url: result, caption: file.name });
        } else {
          updateBlock(blockId, { url: result, fileName: file.name, fileSize: file.size, fileType: file.type });
        }
      } else {
        const newBlock = file.type.startsWith('image/')
          ? createNewBlock('image')
          : createNewBlock('file');
        
        if (file.type.startsWith('image/')) {
          newBlock.url = result;
          newBlock.caption = file.name;
        } else {
          newBlock.url = result;
          newBlock.fileName = file.name;
          newBlock.fileSize = file.size;
          newBlock.fileType = file.type;
        }
        
        updatePage({ blocks: [...page.blocks, newBlock] });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const fromIndex = page.blocks.findIndex(b => b.id === draggedBlock);
    const toIndex = page.blocks.findIndex(b => b.id === targetBlockId);
    
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      moveBlock(fromIndex, toIndex);
    }
    
    setDraggedBlock(null);
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Clean Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Back to Pages</span>
            </button>
            
            <div className="text-sm text-gray-500">
              Last edited {new Date(page.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <button className="text-4xl hover:bg-gray-50 rounded-lg p-2 transition-colors">
              {page.emoji || '📄'}
            </button>
            <input
              type="text"
              value={page.title}
              onChange={(e) => updatePage({ title: e.target.value })}
              className="text-5xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1 placeholder-gray-400"
              placeholder="Untitled"
            />
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-2">
          {page.blocks.map((block, index) => (
            <div key={block.id}>
              {/* Insert Block Gap */}
              <div
                className="relative group"
                onMouseEnter={() => setHoveredGap(`before-${block.id}`)}
                onMouseLeave={() => setHoveredGap(null)}
              >
                {hoveredGap === `before-${block.id}` && (
                  <div className="absolute inset-x-0 -top-3 h-6 flex items-center justify-center">
                    <button
                      onClick={() => setShowInsertMenu(`before-${block.id}`)}
                      className="w-8 h-8 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
                
                {/* Insert Menu */}
                {showInsertMenu === `before-${block.id}` && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-3 z-20">
                    <BlockInsertMenu
                      onAddBlock={(type) => addBlock(index > 0 ? page.blocks[index - 1].id : null, type)}
                      onClose={() => setShowInsertMenu(null)}
                    />
                  </div>
                )}
              </div>

              <BlockRenderer
                block={block}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
                onAddBlock={(type) => addBlock(block.id, type)}
                onFileUpload={(e) => handleFileUpload(e, block.id)}
                showMenu={showBlockMenu === block.id}
                onToggleMenu={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, block.id)}
                isDragging={draggedBlock === block.id}
              />
            </div>
          ))}

          {/* Final Insert Gap */}
          <div
            className="relative group py-8"
            onMouseEnter={() => setHoveredGap('end')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            {(hoveredGap === 'end' || page.blocks.length === 0) && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowInsertMenu('end')}
                  className="w-8 h-8 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            
            {showInsertMenu === 'end' && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-8 z-20">
                <BlockInsertMenu
                  onAddBlock={(type) => addBlock(page.blocks[page.blocks.length - 1]?.id || null, type)}
                  onClose={() => setShowInsertMenu(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {page.blocks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Type className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start writing</h3>
            <p className="text-gray-600 mb-8">Click the + button above to add your first block</p>
            <button
              onClick={() => addBlock(null, 'text')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Add Text Block
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

interface BlockInsertMenuProps {
  onAddBlock: (type: BlockType) => void;
  onClose: () => void;
}

function BlockInsertMenu({ onAddBlock, onClose }: BlockInsertMenuProps) {
  const blockMenuItems = [
    { type: 'text' as BlockType, icon: AlignLeft, label: 'Text', description: 'Start writing with plain text', category: 'Basic' },
    { type: 'heading' as BlockType, icon: Hash, label: 'Heading', description: 'Big section heading', category: 'Basic' },
    { type: 'list' as BlockType, icon: List, label: 'List', description: 'Create a bulleted or numbered list', category: 'Basic' },
    { type: 'quote' as BlockType, icon: Quote, label: 'Quote', description: 'Capture a quote or callout', category: 'Basic' },
    { type: 'divider' as BlockType, icon: Minus, label: 'Divider', description: 'Visually divide blocks', category: 'Basic' },
    { type: 'table' as BlockType, icon: Table, label: 'Table', description: 'Add a table with rows and columns', category: 'Advanced' },
    { type: 'code' as BlockType, icon: Code, label: 'Code', description: 'Capture a code snippet', category: 'Advanced' },
    { type: 'image' as BlockType, icon: Image, label: 'Image', description: 'Upload or embed an image', category: 'Media' },
    { type: 'file' as BlockType, icon: File, label: 'File', description: 'Upload a file', category: 'Media' },
    { type: 'date' as BlockType, icon: Calendar, label: 'Date', description: 'Add a date', category: 'Advanced' },
  ];

  const categories = ['Basic', 'Advanced', 'Media'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.block-insert-menu')) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="block-insert-menu bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[320px] max-h-96 overflow-y-auto">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
        Add a block
      </div>
      
      {categories.map(category => (
        <div key={category} className="mb-4 last:mb-0">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
            {category}
          </div>
          <div className="space-y-1">
            {blockMenuItems
              .filter(item => item.category === category)
              .map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddBlock(item.type)}
                  className="w-full flex items-start space-x-3 p-3 text-left hover:bg-gray-50 rounded-xl text-sm transition-colors group"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{item.description}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface BlockRendererProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBlock: (type: BlockType) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showMenu: boolean;
  onToggleMenu: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
}

function BlockRenderer({ 
  block, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onAddBlock, 
  onFileUpload,
  showMenu,
  onToggleMenu,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: BlockRendererProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowTextToolbar(true);
    } else {
      setShowTextToolbar(false);
    }
  };

  const applyTextFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (textRef.current) {
      onUpdate({ content: textRef.current.innerHTML });
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="relative">
            <div
              ref={textRef}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: block.content || '' }}
              onInput={(e) => {
                const target = e.target as HTMLDivElement;
                onUpdate({ content: target.innerHTML });
              }}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              onBlur={() => setShowTextToolbar(false)}
              className="w-full bg-transparent border-none outline-none text-gray-900 leading-relaxed min-h-[28px] focus:ring-0 text-base"
              placeholder="Type something..."
              style={{ wordBreak: 'break-word' }}
            />
            
            {/* Rich Text Toolbar */}
            {showTextToolbar && selectedText && (
              <div className="absolute top-0 left-0 transform -translate-y-full bg-gray-900 text-white rounded-lg shadow-xl p-1 flex items-center space-x-1 z-10">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyTextFormat('bold');
                  }}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyTextFormat('italic');
                  }}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <Italic className="w-3 h-3" />
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyTextFormat('underline');
                  }}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <Underline className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );

      case 'heading':
        const headingClasses = {
          1: 'text-3xl font-bold',
          2: 'text-2xl font-semibold',
          3: 'text-xl font-medium'
        };
        
        return (
          <div className="flex items-center space-x-3">
            <select
              value={block.level}
              onChange={(e) => onUpdate({ level: parseInt(e.target.value) as 1 | 2 | 3 })}
              className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Heading"
              className={`flex-1 bg-transparent border-none outline-none text-gray-900 ${headingClasses[block.level]} placeholder-gray-400`}
            />
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  {block.headers.map((header, index) => (
                    <th key={index} className="border-r border-gray-200 p-4 text-left relative group last:border-r-0">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => {
                          const newHeaders = [...block.headers];
                          newHeaders[index] = e.target.value;
                          onUpdate({ headers: newHeaders });
                        }}
                        className="w-full bg-transparent border-none outline-none font-semibold text-gray-900 placeholder-gray-400"
                        placeholder="Header"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => {
                            const newHeaders = [...block.headers];
                            const newRows = block.rows.map(row => {
                              const newRow = [...row];
                              newRow.splice(index + 1, 0, '');
                              return newRow;
                            });
                            newHeaders.splice(index + 1, 0, 'New Column');
                            onUpdate({ headers: newHeaders, rows: newRows });
                          }}
                          className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          title="Add column"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {block.headers.length > 1 && (
                          <button
                            onClick={() => {
                              const newHeaders = block.headers.filter((_, i) => i !== index);
                              const newRows = block.rows.map(row => row.filter((_, i) => i !== index));
                              onUpdate({ headers: newHeaders, rows: newRows });
                            }}
                            className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-red-50 hover:border-red-300 text-red-600 transition-colors"
                            title="Delete column"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-16 p-4">
                    <button
                      onClick={() => {
                        const newHeaders = [...block.headers, 'New Column'];
                        const newRows = block.rows.map(row => [...row, '']);
                        onUpdate({ headers: newHeaders, rows: newRows });
                      }}
                      className="w-8 h-8 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                      title="Add column"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group hover:bg-gray-50/50 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border-r border-b border-gray-200 p-4 last:border-r-0">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...block.rows];
                            newRows[rowIndex][cellIndex] = e.target.value;
                            onUpdate({ rows: newRows });
                          }}
                          className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                          placeholder="Cell"
                        />
                      </td>
                    ))}
                    <td className="border-b border-gray-200 p-4 w-16">
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const newRow = new Array(block.headers.length).fill('');
                            const newRows = [...block.rows];
                            newRows.splice(rowIndex + 1, 0, newRow);
                            onUpdate({ rows: newRows });
                          }}
                          className="w-6 h-6 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                          title="Add row below"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {block.rows.length > 1 && (
                          <button
                            onClick={() => {
                              const newRows = block.rows.filter((_, index) => index !== rowIndex);
                              onUpdate({ rows: newRows });
                            }}
                            className="w-6 h-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={block.headers.length + 1} className="border-b border-gray-200 p-4 text-center">
                    <button
                      onClick={() => {
                        const newRow = new Array(block.headers.length).fill('');
                        onUpdate({ rows: [...block.rows, newRow] });
                      }}
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-sm mx-auto transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add row</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="relative group">
                <img 
                  src={block.url} 
                  alt={block.caption || ''} 
                  className="max-w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-3" />
                  <span className="font-medium">Click to upload image</span>
                  <div className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 1MB</div>
                </div>
              </button>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Add a caption..."
              className="w-full text-sm text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{block.fileName}</div>
                  {block.fileSize && (
                    <div className="text-sm text-gray-500">
                      {(block.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
                <a
                  href={block.url}
                  download={block.fileName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Download
                </a>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <div className="text-center">
                  <File className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Click to upload file (max 1MB)</span>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileUpload}
              className="hidden"
            />
          </div>
        );

      case 'date':
        return (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={block.label || ''}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Date label"
              className="bg-transparent border-none outline-none text-gray-900 font-medium placeholder-gray-400"
            />
            <input
              type={block.includeTime ? 'datetime-local' : 'date'}
              value={block.includeTime 
                ? new Date(block.date).toISOString().slice(0, 16)
                : new Date(block.date).toISOString().slice(0, 10)
              }
              onChange={(e) => onUpdate({ date: new Date(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={block.includeTime || false}
                onChange={(e) => onUpdate({ includeTime: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Include time</span>
            </label>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <button
                onClick={() => onUpdate({ ordered: !block.ordered })}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  block.ordered 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {block.ordered ? 'Numbered' : 'Bulleted'}
              </button>
            </div>
            {block.items.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-gray-500 mt-1 min-w-[24px] font-medium">
                  {block.ordered ? `${index + 1}.` : '•'}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[index] = e.target.value;
                    onUpdate({ items: newItems });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newItems = [...block.items];
                      newItems.splice(index + 1, 0, '');
                      onUpdate({ items: newItems });
                    } else if (e.key === 'Backspace' && item === '' && block.items.length > 1) {
                      const newItems = block.items.filter((_, i) => i !== index);
                      onUpdate({ items: newItems });
                    }
                  }}
                  placeholder="List item"
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                />
                {block.items.length > 1 && (
                  <button
                    onClick={() => {
                      const newItems = block.items.filter((_, i) => i !== index);
                      onUpdate({ items: newItems });
                    }}
                    className="text-gray-400 hover:text-red-600 mt-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-blue-400 pl-6 py-3 bg-blue-50/50 rounded-r-xl">
            <textarea
              value={block.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Quote text..."
              className="w-full bg-transparent border-none outline-none resize-none text-gray-700 italic text-lg leading-relaxed placeholder-gray-400"
              rows={Math.max(1, (block.content || '').split('\n').length)}
            />
            <input
              type="text"
              value={block.author || ''}
              onChange={(e) => onUpdate({ author: e.target.value })}
              placeholder="Author (optional)"
              className="w-full bg-transparent border-none outline-none text-gray-500 text-sm mt-3 placeholder-gray-400"
            />
          </div>
        );

      case 'divider':
        return (
          <div className="py-6">
            <hr className="border-gray-300" />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <select
                value={block.language || 'javascript'}
                onChange={(e) => onUpdate({ language: e.target.value })}
                className="text-sm bg-gray-800 text-gray-300 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <textarea
              value={block.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter your code..."
              className="w-full bg-gray-900 text-green-400 border border-gray-700 rounded-xl p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              rows={Math.max(3, (block.content || '').split('\n').length)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative ${isDragging ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Block Controls */}
      {isHovered && (
        <div className="absolute left-0 top-0 flex items-center space-x-1 -ml-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMenu}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Block Content */}
      <div className="py-2">
        {renderBlockContent()}
      </div>

      {/* Block Options Menu */}
      {showMenu && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-2 min-w-[180px]">
          <button
            onClick={() => {
              onDuplicate();
              onToggleMenu();
            }}
            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-500" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => {
              onDelete();
              onToggleMenu();
            }}
            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg text-sm text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}