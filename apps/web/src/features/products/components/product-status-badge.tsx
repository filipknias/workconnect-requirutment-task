import { Badge } from "@repo/ui/components/badge";
import type { ProductStatus } from "../types/product";

/**
 * Figma layers the accent colour under white at 90%, which is the same result
 * as a 10% tint of the accent itself.
 *
 * The hexes are spelled out because Tailwind v4 repalletted `green-600` and
 * `red-600` away from the v3 values this design was drawn against.
 */
const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  available: { label: "Dostępny", className: "bg-[#16a34a]/10 text-[#16a34a]" },
  unavailable: { label: "Niedostępny", className: "bg-[#dc2626]/10 text-[#dc2626]" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, className } = STATUS_STYLES[status];

  return <Badge className={className}>{label}</Badge>;
}
