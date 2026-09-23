import { Badge } from "@repo/ui/components/badge";
import type { ProductStatus } from "../types/product";

// Hexes, not `green-600`/`red-600`: Tailwind v4 changed those from the v3
// values this design was drawn against.
const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  available: { label: "Dostępny", className: "bg-[#16a34a]/10 text-[#16a34a]" },
  unavailable: { label: "Niedostępny", className: "bg-[#dc2626]/10 text-[#dc2626]" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, className } = STATUS_STYLES[status];

  return <Badge className={className}>{label}</Badge>;
}
