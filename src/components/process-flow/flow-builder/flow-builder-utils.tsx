import React from 'react';
import { FileDown, FileUp, Maximize, Minimize, Play, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

type FlowBuilderControlsProps = {
  isSimulating: boolean;
  isFullscreen: boolean;
  handleLoadFlow: () => void;
  handleExportFlow: () => void;
  toggleSimulation: () => void;
  handleFullscreenToggle: () => void;
  handleSaveFlow: () => void;
};

export const FlowBuilderControls: React.FC<FlowBuilderControlsProps> = ({ isSimulating, isFullscreen, handleLoadFlow, handleExportFlow, toggleSimulation, handleFullscreenToggle, handleSaveFlow }) => {
  const t = useTranslations('component.flowExecution.build.controls');

  return (
    <div className="flex items-center ml-auto gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleLoadFlow}>
        <FileUp className="w-4 h-4 mr-2" />
        {t('load')}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleExportFlow}>
        <FileDown className="w-4 h-4 mr-2" />
        {t('export')}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleFullscreenToggle}>
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={toggleSimulation}>
        <Play className="w-4 h-4 mr-2" />
        {isSimulating ? t('stopSimulation') : t('simulate')}
      </Button>
      <Button type="button" variant="default" size="sm" onClick={handleSaveFlow}>
        <Save className="w-4 h-4 mr-2" />
        {t('save')}
      </Button>
    </div>
  );
};

type SelectedEdgeProps = {
  source: string;
  target: string;
  onDelete: () => void;
};

export const SelectedEdge: React.FC<SelectedEdgeProps> = ({ source, target, onDelete }) => {
  const t = useTranslations('component.flowExecution.build.selectedEdge');
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{t('selected', { source, target })}</span>
      <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-1" /> {t('delete')}
      </Button>
    </div>
  );
};
