import { useTranslations } from 'next-intl';

import { ApprovalNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { BaseForm } from './base-form';

interface ApprovalFormProps {
  formData: ApprovalNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function ApprovalForm({ formData, onGuideClick, onChange }: ApprovalFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="approvers">{t('approvers')}</Label>
        <Input
          id="approvers"
          value={Array.isArray(formData.approvers) ? formData.approvers.join(', ') : ''}
          onChange={(e) => {
            const approvers = e.target.value
              .split(',')
              .map((item: string) => item.trim())
              .filter(Boolean);
            onChange('approvers', approvers);
          }}
          placeholder="e.g., Manager, Team Lead"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">{t('estimatedTime')}</Label>
          <Input id="estimatedTime" type="number" value={formData.estimatedTime || 0} onChange={(e) => onChange('estimatedTime', Number(e.target.value))} min="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeUnit">{t('timeUnit')}</Label>
          <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => onChange('timeUnit', value)}>
            <SelectTrigger id="timeUnit">
              <SelectValue placeholder={t('timeUnit')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">{t('timeUnits.minutes')}</SelectItem>
              <SelectItem value="hours">{t('timeUnits.hours')}</SelectItem>
              <SelectItem value="days">{t('timeUnits.days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseForm>
  );
}
