interface TagPillProps {
  name: string;
}

export default function TagPill({ name }: TagPillProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-background border border-border rounded-md text-xs font-medium text-muted">
      #{name.toLowerCase()}
    </span>
  );
}
