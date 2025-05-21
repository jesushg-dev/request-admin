import { useTranslations } from 'next-intl';

import { GatewayNodeData } from '@/types/execution-flow';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { BaseForm } from './base-form';

interface GatewayFormProps {
  formData: GatewayNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function GatewayForm({ formData, onGuideClick, onChange }: GatewayFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="type">{t('gatewayType')}</Label>
        <Select value={formData.type || 'parallel'} onValueChange={(value) => onChange('type', value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder={t('gatewayType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parallel">{t('gatewayTypes.parallel')}</SelectItem>
            <SelectItem value="inclusive">{t('gatewayTypes.inclusive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </BaseForm>
  );
}
