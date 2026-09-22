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
  const pageLink = usePageLink();
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;
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
            // A spent arrow keeps the role it had a moment ago rather than
            // vanishing from the row a screen reader hears: an inert control
            // that explains itself is the point of `aria-disabled`, and a bare
            // `<span>` would simply be gone. The role is a prop rather than an
            // attribute on the span because `PaginationLink` clones the
            // rendered element with `role: undefined` and spreads its own
            // props after — only a prop survives that.
            role={hasPrevious ? undefined : "link"}
            render={hasPrevious ? <a {...pageLink(previous)} /> : <span />}
          />
        </PaginationItem>

        {visiblePages(page, totalPages).map((slot, index) =>
          slot === "ellipsis" ? (
            // Index rather than the slot: there are two of these and they are
            // never reordered, only redrawn.
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
