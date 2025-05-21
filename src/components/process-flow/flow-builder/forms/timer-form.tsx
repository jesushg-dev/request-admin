import { useTranslations } from 'next-intl';

import { TimerNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { BaseForm } from './base-form';

interface TimerFormProps {
  formData: TimerNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function TimerForm({ formData, onGuideClick, onChange }: TimerFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">{t('duration')}</Label>
          <Input id="duration" type="number" value={formData.duration || 0} onChange={(e) => onChange('duration', Number(e.target.value))} min="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeUnit">{t('timeUnit')}</Label>
          <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => onChange('timeUnit', value)}>
            <SelectTrigger id="timeUnit">
              <SelectValue placeholder={t('timeUnit')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">{t('timeUnits.seconds')}</SelectItem>
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
