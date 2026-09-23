"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { usePageLink } from "../hooks/use-page-link";
import { visiblePages } from "../utils/visible-pages";

const ITEM = "h-8 rounded-md text-sm font-medium text-neutral-950";
// The `dark:` overrides beat the outline variant's `dark:bg-input/30`.
const ACTIVE = `${ITEM} border-transparent bg-blue-600 text-white hover:bg-blue-600 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-600`;
const SPENT = `${ITEM} pointer-events-none opacity-50`;

export function ProductsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pageLink = usePageLink();
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;
  // Clamped so `?page=99` points back at the last real page, not page 98.
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
            // A prop, not on the `<span>`: `PaginationLink` overwrites the
            // rendered element's `role`, so only a prop survives.
            role={hasPrevious ? undefined : "link"}
            render={hasPrevious ? <a {...pageLink(previous)} /> : <span />}
          />
        </PaginationItem>

        {visiblePages(page, totalPages).map((slot, index) =>
          slot === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={slot}>
              <PaginationLink
                isActive={slot === page}
                className={slot === page ? ACTIVE : ITEM}
                render={<a {...pageLink(slot)} />}
              >
                {slot}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text="Dalej"
            aria-label="Przejdź do następnej strony"
            className={hasNext ? ITEM : SPENT}
            aria-disabled={hasNext ? undefined : true}
            role={hasNext ? undefined : "link"}
            render={hasNext ? <a {...pageLink(next)} /> : <span />}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
