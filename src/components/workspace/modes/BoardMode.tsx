import { useState } from 'react';
import { DealType, LeadStage } from '../../../types/crm';
import { CRMMetrics } from '../../../hooks/useCRM';
import { PipelineView } from '../../commandCentre/PipelineView';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (id: string) => void;
  onUpdateStage: (id: string, stage: LeadStage) => void;
}

// Pipeline board mounted in the centre pane. The existing PipelineView already
// owns columns + drag + filters; we just provide the deal-type filter state.
export function BoardMode({ metrics, onSelectLead, onUpdateStage }: Props) {
  const [dealTypeFilter, setDealTypeFilter] = useState<DealType | 'all'>('all');

  return (
    <PipelineView
      metrics={metrics}
      dealTypeFilter={dealTypeFilter}
      onChangeDealTypeFilter={setDealTypeFilter}
      onSelectLead={(l) => onSelectLead(l.id)}
      onUpdateStage={onUpdateStage}
    />
  );
}
