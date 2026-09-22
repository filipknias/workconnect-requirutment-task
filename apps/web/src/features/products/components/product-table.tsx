import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import type { ProductsPage } from "../types/product";
import { formatPageCaption } from "../utils/product-labels";
import { toProductRow } from "../utils/to-product-row";
import { ProductsEmptyState } from "./products-empty-state";
import { ProductStatusBadge } from "./product-status-badge";
import { ProductsPagination } from "./products-pagination";

const HEAD = "px-4 text-neutral-500";
const CELL = "h-12 px-4 py-2";
/** Figma's column track: one wide name column, five even ones after it. */
const COLUMNS = [
  { label: "Nazwa", width: "w-[28.8%]" },
  { label: "SKU", width: "w-[14.2%]" },
  { label: "Kategoria", width: "w-[14.2%]" },
  { label: "Cena Brutto", width: "w-[14.2%]" },
  { label: "Status", width: "w-[14.2%]" },
  { label: "Magazyn", width: "w-[14.4%]" },
];

/** The desktop layout. Note the header reads "Cena Brutto" — the card says "Cena brutto". */
export function ProductTable({ products, page, totalPages, total }: ProductsPage) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-200 bg-gray-50">
            {COLUMNS.map(({ label, width }) => (
              <TableHead key={label} className={`${HEAD} ${width}`}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow className="border-neutral-200">
              <TableCell colSpan={COLUMNS.length} className="p-0">
                <ProductsEmptyState page={page} />
              </TableCell>
            </TableRow>
          )}
          {products.map(toProductRow).map((row) => (
            <TableRow key={row.id} className="border-neutral-200">
              <TableCell className={`${CELL} font-medium text-neutral-950`}>
                {row.name}
              </TableCell>
              <TableCell className={`${CELL} text-xs text-neutral-500`}>
                {row.sku}
              </TableCell>
              <TableCell className={`${CELL} text-neutral-500`}>
                {row.category}
              </TableCell>
              <TableCell className={`${CELL} font-medium text-neutral-950`}>
                {row.price}
              </TableCell>
              <TableCell className={CELL}>
                <ProductStatusBadge status={row.status} />
              </TableCell>
              <TableCell className={`${CELL} text-neutral-950`}>
                {row.stock}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex h-16 items-center justify-between gap-4 border-t border-neutral-200 bg-gray-50 px-4">
        <p className="text-xs text-neutral-500">
          {formatPageCaption({ page, totalPages, total })}
        </p>
        <ProductsPagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
