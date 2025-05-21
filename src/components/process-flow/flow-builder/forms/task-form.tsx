import { useTranslations } from 'next-intl';

import { TaskNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface TaskFormProps {
  formData: TaskNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function TaskForm({ formData, onGuideClick, onChange }: TaskFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="type">{t('taskType')}</Label>
        <Select value={formData.type || 'manual'} onValueChange={(value) => onChange('type', value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder={t('taskType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">{t('taskTypes.manual')}</SelectItem>
            <SelectItem value="automatic">{t('taskTypes.automatic')}</SelectItem>
            <SelectItem value="api">{t('taskTypes.api')}</SelectItem>
            <SelectItem value="rpa">{t('taskTypes.rpa')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="details">{t('details')}</Label>
        <Textarea id="details" value={formData.details || ''} onChange={(e) => onChange('details', e.target.value)} rows={3} />
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
