import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { formatPrice } from "../format-price";
import type { ProductsPage } from "../get-products-page";
import { formatPageCaption } from "../product-labels";
import { ProductsEmptyState } from "./products-empty-state";
import { ProductStatusBadge } from "./product-status-badge";
import { ProductsPagination } from "./products-pagination";

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | number;
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

/**
 * The mobile layout. The caption and pagination sit centred on the canvas below
 * the stack rather than in a grey bar, and the card labels the price "Cena
 * brutto" where the desktop header capitalises it.
 */
export function ProductCardList({ products, page, totalPages, total }: ProductsPage) {
  return (
    <div className="flex flex-col gap-6">
      {products.length === 0 ? (
        <Card className="rounded-[12px] bg-white ring-neutral-200 [--card-spacing:0px]">
          <ProductsEmptyState />
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <Card
              key={product.id}
              className="gap-2 rounded-[12px] bg-white ring-neutral-200 [--card-spacing:12px]"
            >
              <CardHeader>
                <CardTitle className="text-base text-neutral-950">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  {product.sku}
                </CardDescription>
                <CardAction className="self-center">
                  <ProductStatusBadge status={product.status} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1 rounded-[9px] bg-neutral-100 p-3">
                  <Stat label="Kategoria" value={product.category} />
                  <Stat label="Cena brutto" value={formatPrice(product.price)} emphasis />
                  <Stat label="Magazyn" value={product.stock ?? "—"} />
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
