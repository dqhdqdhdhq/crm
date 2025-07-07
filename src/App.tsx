import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TasksPage } from './components/TasksPage';
import { NotionPage } from './components/NotionPage';
import { PagesOverview } from './components/PagesOverview';
import { ProspectsPage } from './components/ProspectsPage';
import { PartnersPage } from './components/PartnersPage';
// import { TestPage } from './components/TestPage';
import { CalendarPage } from './components/CalendarPage';
import { Calculator } from './components/Calculator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Page, PageTemplate, PageCategory } from './types';
import { Calculator as CalculatorIcon } from 'lucide-react';

const defaultPageTemplates: PageTemplate[] = [
  {
    id: '1',
    name: 'Meeting Notes',
    emoji: '📝',
    description: 'Template for meeting notes with agenda and action items',
    blocks: [
      { type: 'heading', content: 'Meeting Notes', level: 1 } as any,
      { type: 'date', date: new Date(), label: 'Date' } as any,
      { type: 'heading', content: 'Attendees', level: 2 } as any,
      { type: 'list', items: [''], ordered: false } as any,
      { type: 'heading', content: 'Agenda', level: 2 } as any,
      { type: 'list', items: [''], ordered: true } as any,
      { type: 'heading', content: 'Action Items', level: 2 } as any,
      { type: 'table', headers: ['Task', 'Owner', 'Due Date'], rows: [['', '', '']] } as any
    ]
  },
  {
    id: '2',
    name: 'Project Plan',
    emoji: '🚀',
    description: 'Template for project planning and tracking',
    blocks: [
      { type: 'heading', content: 'Project Plan', level: 1 } as any,
      { type: 'heading', content: 'Overview', level: 2 } as any,
      { type: 'text', content: 'Project description and goals...' } as any,
      { type: 'heading', content: 'Timeline', level: 2 } as any,
      { type: 'table', headers: ['Phase', 'Start Date', 'End Date', 'Status'], rows: [['', '', '', '']] } as any,
      { type: 'heading', content: 'Resources', level: 2 } as any,
      { type: 'list', items: [''], ordered: false } as any
    ]
  },
  {
    id: '3',
    name: 'Daily Journal',
    emoji: '📔',
    description: 'Template for daily reflection and planning',
    blocks: [
      { type: 'heading', content: 'Daily Journal', level: 1 } as any,
      { type: 'date', date: new Date(), label: 'Date', includeTime: false } as any,
      { type: 'heading', content: 'Today\'s Goals', level: 2 } as any,
      { type: 'list', items: [''], ordered: false } as any,
      { type: 'heading', content: 'Reflections', level: 2 } as any,
      { type: 'text', content: 'What went well today?' } as any,
      { type: 'text', content: 'What could be improved?' } as any,
      { type: 'heading', content: 'Tomorrow\'s Priorities', level: 2 } as any,
      { type: 'list', items: [''], ordered: true } as any
    ]
  }
];

const defaultPageCategories: PageCategory[] = [
  { id: '1', name: 'Work', color: '#3B82F6', emoji: '💼' },
  { id: '2', name: 'Personal', color: '#10B981', emoji: '🏠' },
  { id: '3', name: 'Projects', color: '#8B5CF6', emoji: '🚀' },
  { id: '4', name: 'Learning', color: '#F59E0B', emoji: '📚' }
];

// Simplified default structure - everything under pages
const defaultPages: Page[] = [
  {
    id: 'sample-page-1',
    title: 'Welcome to Your Workspace',
    emoji: '👋',
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        content: 'Welcome to Your Workspace',
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'block-2',
        type: 'text',
        content: 'This is your unified workspace! Everything is now organized under Pages for a cleaner, more focused experience.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'block-3',
        type: 'heading',
        content: 'Features',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'block-4',
        type: 'list',
        items: [
          'Rich text editing with multiple block types',
          'Beautiful templates for quick starts',
          'Drag and drop organization',
          'File attachments and media support',
          'Global calculator tool'
        ],
        ordered: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cold-call-script-page',
    title: 'Cold Call Script',
    emoji: '📞',
    blocks: [
      {
        id: 'script-block-1',
        type: 'heading',
        content: 'Cold Call Opening',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'script-block-2',
        type: 'text',
        content: 'Hi [Prospect Name], this is [Your Name] from [Your Company]. Did I catch you at a bad time?',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'script-block-3',
        type: 'heading',
        content: 'Value Proposition',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'script-block-4',
        type: 'text',
        content: 'The reason I\'m calling is that we help companies like yours to [achieve X] by [doing Y].',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function App() {
  const [pages, setPages] = useLocalStorage<Page[]>('pages', defaultPages);
  const [pageTemplates, setPageTemplates] = useLocalStorage<PageTemplate[]>('pageTemplates', defaultPageTemplates);
  const [pageCategories, setPageCategories] = useLocalStorage<PageCategory[]>('pageCategories', defaultPageCategories);
  const [activeSection, setActiveSection] = useState<string>('tasks');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    setActiveSection('page');
  };

  const handleUpdatePage = (updatedPage: Page) => {
    setPages(pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
  };

  const handleDeletePage = (pageId: string) => {
    setPages(pages.filter(page => page.id !== pageId));
    
    // If the deleted page was currently active, go back to pages overview
    if (activePageId === pageId) {
      setActiveSection('pages');
      setActivePageId(null);
    }
  };

  const handleCreatePage = (templateId?: string) => {
    const template = templateId ? pageTemplates.find(t => t.id === templateId) : null;
    const newPage: Page = {
      id: crypto.randomUUID(),
      title: template ? template.name : 'Untitled Page',
      emoji: template ? template.emoji : '📄',
      blocks: template ? template.blocks.map((block) => ({
        ...(block as any), // Cast to any to bypass the strict template typing
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      })) : [
        {
          id: crypto.randomUUID(),
          type: 'heading',
          content: 'Untitled Page',
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId
    };

    setPages([...pages, newPage]);
    handleSelectPage(newPage.id);
  };

  const getCurrentPage = (): Page | null => {
    if (!activePageId) return null;
    return pages.find(page => page.id === activePageId) || null;
  };

  const renderMainContent = () => {
    if (activeSection === 'tasks') {
      return <TasksPage />;
    } else if (activeSection === 'pages') {
      return (
        <PagesOverview
          pages={pages}
          categories={[]} // Empty categories array
          templates={pageTemplates}
          pageCategories={pageCategories}
          onSelectPage={handleSelectPage}
          onCreatePage={handleCreatePage}
          onUpdateTemplates={setPageTemplates}
          onUpdatePageCategories={setPageCategories}
          onDeletePage={handleDeletePage}
          onUpdatePage={handleUpdatePage}
        />
      );
    } else if (activeSection === 'calendar') {
      return <CalendarPage />;
    } else if (activeSection === 'prospects') {
      return <ProspectsPage />;
    } else if (activeSection === 'partners') {
      return <PartnersPage />;
    } else if (activeSection === 'page' && activePageId) {
      const currentPage = getCurrentPage();
      if (currentPage) {
        return (
          <NotionPage
            page={currentPage}
            onUpdatePage={handleUpdatePage}
            onBack={() => setActiveSection('pages')}
          />
        );
      }
    }
    
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          <p className="text-lg text-gray-600 mb-8">This section is coming soon...</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex relative">
      <Sidebar
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        pages={pages}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderMainContent()}
        </div>
        
        {/* Global Calculator Button */}
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center z-30 border border-blue-500/20"
          title="Calculator"
        >
          <CalculatorIcon size={28} />
        </button>

        <Calculator
          isVisible={showCalculator}
          onClose={() => setShowCalculator(false)}
        />
      </main>
    </div>
  );
}

export default App;