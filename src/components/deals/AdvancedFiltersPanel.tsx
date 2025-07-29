
import { useState } from 'react';
import { Deal } from '../../../types/crm';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Slider } from '../../ui/slider';
import { X, Filter } from 'lucide-react';

interface FilterCriteria {
  stages: Deal['stage'][];
  probabilityRange: [number, number];
  valueRange: [number, number];
  healthRange: [number, number];
  sources: string[];
  complexity: string[];
  tags: string[];
  hasStakeholders: boolean | null;
  hasCompetitors: boolean | null;
  daysToClose: number | null;
}

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterCriteria) => void;
  deals: Deal[];
}

export const AdvancedFiltersPanel = ({ 
  isOpen, 
  onClose, 
  onFiltersChange, 
  deals 
}: AdvancedFiltersPanelProps) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    stages: [],
    probabilityRange: [0, 100],
    valueRange: [0, 1000000],
    healthRange: [0, 100],
    sources: [],
    complexity: [],
    tags: [],
    hasStakeholders: null,
    hasCompetitors: null,
    daysToClose: null
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.stages.length > 0) count++;
    if (newFilters.probabilityRange[0] > 0 || newFilters.probabilityRange[1] < 100) count++;
    if (newFilters.valueRange[0] > 0 || newFilters.valueRange[1] < 1000000) count++;
    if (newFilters.healthRange[0] > 0 || newFilters.healthRange[1] < 100) count++;
    if (newFilters.sources.length > 0) count++;
    if (newFilters.complexity.length > 0) count++;
    if (newFilters.tags.length > 0) count++;
    if (newFilters.hasStakeholders !== null) count++;
    if (newFilters.hasCompetitors !== null) count++;
    if (newFilters.daysToClose !== null) count++;
    
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterCriteria = {
      stages: [],
      probabilityRange: [0, 100],
      valueRange: [0, 1000000],
      healthRange: [0, 100],
      sources: [],
      complexity: [],
      tags: [],
      hasStakeholders: null,
      hasCompetitors: null,
      daysToClose: null
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setActiveFiltersCount(0);
  };

  const toggleStage = (stage: Deal['stage']) => {
    const newStages = filters.stages.includes(stage)
      ? filters.stages.filter(s => s !== stage)
      : [...filters.stages, stage];
    updateFilter('stages', newStages);
  };

  const toggleSource = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    updateFilter('sources', newSources);
  };

  const toggleComplexity = (complexity: string) => {
    const newComplexity = filters.complexity.includes(complexity)
      ? filters.complexity.filter(c => c !== complexity)
      : [...filters.complexity, complexity];
    updateFilter('complexity', newComplexity);
  };

  // Get unique values from deals for filter options
  const availableSources = [...new Set(deals.map(deal => deal.source))];
  const availableTags = [...new Set(deals.flatMap(deal => deal.tags || []))];
  const maxValue = Math.max(...deals.map(deal => deal.value));

  if (!isOpen) return null;

  return (
    <Card className="mb-4 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deal Stages */}
        <div>
          <Label className="text-sm font-medium">Deal Stages</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as Deal['stage'][]).map(stage => (
              <Button
                key={stage}
                variant={filters.stages.includes(stage) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleStage(stage)}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Probability Range */}
        <div>
          <Label className="text-sm font-medium">
            Probability Range: {filters.probabilityRange[0]}% - {filters.probabilityRange[1]}%
          </Label>
          <div className="mt-2">
            <Slider
              value={filters.probabilityRange}
              onValueChange={(value) => updateFilter('probabilityRange', value as [number, number])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Value Range */}
        <div>
          <Label className="text-sm font-medium">
            Value Range: ${filters.valueRange[0].toLocaleString()} - ${filters.valueRange[1].toLocaleString()}
          </Label>
          <div className="mt-2">
            <Slider
              value={filters.valueRange}
              onValueChange={(value) => updateFilter('valueRange', value as [number, number])}
              max={maxValue}
              step={1000}
              className="w-full"
            />
          </div>
        </div>

        {/* Health Score Range */}
        <div>
          <Label className="text-sm font-medium">
            Health Score: {filters.healthRange[0]} - {filters.healthRange[1]}
          </Label>
          <div className="mt-2">
            <Slider
              value={filters.healthRange}
              onValueChange={(value) => updateFilter('healthRange', value as [number, number])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Sources */}
        <div>
          <Label className="text-sm font-medium">Sources</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableSources.map(source => (
              <Button
                key={source}
                variant={filters.sources.includes(source) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSource(source)}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <Label className="text-sm font-medium">Complexity</Label>
          <div className="flex gap-2 mt-2">
            {['low', 'medium', 'high'].map(complexity => (
              <Button
                key={complexity}
                variant={filters.complexity.includes(complexity) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleComplexity(complexity)}
              >
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Has Stakeholders</Label>
            <Select 
              value={filters.hasStakeholders?.toString() || 'any'} 
              onValueChange={(value) => updateFilter('hasStakeholders', value === 'any' ? null : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Days to Close</Label>
            <Input
              type="number"
              placeholder="e.g., 30"
              value={filters.daysToClose || ''}
              onChange={(e) => updateFilter('daysToClose', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
