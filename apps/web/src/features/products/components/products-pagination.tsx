import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { productPageHref } from "../search-params";

const ITEM = "h-8 rounded-md text-sm font-medium text-neutral-950";
/** The outline variant ships a `dark:bg-input/30` that would otherwise win over the blue. */
const ACTIVE = `${ITEM} border-transparent bg-blue-600 text-white hover:bg-blue-600 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-600`;
/** An edge arrow has nowhere to go, so it renders as inert text. */
const SPENT = `${ITEM} pointer-events-none opacity-50`;

export function ProductsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  // `?page=99` sits past the end, so its neighbour is the last real page rather
  // than page 98 — an arrow never points at another page that does not exist.
  const previous = Math.min(page - 1, totalPages);
  const next = Math.max(page + 1, 1);

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Wstecz"
            aria-label="Przejdź do poprzedniej strony"
            className={hasPrevious ? ITEM : SPENT}
            aria-disabled={hasPrevious ? undefined : true}
            render={hasPrevious ? <Link href={productPageHref(previous)} /> : <span />}
          />
        </PaginationItem>

        {pages.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              isActive={number === page}
              className={number === page ? ACTIVE : ITEM}
              render={<Link href={productPageHref(number)} />}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            text="Dalej"
            aria-label="Przejdź do następnej strony"
            className={hasNext ? ITEM : SPENT}
            aria-disabled={hasNext ? undefined : true}
            render={hasNext ? <Link href={productPageHref(next)} /> : <span />}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
