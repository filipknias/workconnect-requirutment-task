import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

/**
 * Smoke test for the scaffold, not a feature. It exists to prove three things
 * end to end: `@repo/ui` resolves from the app, a Base UI client component
 * hydrates inside a server component, and Tailwind picks up classes that are
 * only ever written inside `packages/ui`.
 */
const shifts = [
  { id: "1", role: "Barista", site: "Kraków — Rynek", status: "Open" },
  { id: "2", role: "Warehouse picker", site: "Wrocław — Bielany", status: "Filled" },
  { id: "3", role: "Event steward", site: "Warszawa — Centrum", status: "Open" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">WorkConnect</h1>
        <p className="text-muted-foreground">
          Scaffold smoke test — every element below is rendered by a component
          from <code className="font-mono">@repo/ui</code>.
        </p>
      </header>

      <Dialog>
        <DialogTrigger render={<Button>Open dialog</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>It works</DialogTitle>
            <DialogDescription>
              A Base UI dialog from the shared package, styled by tokens the
              package also owns.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell className="font-medium">{shift.role}</TableCell>
              <TableCell>{shift.site}</TableCell>
              <TableCell>{shift.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
