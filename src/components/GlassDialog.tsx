"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface GlassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function GlassDialog({ open, onOpenChange, eyebrow, title, description, children }: GlassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="glass-popover max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl p-6 sm:max-w-md">
        <DialogClose className="icon-button absolute right-4 top-4" aria-label="Tutup">
          <X className="size-4" />
        </DialogClose>
        <div className="mb-2 pr-10">
          <p className="section-kicker">{eyebrow}</p>
          <DialogTitle className="section-title">{title}</DialogTitle>
          <DialogDescription className="section-description">{description || "Rincian kas kelas."}</DialogDescription>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
