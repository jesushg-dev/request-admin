interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export function MetadataItem({ icon, label, value }: MetadataItemProps) {
  return (
    <div className="flex min-w-[200px] items-center gap-3">
      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">{icon}</div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
