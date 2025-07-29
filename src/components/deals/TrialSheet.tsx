import { useState, useRef, useEffect, useCallback } from 'react';
import { useCRMStore } from '../../../stores/crmStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, Download, Clock, TrendingUp, Copy, Save, Calendar as CalendarIcon } from 'lucide-react';
import { FreeTrial } from '../../../types/crm';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SERVICE_TYPES = [
  'Website Development',
  'AI Implementation', 
  'CRM Setup',
  'Digital Marketing',
  'E-commerce Platform',
  'Mobile App',
  'Consulting',
  'Training'
];

const TRIAL_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
  { value: 'converted', label: 'Converted', color: 'bg-purple-500' },
  { value: 'expired', label: 'Expired', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' }
];

interface EditingCell {
  trialId: string;
  field: keyof FreeTrial;
}

interface TrialColumn {
  key: 'companyName' | 'contactPerson' | 'serviceType' | 'trialAmountPaid' | 'trialDuration' | 'endDate' | 'status' | 'notes' | 'startDate' | 'conversionProbability';
  label: string;
  width: string;
}

export const TrialSheet = () => {
  const { freeTrials, addFreeTrial, updateFreeTrial, deleteFreeTrial, convertTrialToDeal } = useCRMStore();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'converted'>('all');
  const [autoSaving, setAutoSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [newTrial, setNewTrial] = useState<Partial<FreeTrial>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTrials = freeTrials.filter(trial => {
    const matchesSearch = trial.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || trial.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    setAutoSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAutoSaving(false);
  }, [freeTrials]);

  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [freeTrials, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowNewRow(true);
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 's':
            e.preventDefault();
            autoSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  const handleAddTrial = () => {
    if (newTrial.companyName && newTrial.contactPerson && newTrial.serviceType) {
      const startDate = newTrial.startDate || new Date();
      const duration = newTrial.trialDuration || 30;

      addFreeTrial({
        companyName: newTrial.companyName,
        contactPerson: newTrial.contactPerson,
        email: newTrial.email || '',
        phone: newTrial.phone,
        industry: newTrial.industry || '',
        serviceType: newTrial.serviceType,
        trialAmountPaid: newTrial.trialAmountPaid || 0,
        trialDuration: duration,
        startDate: startDate,
        status: 'active',
        conversionProbability: newTrial.conversionProbability || 50,
        notes: newTrial.notes,
        location: newTrial.location,
        googleMapsUrl: newTrial.googleMapsUrl
      });
      setNewTrial({});
      setShowNewRow(false);
    }
  };

  const handleCellEdit = (trialId: string, field: keyof FreeTrial, value: any) => {
    const updates: any = { [field]: value };
    
    if (field === 'startDate' || field === 'trialDuration') {
      const trial = freeTrials.find(t => t.id === trialId);
      if (trial) {
        const startDate = field === 'startDate' ? new Date(value) : trial.startDate;
        const duration = field === 'trialDuration' ? parseInt(value) : trial.trialDuration;
        updates.endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
      }
    }
    
    updateFreeTrial(trialId, updates);
    setEditingCell(null);
    setTempValue('');
  };

  const handleCellClick = (trialId: string, field: keyof FreeTrial) => {
    const trial = freeTrials.find(t => t.id === trialId);
    if (trial) {
      setEditingCell({ trialId, field });
      const value = trial[field];
      if ((field === 'startDate' || field === 'endDate') && value) {
        setTempValue(format(new Date(value as Date), 'yyyy-MM-dd'));
      } else {
        setTempValue(String(value || ''));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setTempValue('');
    }
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    
    let processedValue: any = tempValue;
    
    if (editingCell.field === 'trialAmountPaid' || editingCell.field === 'conversionProbability') {
      processedValue = parseFloat(tempValue) || 0;
    } else if (editingCell.field === 'trialDuration') {
      processedValue = parseInt(tempValue) || 30;
    } else if (editingCell.field === 'startDate') {
      processedValue = new Date(tempValue);
    }
    
    handleCellEdit(editingCell.trialId, editingCell.field, processedValue);
  };

  const truncateText = (text: string, maxLength: number = 25) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getDaysRemaining = (endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = TRIAL_STATUSES.find(s => s.value === status);
    return (
      <Badge 
        variant={status === 'active' ? "default" : "secondary"} 
        className={`text-xs transition-all duration-200 ${statusConfig?.color} text-white`}
      >
        {statusConfig?.label}
      </Badge>
    );
  };

  const getCompletionRate = () => {
    const total = freeTrials.length;
    const converted = freeTrials.filter(t => t.status === 'converted').length;
    return total > 0 ? Math.round((converted / total) * 100) : 0;
  };

  const toggleRowSelection = (trialId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trialId)) {
        newSet.delete(trialId);
      } else {
        newSet.add(trialId);
      }
      return newSet;
    });
  };

  const deleteSelectedRows = () => {
    selectedRows.forEach(trialId => deleteFreeTrial(trialId));
    setSelectedRows(new Set());
  };

  const duplicateRow = (trial: FreeTrial) => {
    const newTrialData = {
      companyName: `${trial.companyName} (Copy)`,
      contactPerson: trial.contactPerson,
      email: trial.email,
      phone: trial.phone,
      industry: trial.industry,
      serviceType: trial.serviceType,
      trialAmountPaid: trial.trialAmountPaid,
      trialDuration: trial.trialDuration,
      startDate: new Date(),
      status: 'active' as const,
      conversionProbability: trial.conversionProbability,
      notes: trial.notes,
      location: trial.location,
      googleMapsUrl: trial.googleMapsUrl
    };
    addFreeTrial(newTrialData);
  };

  const columns: TrialColumn[] = [
    { key: 'companyName', label: 'Company', width: 'w-48' },
    { key: 'contactPerson', label: 'Contact', width: 'w-36' },
    { key: 'serviceType', label: 'Service', width: 'w-40' },
    { key: 'trialAmountPaid', label: 'Amount', width: 'w-24' },
    { key: 'startDate', label: 'Start Date', width: 'w-36' },
    { key: 'trialDuration', label: 'Duration', width: 'w-24' },
    { key: 'endDate', label: 'End Date', width: 'w-36' },
    { key: 'status', label: 'Status', width: 'w-28' },
    { key: 'notes', label: 'Notes', width: 'w-60' }
  ];

  const EditableCell = ({ trial, column }: { trial: FreeTrial; column: TrialColumn }) => {
    const isEditing = editingCell?.trialId === trial.id && editingCell?.field === column.key;
    const value = trial[column.key];

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);
    
    const HoverPopup = ({ content, title }: { content: string; title: string }) => {
        if (!content || !content.trim()) return null;
        return (
            <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-sm rounded-md px-3 py-2 shadow-lg z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-pre-wrap"
            >
                {title && <div className="font-bold mb-1 uppercase text-xs tracking-wider text-gray-300">{title}</div>}
                <div>{content}</div>
            </div>
        );
    };

    // Date Picker for Start Date
    if (column.key === 'startDate') {
      return (
        <div className="relative group">
          <HoverPopup content={value ? format(new Date(value as Date), 'PPP') : ''} title={column.label} />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-transparent hover:border-blue-200 rounded-md",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value as Date), 'MMM dd, yyyy') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value as Date) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleCellEdit(trial.id, 'startDate', date);
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    // Display for End Date (calculated)
    if (column.key === 'endDate') {
        return (
          <div className="relative group">
            <HoverPopup content={value ? format(new Date(value as Date), 'PPP') : ''} title={column.label} />
            <div
              className="flex items-center text-sm px-3 py-2 min-h-[36px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
              {value ? format(new Date(value as Date), 'MMM dd, yyyy') : ''}
            </div>
          </div>
        );
    }
    
    // Select for Service Type and Status
    if (column.key === 'serviceType' || column.key === 'status') {
      const isStatus = column.key === 'status';
      const options = isStatus ? TRIAL_STATUSES : SERVICE_TYPES.map(s => ({ value: s, label: s }));

      return (
        <div className="relative group">
           <HoverPopup content={String(value || '')} title={column.label} />
           <Popover open={isEditing} onOpenChange={(open) => { if (!open) setEditingCell(null); }}>
            <PopoverTrigger asChild>
              <div
                onClick={() => handleCellClick(trial.id, column.key)}
                className={cn(
                  "cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-transparent hover:border-blue-200 rounded-md flex items-center text-sm transition-all duration-200 px-3 py-2 min-h-[36px]"
                )}
              >
                {isStatus ? getStatusBadge(String(value)) : <span className="truncate">{String(value || '')}</span>}
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Select
                value={String(value)}
                onValueChange={(newValue) => handleCellEdit(trial.id, column.key, newValue)}
              >
                <SelectTrigger className="h-8 text-sm focus:ring-0 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    // Popover editor for other text/number fields
    const inputType = (column.key === 'trialAmountPaid' || column.key === 'trialDuration' || column.key === 'conversionProbability') ? 'number' : 'text';
    const displayValue = (() => {
      if (column.key === 'trialAmountPaid') return `$${value}`;
      if (column.key === 'trialDuration') return `${value}d`;
      return String(value || '');
    })();
    const truncatedContent = typeof displayValue === 'string' ? truncateText(displayValue) : displayValue;

    return (
      <div className="relative group">
        <HoverPopup content={String(value || '')} title={column.label} />
        <Popover open={isEditing} onOpenChange={(open) => { if (!open) handleCellSave(); }}>
          <PopoverTrigger asChild>
            <div
              onClick={() => handleCellClick(trial.id, column.key)}
              className={cn(
                "cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-transparent hover:border-blue-200 rounded-md flex items-center text-sm transition-all duration-200 px-3 py-2 min-h-[36px]"
              )}
            >
              <span className="truncate">{truncatedContent}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" side="top" align="start">
            <Input
              ref={inputRef}
              type={inputType}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleCellSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm border-2 border-blue-500 bg-blue-50 focus:bg-white shadow-md"
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Free Trials
            </h2>
            <p className="text-gray-600">Track and convert your trial customers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{getCompletionRate()}%</div>
              <div className="text-xs text-gray-500">Conversion Rate</div>
            </div>
            {autoSaving && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Save className="w-4 h-4 animate-spin" />
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${getCompletionRate()}%` }}
          ></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search-input"
              placeholder="Search trials... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'completed', 'converted'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType as typeof filter)}
                className="capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {selectedRows.size > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelectedRows}>
              Delete Selected ({selectedRows.size})
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewRow(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Trial (Ctrl+N)
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
                  <TableHead className="w-12 text-center font-semibold">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(freeTrials.map(t => t.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="w-8 text-center font-semibold">#</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={`${column.width} font-semibold text-gray-700`}>
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-32 text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showNewRow && (
                  <TableRow className="border-b border-gray-100 bg-blue-50/30">
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm text-gray-500">New</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Company name"
                        value={newTrial.companyName || ''}
                        onChange={(e) => setNewTrial({ ...newTrial, companyName: e.target.value })}
                        className="h-8 text-sm border-gray-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Contact person"
                        value={newTrial.contactPerson || ''}
                        onChange={(e) => setNewTrial({ ...newTrial, contactPerson: e.target.value })}
                        className="h-8 text-sm border-gray-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newTrial.serviceType || ''}
                        onValueChange={(value) => setNewTrial({ ...newTrial, serviceType: value })}
                      >
                        <SelectTrigger className="h-8 text-sm border-gray-200">
                          <SelectValue placeholder="Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTrial.trialAmountPaid || ''}
                        onChange={(e) => setNewTrial({ ...newTrial, trialAmountPaid: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm border-gray-200"
                      />
                    </TableCell>
                    <TableCell>
                       <Popover>
                          <PopoverTrigger asChild>
                              <Button variant={"outline"} className="h-8 text-sm w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newTrial.startDate ? format(newTrial.startDate, "MMM dd, yyyy") : <span>Pick date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={newTrial.startDate}
                                  onSelect={(date) => setNewTrial({ ...newTrial, startDate: date || undefined })}
                                  initialFocus
                                  className="pointer-events-auto"
                              />
                          </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="30"
                        value={newTrial.trialDuration || ''}
                        onChange={(e) => setNewTrial({ ...newTrial, trialDuration: parseInt(e.target.value) || 30 })}
                        className="h-8 text-sm border-gray-200"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-center text-gray-500">
                        {newTrial.startDate && newTrial.trialDuration ? 
                          format(new Date(newTrial.startDate.getTime() + newTrial.trialDuration * 24 * 60 * 60 * 1000), 'MMM dd') : 
                          '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">Active</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Notes"
                        value={newTrial.notes || ''}
                        onChange={(e) => setNewTrial({ ...newTrial, notes: e.target.value })}
                        className="h-8 text-sm border-gray-200"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          onClick={handleAddTrial} 
                          size="sm"
                          className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Save
                        </Button>
                        <Button 
                          onClick={() => setShowNewRow(false)} 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-3 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {filteredTrials.map((trial, index) => (
                  <TableRow 
                    key={trial.id} 
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-200 ${
                      selectedRows.has(trial.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(trial.id)}
                        onChange={() => toggleRowSelection(trial.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 font-mono">
                      {index + 1}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={`${column.width} p-1`}>
                        <EditableCell trial={trial} column={column} />
                      </TableCell>
                    ))}
                    <TableCell className="p-2">
                      <div className="flex gap-1 justify-center items-center">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDaysRemaining(trial.endDate)}d
                        </div>
                        {(trial.status === 'completed' || trial.status === 'active') && (
                          <Button
                            onClick={() => convertTrialToDeal(trial.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <TrendingUp className="w-3 h-3" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs text-purple-600 hover:bg-purple-100"
                          onClick={() => duplicateRow(trial)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {freeTrials.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trials yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your free trials to improve conversions</p>
          <Button 
            onClick={() => setShowNewRow(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Trial
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-2xl font-bold">{freeTrials.length}</div>
          <div className="text-blue-100 text-sm">Total Trials</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-2xl font-bold">{freeTrials.filter(t => t.status === 'active').length}</div>
          <div className="text-green-100 text-sm">Active</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-2xl font-bold">{freeTrials.filter(t => t.status === 'converted').length}</div>
          <div className="text-purple-100 text-sm">Converted</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-2xl font-bold">{freeTrials.filter(t => t.status === 'expired').length}</div>
          <div className="text-orange-100 text-sm">Expired</div>
        </div>
      </div>
    </div>
  );
};
