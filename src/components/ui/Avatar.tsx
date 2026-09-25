interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

export function Avatar({
  initials,
  color = "#4F46E5",
  size = 28,
}: AvatarProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
      }}
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 tracking-tight"
    >
      {initials}
    </span>
  );
}
