'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AnnotationNodeData,
  ApprovalNodeData,
  BaseNodeData,
  ConditionNodeData,
  FlowNode,
  FlowNodeType,
  GatewayNodeData,
  LoopNodeData,
  MessageNodeData,
  NodeData,
  NotificationNodeData,
  StepNodeData,
  SubProcessNodeData,
  TaskNodeData,
  TimerNodeData,
} from '@/types/execution-flow';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { AnnotationForm, ApprovalForm, BaseForm, ConditionForm, GatewayForm, LoopForm, MessageForm, NotificationForm, StepForm, SubProcessForm, TaskForm, TimerForm } from './forms';
import { availableGuides } from './mocks';

interface PropertiesPanelProps {
  node: FlowNode;
  onChange: <T extends FlowNodeType>(nodeId: string, data: NodeData<T>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function PropertiesPanel({ node, onChange, onClose, onDelete }: PropertiesPanelProps) {
  const t = useTranslations('component.flowExecution.build.form');
  const [formData, setFormData] = useState<NodeData<FlowNodeType>>(node.data);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [selectedGuides, setSelectedGuides] = useState<string[]>(node.data.linkedGuides || []);

  useEffect(() => {
    setFormData(node.data);
    setSelectedGuides(node.data.linkedGuides || []);
  }, [node]);

  const handleChange = <K extends keyof NodeData<FlowNodeType>>(name: K, value: NodeData<FlowNodeType>[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(node.id, formData);
  };

  const handleGuideChange = (guideId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuides((prev) => [...prev, guideId]);
    } else {
      setSelectedGuides((prev) => prev.filter((id) => id !== guideId));
    }
  };

  const handleSaveGuides = () => {
    handleChange('linkedGuides', selectedGuides);
    setIsGuideDialogOpen(false);
  };

  const renderFormFields = () => {
    const baseProps = {
      onGuideClick: () => setIsGuideDialogOpen(true),
      onChange: handleChange,
    };

    switch (node.type) {
      case 'start':
      case 'end':
        return <BaseForm {...baseProps} formData={formData as BaseNodeData} />;
      case 'step':
        return <StepForm {...baseProps} formData={formData as StepNodeData} />;
      case 'condition':
        return <ConditionForm {...baseProps} formData={formData as ConditionNodeData} />;
      case 'loop':
        return <LoopForm {...baseProps} formData={formData as LoopNodeData} />;
      case 'subprocess':
        return <SubProcessForm {...baseProps} formData={formData as SubProcessNodeData} />;
      case 'task':
        return <TaskForm {...baseProps} formData={formData as TaskNodeData} />;
      case 'approval':
        return <ApprovalForm {...baseProps} formData={formData as ApprovalNodeData} />;
      case 'notification':
        return <NotificationForm {...baseProps} formData={formData as NotificationNodeData} />;
      case 'timer':
        return <TimerForm {...baseProps} formData={formData as TimerNodeData} />;
      case 'gateway':
        return <GatewayForm {...baseProps} formData={formData as GatewayNodeData} />;
      case 'message':
        return <MessageForm {...baseProps} formData={formData as MessageNodeData} />;
      case 'annotation':
        return <AnnotationForm {...baseProps} formData={formData as AnnotationNodeData} />;
      default:
        return <BaseForm {...baseProps} formData={formData as BaseNodeData} />;
    }
  };

  return (
    <div className="w-72 overflow-hidden flex flex-col h-full border-l bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {t('properties')}: {node.type}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-1 overflow-auto">{renderFormFields()}</div>
          <div className="flex gap-4 justify-between w-full p-4 pt-2">
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit}>
              {t('actions.apply')}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('linkGuides')}</DialogTitle>
            <DialogDescription>
              {t('linkGuides')} - {formData.label}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {availableGuides.map((guide) => (
              <div key={guide.id} className="flex items-start space-x-2">
                <Checkbox id={guide.id} checked={selectedGuides.includes(guide.id)} onCheckedChange={(checked) => handleGuideChange(guide.id, checked as boolean)} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={guide.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {guide.title}
                  </label>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsGuideDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="button" onClick={handleSaveGuides}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
