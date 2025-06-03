import { isEqual } from 'date-fns';
import { useTranslations } from 'next-intl';

interface UpdatedAtTextProps {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const UpdatedAtText = ({ updatedAt, createdAt }: UpdatedAtTextProps) => {
  const t = useTranslations('component.chat.updatedAt');
  const isUpdated = updatedAt && createdAt && !isEqual(updatedAt, createdAt);
  return <>{isUpdated ? <span className="text-muted-foreground text-xs">{t('edited')}</span> : null}</>;
};
