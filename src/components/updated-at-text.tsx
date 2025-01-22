interface UpdatedAtTextProps {
  text?: Date | null;
}

export const UpdatedAtText = ({ text }: UpdatedAtTextProps) => {
  return <>{text ? <span className="text-xs text-muted-foreground">(edited)</span> : null}</>;
};
