import { Icon3D, type Icon3DName } from "@/components/icons3d";

const sizes = { sm: 36, md: 44, lg: 56 } as const;

/** Icon minh hoạ 3D (khối phẳng, không gradient) theo bộ icons3d */
export function IconTile({
  name,
  color,
  size = "md",
  className,
}: {
  name: Icon3DName;
  color?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return <Icon3D name={name} color={color} size={sizes[size]} className={className ? `shrink-0 ${className}` : "shrink-0"} />;
}
