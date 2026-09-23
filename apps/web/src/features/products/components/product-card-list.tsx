import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { ProductsPage } from "../types/product";
import { formatPageCaption } from "../utils/product-labels";
import { toProductRow } from "../utils/to-product-row";
import { ProductsEmptyState } from "./products-empty-state";
import { ProductStatusBadge } from "./product-status-badge";
import { ProductsPagination } from "./products-pagination";

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className={`text-sm text-neutral-950 ${emphasis ? "font-medium" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export function ProductCardList({ products, page, totalPages, total }: ProductsPage) {
  return (
    <div className="flex flex-col gap-6">
      {products.length === 0 ? (
        <Card className="rounded-[12px] bg-white ring-neutral-200 [--card-spacing:0px]">
          <ProductsEmptyState page={page} />
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map(toProductRow).map((row) => (
            <Card
              key={row.id}
              className="gap-2 rounded-[12px] bg-white ring-neutral-200 [--card-spacing:12px]"
            >
              <CardHeader>
                <CardTitle className="text-base text-neutral-950">
                  {row.name}
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  {row.sku}
                </CardDescription>
                <CardAction className="self-center">
                  <ProductStatusBadge status={row.status} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1 rounded-[9px] bg-neutral-100 p-3">
                  <Stat label="Kategoria" value={row.category} />
                  <Stat label="Cena brutto" value={row.price} emphasis />
                  <Stat label="Magazyn" value={row.stock} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-500">
          {formatPageCaption({ page, totalPages, total })}
        </p>
        <ProductsPagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
