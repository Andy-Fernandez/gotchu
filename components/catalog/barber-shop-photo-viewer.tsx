"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { PublicShopImage } from "@/modules/catalog/public-shop-profile";

import {
  getHorizontalSwipeStep,
  wrapImageIndex,
} from "./cover-gallery-navigation";

type BarberShopPhotoViewerProps = {
  images: readonly PublicShopImage[];
  initialIndex: number;
  onClose: () => void;
};

export function BarberShopPhotoViewer({
  images,
  initialIndex,
  onClose,
}: BarberShopPhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const activeIndex = wrapImageIndex(currentIndex, images.length);
  const current = images[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    closeRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  if (!current) return null;

  function move(step: number) {
    setCurrentIndex((index) => wrapImageIndex(index + step, images.length));
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Imagen ${activeIndex + 1} de ${images.length}`}
      onClose={() => {
        if (!dialogRef.current?.open) onClose();
      }}
      onKeyDown={(event) => {
        if (images.length < 2) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      className="fixed m-auto h-[min(94dvh,1000px)] max-h-[94dvh] w-[min(96vw,1320px)] max-w-none overflow-hidden rounded-xl border border-white/15 bg-foreground p-0 text-white shadow-lg backdrop:bg-black/85"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 py-2 sm:px-6">
          <p className="font-sans text-body-sm font-semibold tracking-wide tabular-nums">
            {activeIndex + 1}{" "}
            <span className="text-white/60">/ {images.length}</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Volver a la galería"
            className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div
          className="relative min-h-0 flex-1 touch-pan-y"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || images.length < 2) return;
            const touch = event.changedTouches[0];
            const step = getHorizontalSwipeStep(
              touch.clientX - start.x,
              touch.clientY - start.y,
            );
            if (step !== 0) {
              event.preventDefault();
              move(step);
            }
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          <div className="absolute inset-4 sm:inset-8">
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Imagen anterior"
                className="absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark sm:left-4"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Imagen siguiente"
                className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark sm:right-4"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
