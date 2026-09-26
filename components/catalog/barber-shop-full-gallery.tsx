"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { PublicShopImage } from "@/modules/catalog/public-shop-profile";

import { BarberShopPhotoViewer } from "./barber-shop-photo-viewer";
import { isFullRowGalleryImage } from "./cover-gallery-navigation";

type BarberShopFullGalleryProps = {
  images: readonly PublicShopImage[];
  shopName: string;
  selectedIndex: number;
  onClose: () => void;
};

export function BarberShopFullGallery({
  images,
  shopName,
  selectedIndex,
  onClose,
}: BarberShopFullGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLLIElement>(null);
  const photoOpenerRef = useRef<HTMLButtonElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const scrollArea = scrollRef.current;
    const selected = selectedRef.current;
    if (!dialog || !scrollArea || !selected) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const frame = requestAnimationFrame(() => {
      scrollArea.scrollTop = selected.offsetTop - scrollArea.offsetTop;
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="barber-shop-gallery-title"
      onClose={() => {
        // In development, the first effect cleanup may close a dialog that
        // the next effect setup has already reopened.
        if (!dialogRef.current?.open) onClose();
      }}
      className="fixed m-auto h-[min(94dvh,960px)] max-h-[94dvh] w-[min(96vw,1040px)] max-w-none overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/80"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2
              id="barber-shop-gallery-title"
              className="text-title-sm leading-tight text-balance sm:text-title-md"
            >
              Galería de {shopName}
            </h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              {images.length} {images.length === 1 ? "foto" : "fotos"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar galería"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div
          ref={scrollRef}
          tabIndex={0}
          role="region"
          aria-label="Fotografías de la barbería"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
        >
          <ol className="grid grid-cols-1 items-start gap-3 sm:gap-4 md:grid-cols-2">
            {images.map((image, index) => (
              <li
                key={`${image.src}-${index}`}
                ref={index === selectedIndex ? selectedRef : undefined}
                className={
                  isFullRowGalleryImage(index, images.length)
                    ? "min-w-0 md:col-span-2"
                    : "min-w-0"
                }
              >
                <button
                  type="button"
                  onClick={(event) => {
                    photoOpenerRef.current = event.currentTarget;
                    setFocusedIndex(index);
                  }}
                  aria-label={`Ampliar imagen ${index + 1} de ${images.length}: ${image.alt}`}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes={
                      isFullRowGalleryImage(index, images.length)
                        ? "(min-width: 768px) 992px, calc(100vw - 48px)"
                        : "(min-width: 768px) 480px, calc(100vw - 48px)"
                    }
                    className="h-auto w-full"
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
        {focusedIndex !== null ? (
          <BarberShopPhotoViewer
            images={images}
            initialIndex={focusedIndex}
            onClose={() => {
              setFocusedIndex(null);
              requestAnimationFrame(() => photoOpenerRef.current?.focus());
            }}
          />
        ) : null}
      </div>
    </dialog>
  );
}
