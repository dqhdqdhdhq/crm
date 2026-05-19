import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TasksPage } from './components/TasksPage';
import { NotionPage } from './components/notion/NotionPage';
import { CommandPalette } from './components/notion/CommandPalette';
import { PagesOverview } from './components/PagesOverview';
import { ClientsPage } from './components/clients/ClientsPage';
import { SubscriptionModal } from './components/SubscriptionModal';
import { FocusTimer } from './components/FocusTimer';
import { GlobalFocusTimer } from './components/GlobalFocusTimer';
import { EnhancedCalendarPage } from './components/EnhancedCalendarPage';
import { Calculator } from './components/Calculator';
import { CommandCentre } from './components/commandCentre/CommandCentre';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Page, PageTemplate, PageCategory } from './types';
import { Calculator as CalculatorIcon, Timer, CreditCard } from 'lucide-react';

const defaultPageTemplates: PageTemplate[] = [
  {
    id: '1',
    name: 'Meeting Notes',
    emoji: '📝',
    description: 'Agenda, attendees, action items',
    blocks: [
      { type: 'heading', content: 'Meeting Notes', level: 1 } as any,
      { type: 'date', date: new Date(), label: 'Date' } as any,
      { type: 'heading', content: 'Attendees', level: 2 } as any,
      { type: 'bullet', content: '' } as any,
      { type: 'heading', content: 'Agenda', level: 2 } as any,
      { type: 'numbered', content: '' } as any,
      { type: 'heading', content: 'Action items', level: 2 } as any,
      { type: 'todo', content: '', checked: false } as any,
    ],
  },
  {
    id: '2',
    name: 'Project Plan',
    emoji: '🚀',
    description: 'Goals, timeline, resources',
    blocks: [
      { type: 'heading', content: 'Project Plan', level: 1 } as any,
      { type: 'callout', content: 'Goal: …', emoji: '🎯', color: 'blue' } as any,
      { type: 'heading', content: 'Timeline', level: 2 } as any,
      { type: 'table', headers: ['Phase', 'Start', 'End', 'Status'], rows: [['', '', '', '']] } as any,
      { type: 'heading', content: 'Resources', level: 2 } as any,
      { type: 'bullet', content: '' } as any,
    ],
  },
  {
    id: '3',
    name: 'Daily Journal',
    emoji: '📔',
    description: 'Daily reflection and planning',
    blocks: [
      { type: 'heading', content: 'Daily Journal', level: 1 } as any,
      { type: 'date', date: new Date(), label: 'Date', includeTime: false } as any,
      { type: 'heading', content: "Today's goals", level: 2 } as any,
      { type: 'todo', content: '', checked: false } as any,
      { type: 'heading', content: 'Reflections', level: 2 } as any,
      { type: 'text', content: '' } as any,
      { type: 'heading', content: "Tomorrow's priorities", level: 2 } as any,
      { type: 'numbered', content: '' } as any,
    ],
  },
];

const defaultPageCategories: PageCategory[] = [
  { id: '1', name: 'Work', color: '#3B82F6', emoji: '💼' },
  { id: '2', name: 'Personal', color: '#10B981', emoji: '🏠' },
  { id: '3', name: 'Projects', color: '#8B5CF6', emoji: '🚀' },
  { id: '4', name: 'Learning', color: '#F59E0B', emoji: '📚' },
];

const defaultPages: Page[] = [
  {
    id: 'welcome-page-1',
    title: 'Welcome to your workspace',
    emoji: '👋',
    blocks: [
      {
        id: crypto.randomUUID(),
        type: 'callout',
        content: 'Type <strong>/</strong> for the block menu, <strong>[[</strong> to link a page, and <strong>⌘K</strong> to jump anywhere.',
        emoji: '💡',
        color: 'blue',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: 'What you can do',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'bullet',
        content: 'Press <strong># </strong>, <strong>## </strong>, or <strong>### </strong> for headings',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'bullet',
        content: 'Press <strong>- </strong> for a bullet, <strong>1. </strong> for numbered, <strong>[] </strong> for a to-do',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'bullet',
        content: 'Press <strong>> </strong> for a quote, <strong>--- </strong> for a divider, <strong>``` </strong> for code',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'todo',
        content: 'Try linking another page with <strong>[[</strong>',
        checked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cold-call-script-page',
    title: 'Cold Call Script',
    emoji: '📞',
    blocks: [
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: 'Cold Call Opening',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'text',
        content: 'Hi [Prospect Name], this is [Your Name] from [Your Company]. Did I catch you at a bad time?',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: 'Value Proposition',
        level: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: crypto.randomUUID(),
        type: 'text',
        content: "The reason I'm calling is that we help companies like yours to [achieve X] by [doing Y].",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function App() {
  const [pages, setPages] = useLocalStorage<Page[]>('pages', defaultPages);
  const [pageTemplates, setPageTemplates] = useLocalStorage<PageTemplate[]>('pageTemplates', defaultPageTemplates);
  const [pageCategories, setPageCategories] = useLocalStorage<PageCategory[]>('pageCategories', defaultPageCategories);
  const [activeSection, setActiveSection] = useState<string>('command-centre');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K for quick switcher
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        setShowCommandPalette((s) => !s);
        return;
      }
      // Ctrl+Shift+F for focus timer
      if (e.code === 'KeyF' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowFocusTimer((s) => !s);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPage = useCallback((pageId: string) => {
    setActivePageId(pageId);
    setActiveSection('page');
  }, []);

  const handleSectionSelect = (section: string) => {
    if (section === 'subscriptions') {
      setShowSubscriptions(true);
    } else {
      setActiveSection(section);
    }
  };

  const handleUpdatePage = useCallback(
    (updatedPage: Page) => {
      setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
    },
    [setPages],
  );

  const handleDeletePage = useCallback(
    (pageId: string) => {
      setPages((prev) => {
        const toDelete = new Set<string>([pageId]);
        // Cascade: also delete descendants.
        let changed = true;
        while (changed) {
          changed = false;
          prev.forEach((p) => {
            if (p.parentId && toDelete.has(p.parentId) && !toDelete.has(p.id)) {
              toDelete.add(p.id);
              changed = true;
            }
          });
        }
        return prev.filter((p) => !toDelete.has(p.id));
      });
      if (activePageId === pageId) {
        setActiveSection('pages');
        setActivePageId(null);
      }
    },
    [activePageId, setPages],
  );

  const handleCreatePage = useCallback(
    (opts?: { templateId?: string; parentId?: string; title?: string }): string => {
      const templateId = opts?.templateId;
      const parentId = opts?.parentId;
      const title = opts?.title;
      const template = templateId ? pageTemplates.find((t) => t.id === templateId) : null;
      const id = crypto.randomUUID();
      const newPage: Page = {
        id,
        title: title ?? (template ? template.name : 'Untitled'),
        emoji: template ? template.emoji : '📄',
        parentId,
        blocks: template
          ? template.blocks.map((b) => ({
              ...(b as any),
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }))
          : [
              {
                id: crypto.randomUUID(),
                type: 'text',
                content: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any,
            ],
        createdAt: new Date(),
        updatedAt: new Date(),
        templateId,
      };
      setPages((prev) => [...prev, newPage]);
      handleSelectPage(id);
      return id;
    },
    [pageTemplates, setPages, handleSelectPage],
  );

  const getCurrentPage = (): Page | null => {
    if (!activePageId) return null;
    return pages.find((page) => page.id === activePageId) || null;
  };

  const renderMainContent = () => {
    if (activeSection === 'command-centre') {
      return <CommandCentre />;
    } else if (activeSection === 'tasks') {
      return <TasksPage />;
    } else if (activeSection === 'pages') {
      return (
        <PagesOverview
          pages={pages}
          templates={pageTemplates}
          pageCategories={pageCategories}
          onSelectPage={handleSelectPage}
          onCreatePage={(templateId) => handleCreatePage({ templateId })}
          onUpdateTemplates={setPageTemplates}
          onUpdatePageCategories={setPageCategories}
          onDeletePage={handleDeletePage}
          onUpdatePage={handleUpdatePage}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />
      );
    } else if (activeSection === 'calendar') {
      return <EnhancedCalendarPage />;
    } else if (activeSection === 'clients') {
      return (
        <ClientsPage
          onOpenInDealDesk={(leadId) => {
            try {
              sessionStorage.setItem('dealdesk-focus-lead', leadId);
            } catch {}
            setActiveSection('command-centre');
          }}
        />
      );
    } else if (activeSection === 'focus') {
      return <FocusTimer />;
    } else if (activeSection === 'page' && activePageId) {
      const currentPage = getCurrentPage();
      if (currentPage) {
        return (
          <NotionPage
            page={currentPage}
            pages={pages}
            onUpdatePage={handleUpdatePage}
            onSelectPage={handleSelectPage}
            onCreatePage={(opts) => handleCreatePage(opts)}
            onDeletePage={handleDeletePage}
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
    <div className="h-screen ios-surface flex relative overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        onSelectPage={handleSelectPage}
        onCreatePage={(opts) => {
          handleCreatePage(opts);
        }}
        onDeletePage={handleDeletePage}
        onUpdatePage={handleUpdatePage}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        pages={pages}
        activePageId={activePageId}
      />

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{renderMainContent()}</div>

        {/* Global Action Buttons */}
        <div className="hidden md:flex fixed bottom-6 left-6 flex-col space-y-3 z-30">
          <button
            onClick={() => setShowFocusTimer(!showFocusTimer)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center border border-purple-500/20"
            title="Focus Timer (Ctrl+Shift+F)"
          >
            <Timer size={28} />
          </button>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center border border-blue-500/20"
            title="Calculator"
          >
            <CalculatorIcon size={28} />
          </button>
          <button
            onClick={() => setShowSubscriptions(!showSubscriptions)}
            className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center border border-green-500/20"
            title="Subscriptions"
          >
            <CreditCard size={28} />
          </button>
        </div>

        <GlobalFocusTimer isVisible={showFocusTimer} onClose={() => setShowFocusTimer(false)} />
        <Calculator isVisible={showCalculator} onClose={() => setShowCalculator(false)} />
        <SubscriptionModal isVisible={showSubscriptions} onClose={() => setShowSubscriptions(false)} />

        <CommandPalette
          isOpen={showCommandPalette}
          pages={pages}
          onClose={() => setShowCommandPalette(false)}
          onSelectPage={handleSelectPage}
          onCreatePage={(title) => handleCreatePage({ title })}
        />
      </main>
    </div>
  );
}

export default App;
