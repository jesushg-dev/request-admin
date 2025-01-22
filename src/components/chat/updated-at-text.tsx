import { isEqual } from 'date-fns';

interface UpdatedAtTextProps {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const UpdatedAtText = ({ updatedAt, createdAt }: UpdatedAtTextProps) => {
  const isUpdated = updatedAt && createdAt && !isEqual(updatedAt, createdAt);
  return <>{isUpdated ? <span className="text-xs text-muted-foreground">(edited)</span> : null}</>;
};
