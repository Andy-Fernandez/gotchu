"use client";

import { Scissors } from "lucide-react";
import Image from "next/image";

import type { PublicShopImage } from "@/modules/catalog/public-shop-profile";

import { BarberShopMobileCoverCarousel } from "./barber-shop-mobile-cover-carousel";

type BarberShopCoverGalleryPreviewProps = {
  images: readonly PublicShopImage[];
  onOpen: (index: number, opener: HTMLButtonElement) => void;
};

export function BarberShopCoverGalleryPreview({
  images,
  onOpen,
}: BarberShopCoverGalleryPreviewProps) {
  const cover = images[0];
  const sideImages = images
    .slice(1, 3)
    .map((image, index) => ({ image, index: index + 1 }));

  if (!cover) {
    return (
      <div className="relative flex h-[clamp(13rem,38vw,24rem)] items-center justify-center overflow-hidden rounded-xl bg-foreground text-primary-foreground">
        <Scissors className="size-8" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 [background:var(--brand-sheen)]"
        />
      </div>
    );
  }

  return (
    <>
      <BarberShopMobileCoverCarousel images={images} onOpen={onOpen} />
      <div className="relative hidden sm:block">
        <div
          className={
            sideImages.length > 0
              ? "relative grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-4"
              : "relative"
          }
        >
          <button
            type="button"
            onClick={(event) => onOpen(0, event.currentTarget)}
            aria-label={`Abrir galería en foto 1: ${cover.alt}`}
            className="relative block h-[clamp(13rem,38vw,24rem)] w-full cursor-pointer overflow-hidden rounded-xl bg-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              preload
              sizes="(min-width: 1024px) 640px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              className="h-full w-full object-cover"
            />
          </button>
          {sideImages.length > 0 ? (
            <div
              className={`hidden min-w-0 gap-4 lg:grid lg:h-[clamp(13rem,38vw,24rem)] lg:grid-cols-1 ${
                sideImages.length === 2 ? "lg:grid-rows-2" : "lg:grid-rows-1"
              }`}
            >
              {sideImages.map(({ image, index }) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  onClick={(event) => onOpen(index, event.currentTarget)}
                  aria-label={`Abrir galería en foto ${index + 1}: ${image.alt}`}
                  className="relative min-h-0 overflow-hidden rounded-xl bg-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 320px, 1px"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1 [background:var(--brand-sheen)]"
          />
        </div>
        <button
          type="button"
          onClick={(event) => onOpen(0, event.currentTarget)}
          aria-label={`Ver todas las imágenes (${images.length})`}
          className="hidden sm:flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 font-sans text-body-sm font-semibold text-foreground shadow-md transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:absolute sm:right-3 sm:bottom-3 sm:mt-0 sm:w-auto"
        >
          Ver todas las imágenes
        </button>
      </div>
    </>
  );
}
