"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "cn";

import { Button } from "@repo/ui/components/button";
import { CircleCheckIcon } from "lucide-react";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-md border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-2 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

/**
 * The mark each toast type carries, keyed by `type`. A new variant is a new
 * entry here and nothing else; a type with no entry draws no icon at all, so
 * an untyped toast is just its title and nothing is thrown.
 *
 * Only `success` is drawn today — it is the only type this app sends. The
 * others went out with the shadcn default rather than being kept unused: an
 * icon nobody has seen is an icon nobody has checked against the design, and
 * the next one should be drawn when there is a design to draw it from.
 */
const TOAST_ICONS: Record<string, React.ReactNode> = {
  success: (
    // The design draws this one filled: a solid green disc with the check
    // knocked out of it in white. Lucide's circle-check is a `<circle>` plus
    // the tick's `<path>`, and both `fill` and `stroke` inherit from the svg —
    // so the disc takes the green, the tick is stroked white over it, and the
    // tick path's own green fill is invisible against the disc behind it. The
    // circle has to opt out of that stroke, or the disc wears a white ring
    // that eats a pixel off its edge.
    //
    // Spelled out rather than `green-600`: Tailwind v4 repalletted that token
    // away from the value this design was drawn against, and the status badge
    // in `apps/web` hard-codes the same hex for the same reason.
    //
    // `size-5` rather than the slot's default 16px, which is what the design
    // draws and also what a solid disc needs — a filled mark reads smaller
    // than an outlined one at the same box. The slot's `:not([class*='size-'])`
    // guard is what lets this through.
    <CircleCheckIcon
      className="size-5 fill-[#16a34a] stroke-white [&>circle]:stroke-none"
      aria-hidden="true"
    />
  ),
};

function ToastIcon({ type }: { type: string | undefined }) {
  const icon = type === undefined ? null : TOAST_ICONS[type];

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const { toasts, close } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast
      key={toastItem.id}
      toast={toastItem}
      // There is no close button any more, so the toast itself is the dismiss
      // target. The click is deliberately not fenced off from the action
      // button inside it: a toast whose action has just been taken has said
      // what it had to say, and dismissing on that click is what one is
      // expected to do.
      //
      // This is the pointer half only. The keyboard already had its own way
      // out before the X went — Base UI closes a focused toast on `Escape` —
      // and a swipe in any direction still works, so closing twice over a
      // flick that also lands a click is a no-op on an already-closing toast.
      className="cursor-pointer"
      onClick={() => close(toastItem.id)}
    >
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  viewportClassName,
  ...props
}: ToastPrimitive.Provider.Props & {
  /**
   * Classes for the viewport. The toasts are portalled to the body, so they
   * sit outside whatever surface opened them and cannot inherit from it — a
   * light-only app has to pass `light-surface` through here or its toasts turn
   * dark for a dark-mode visitor.
   */
  viewportClassName?: string;
}) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport className={viewportClassName}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
