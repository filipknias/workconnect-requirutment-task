import { Button } from "@repo/ui/components/button";
import { PlusIcon } from "lucide-react";

/**
 * Deliberately inert. The "Dodaj produkt" wizard is a separate set of frames
 * and out of scope for this page.
 */
export function AddProductButton() {
  return (
    <Button className="h-9 shrink-0 gap-1.5 rounded-full bg-[#2563eb] px-4 text-neutral-50 hover:bg-[#2563eb]/80">
      <PlusIcon />
      Dodaj produkt
    </Button>
  );
}
