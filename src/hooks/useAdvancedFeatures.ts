import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { 
  Partner, FieldChange, FieldHistory, SearchResult, Command, 
  AuditEntry, CalculatedField, Relationship, CalendarEvent 
} from '../types';

// Field History Hook
export function useFieldHistory() {
  const [fieldHistory, setFieldHistory] = useLocalStorage<{ [entityId: string]: { [fieldPath: string]: FieldHistory } }>('field-history', {});

  const trackFieldChange = useCallback((
    entityId: string,
    fieldPath: string,
    oldValue: any,
    newValue: any,
    userId = 'current-user'
  ) => {
    const change: FieldChange = {
      id: crypto.randomUUID(),
      fieldPath,
      oldValue,
      newValue,
      timestamp: new Date(),
      userId,
      userName: 'Current User',
      changeType: 'update'
    };

    setFieldHistory(prev => ({
      ...prev,
      [entityId]: {
        ...prev[entityId],
        [fieldPath]: {
          fieldPath,
          changes: [change, ...(prev[entityId]?.[fieldPath]?.changes || [])],
          currentValue: newValue
        }
      }
    }));
  }, [setFieldHistory]);

  const getFieldHistory = useCallback((entityId: string, fieldPath: string): FieldHistory | null => {
    return fieldHistory[entityId]?.[fieldPath] || null;
  }, [fieldHistory]);

  const rollbackField = useCallback((entityId: string, fieldPath: string, changeId: string) => {
    const history = fieldHistory[entityId]?.[fieldPath];
    if (!history) return null;

    const changeIndex = history.changes.findIndex(c => c.id === changeId);
    if (changeIndex === -1) return null;

    const targetChange = history.changes[changeIndex];
    return targetChange.oldValue;
  }, [fieldHistory]);

  return { trackFieldChange, getFieldHistory, rollbackField, fieldHistory };
}

// Global Search Hook
export function useGlobalSearch() {
  const [searchIndex, setSearchIndex] = useLocalStorage<any[]>('search-index', []);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const buildSearchIndex = useCallback((partners: Partner[]) => {
    const index: any[] = [];
    
    partners.forEach(partner => {
      // Index basic fields
      const fields = [
        { path: 'name', content: partner.name },
        { path: 'primaryContact.name', content: partner.primaryContact.name },
        { path: 'primaryContact.email', content: partner.primaryContact.email },
        { path: 'notes.content', content: typeof partner.notes === 'string' ? partner.notes : partner.notes?.content || '' },
        { path: 'dealType', content: partner.dealType },
        { path: 'status', content: partner.status }
      ];

      // Index custom fields
      partner.customFields?.forEach((cf, idx) => {
        fields.push({
          path: `customFields.${idx}.value`,
          content: String(cf.value)
        });
      });

      // Index activity log
      partner.activityLog?.forEach((activity, idx) => {
        fields.push({
          path: `activityLog.${idx}.description`,
          content: activity.description
        });
      });

      fields.forEach(field => {
        if (field.content) {
          index.push({
            id: crypto.randomUUID(),
            entityType: 'partner',
            entityId: partner.id,
            fieldPath: field.path,
            content: field.content,
            searchableText: field.content.toLowerCase(),
            lastIndexed: new Date()
          });
        }
      });
    });

    setSearchIndex(index);
  }, [setSearchIndex]);

  const search = useCallback((query: string, options: { limit?: number; entityTypes?: string[] } = {}) => {
    const { limit = 50, entityTypes = ['partner'] } = options;
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const results: SearchResult[] = [];

    searchIndex.forEach(item => {
      if (entityTypes.length > 0 && !entityTypes.includes(item.entityType)) return;

      const score = searchTerms.reduce((acc, term) => {
        if (item.searchableText.includes(term)) {
          return acc + (item.searchableText.startsWith(term) ? 2 : 1);
        }
        return acc;
      }, 0);

      if (score > 0) {
        const highlights: { start: number; end: number }[] = [];
        // let highlightedText = item.content;

        searchTerms.forEach(term => {
          const index = item.searchableText.indexOf(term);
          if (index !== -1) {
            highlights.push({ start: index, end: index + term.length });
          }
        });

        results.push({
          id: crypto.randomUUID(),
          entityType: item.entityType,
          entityId: item.entityId,
          entityName: item.entityType === 'partner' ? 'Partner' : item.entityType,
          fieldPath: item.fieldPath,
          matchedText: item.content,
          context: item.content.substring(Math.max(0, highlights[0]?.start - 50), highlights[0]?.end + 50),
          relevanceScore: score,
          highlights
        });
      }
    });

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    setSearchResults(results.slice(0, limit));
  }, [searchIndex]);

  return { buildSearchIndex, search, searchResults, setSearchResults };
}

// Command Palette Hook
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useLocalStorage<string[]>('recent-commands', []);

  const commands: Command[] = useMemo(() => [
    {
      id: 'new-partner',
      name: 'New Partner',
      description: 'Create a new partnership',
      category: 'create',
      keywords: ['new', 'create', 'partner', 'add'],
      shortcut: ['cmd', 'n'],
      icon: 'Plus',
      action: () => console.log('New partner'),
      isEnabled: () => true
    },
    {
      id: 'search-partners',
      name: 'Search Partners',
      description: 'Search through all partners',
      category: 'search',
      keywords: ['search', 'find', 'partner'],
      shortcut: ['cmd', 'k'],
      icon: 'Search',
      action: () => console.log('Search partners'),
      isEnabled: () => true
    },
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Export partner data',
      category: 'action',
      keywords: ['export', 'download', 'data'],
      icon: 'Download',
      action: () => console.log('Export data'),
      isEnabled: () => true
    },
    {
      id: 'bulk-actions',
      name: 'Bulk Actions',
      description: 'Perform bulk operations',
      category: 'action',
      keywords: ['bulk', 'multiple', 'batch'],
      icon: 'CheckSquare',
      action: () => console.log('Bulk actions'),
      isEnabled: () => true
    }
  ], []);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const searchTerms = query.toLowerCase().split(' ');
    return commands.filter(cmd => 
      searchTerms.every(term => 
        cmd.name.toLowerCase().includes(term) ||
        cmd.description.toLowerCase().includes(term) ||
        cmd.keywords.some(keyword => keyword.includes(term))
      )
    );
  }, [commands, query]);

  const executeCommand = useCallback((commandId: string) => {
    const command = commands.find(c => c.id === commandId);
    if (command && command.isEnabled()) {
      command.action();
      setRecentCommands(prev => [commandId, ...prev.filter(id => id !== commandId)].slice(0, 10));
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commands, setRecentCommands]);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    filteredCommands,
    recentCommands,
    executeCommand
  };
}

// Audit Trail Hook
export function useAuditTrail() {
  const [auditTrail, setAuditTrail] = useLocalStorage<AuditEntry[]>('audit-trail', []);

  const addAuditEntry = useCallback((
    entityType: string,
    entityId: string,
    action: string,
    fieldChanges: FieldChange[],
    metadata: any = {}
  ) => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      action,
      fieldChanges,
      metadata,
      timestamp: new Date(),
      userId: 'current-user',
      userName: 'Current User',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      sessionId: 'session-' + Date.now()
    };

    setAuditTrail(prev => [entry, ...prev.slice(0, 999)]);
  }, [setAuditTrail]);

  const getAuditTrail = useCallback((entityId?: string, entityType?: string) => {
    if (!entityId && !entityType) return auditTrail;
    
    return auditTrail.filter(entry => 
      (!entityId || entry.entityId === entityId) &&
      (!entityType || entry.entityType === entityType)
    );
  }, [auditTrail]);

  const exportAuditTrail = useCallback((entityId?: string) => {
    const entries = getAuditTrail(entityId);
    const csv = [
      ['Timestamp', 'Entity Type', 'Entity ID', 'Action', 'User', 'Changes'],
      ...entries.map(entry => [
        entry.timestamp.toISOString(),
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.userName || 'Unknown',
        entry.fieldChanges.map(fc => `${fc.fieldPath}: ${fc.oldValue} → ${fc.newValue}`).join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${entityId || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getAuditTrail]);

  return { addAuditEntry, getAuditTrail, exportAuditTrail, auditTrail };
}

// Calculated Fields Hook
export function useCalculatedFields() {
  const [calculatedFields, setCalculatedFields] = useLocalStorage<CalculatedField[]>('calculated-fields', []);

  const evaluateFormula = useCallback((formula: string, context: any) => {
    try {
      // Simple formula evaluation (in production, use a proper formula engine)
      const sanitizedFormula = formula.replace(/[^a-zA-Z0-9\s\+\-\*\/\(\)\.\,]/g, '');
      
      // Replace field references with values
      let evaluatedFormula = sanitizedFormula;
      Object.keys(context).forEach(key => {
        const value = context[key];
        if (typeof value === 'number') {
          evaluatedFormula = evaluatedFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
        }
      });

      // Basic math evaluation
      return Function('"use strict"; return (' + evaluatedFormula + ')')();
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return null;
    }
  }, []);

  const calculateField = useCallback((field: CalculatedField, partner: Partner) => {
    const context = {
      monthlyRevenue: partner.monthlyRevenue,
      totalRevenue: partner.totalRevenue,
      // Add more context fields as needed
    };

    return evaluateFormula(field.formula, context);
  }, [evaluateFormula]);

  const updateCalculatedFields = useCallback((partners: Partner[]) => {
    const updatedPartners = partners.map(partner => {
      const calculatedValues: { [fieldId: string]: any } = {};
      
      calculatedFields.forEach(field => {
        const value = calculateField(field, partner);
        if (value !== null) {
          calculatedValues[field.id] = value;
        }
      });

      return {
        ...partner,
        calculatedFields: calculatedValues
      };
    });

    return updatedPartners;
  }, [calculatedFields, calculateField]);

  return { calculatedFields, setCalculatedFields, updateCalculatedFields, calculateField };
}

// Relationship Mapping Hook
export function useRelationshipMapping() {
  const [relationships, setRelationships] = useLocalStorage<Relationship[]>('relationships', []);

  const addRelationship = useCallback((
    fromEntityType: string,
    fromEntityId: string,
    toEntityType: string,
    toEntityId: string,
    relationshipType: string,
    strength: 'weak' | 'medium' | 'strong' = 'medium'
  ) => {
    const relationship: Relationship = {
      id: crypto.randomUUID(),
      fromEntityType: fromEntityType as any,
      fromEntityId,
      toEntityType: toEntityType as any,
      toEntityId,
      relationshipType: relationshipType as any,
      strength,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setRelationships(prev => [...prev, relationship]);
  }, [setRelationships]);

  const getRelationships = useCallback((entityId: string, entityType: string) => {
    return relationships.filter(rel => 
      (rel.fromEntityId === entityId && rel.fromEntityType === entityType) ||
      (rel.toEntityId === entityId && rel.toEntityType === entityType)
    );
  }, [relationships]);

  const buildNetworkData = useCallback((partners: Partner[]) => {
    const nodes: any[] = partners.map(partner => ({
      id: partner.id,
      type: 'partner',
      name: partner.name,
      data: partner
    }));

    const edges: any[] = relationships.map(rel => ({
      id: rel.id,
      source: rel.fromEntityId,
      target: rel.toEntityId,
      type: rel.relationshipType,
      strength: rel.strength === 'strong' ? 3 : rel.strength === 'medium' ? 2 : 1
    }));

    return { nodes, edges };
  }, [relationships]);

  return { relationships, addRelationship, getRelationships, buildNetworkData };
}

// Calendar Integration Hook
export function useCalendarIntegration() {
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('calendar-events', []);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCalendarEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [setCalendarEvents]);

  const getEventsForPartner = useCallback((partnerId: string) => {
    return calendarEvents.filter(event => event.partnerId === partnerId);
  }, [calendarEvents]);

  const getUpcomingEvents = useCallback((days: number = 7) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return calendarEvents.filter(event => 
      event.startDate >= now && event.startDate <= future
    ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [calendarEvents]);

  return { calendarEvents, addEvent, getEventsForPartner, getUpcomingEvents };
}

export function useAdvancedFeatures() {
  const fieldHistory = useFieldHistory();
  const globalSearch = useGlobalSearch();
  const commandPalette = useCommandPalette();
  const auditTrail = useAuditTrail();
  const calculatedFields = useCalculatedFields();
  const relationshipMapping = useRelationshipMapping();
  const calendarIntegration = useCalendarIntegration();

  return {
    fieldHistory,
    globalSearch,
    commandPalette,
    auditTrail,
    calculatedFields,
    relationshipMapping,
    calendarIntegration
  };
} 