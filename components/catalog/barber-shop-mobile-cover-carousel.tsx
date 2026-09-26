"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { PublicShopImage } from "@/modules/catalog/public-shop-profile";

import {
  getHorizontalSwipeStep,
  wrapImageIndex,
} from "./cover-gallery-navigation";

type BarberShopMobileCoverCarouselProps = {
  images: readonly PublicShopImage[];
  onOpen: (index: number, opener: HTMLButtonElement) => void;
};

export function BarberShopMobileCoverCarousel({
  images,
  onOpen,
}: BarberShopMobileCoverCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const activeIndex = wrapImageIndex(currentIndex, images.length);
  const current = images[activeIndex];

  if (!current) return null;

  function move(step: number) {
    setCurrentIndex((index) => wrapImageIndex(index + step, images.length));
  }

  return (
    <div
      className="cover-carousel relative h-[clamp(13rem,38vw,24rem)] overflow-hidden rounded-xl bg-foreground sm:hidden"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        suppressClick.current = false;
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
          suppressClick.current = true;
          move(step);
          window.setTimeout(() => {
            suppressClick.current = false;
          }, 350);
        }
      }}
      onTouchCancel={() => {
        touchStart.current = null;
      }}
    >
      <button
        type="button"
        aria-label={`Abrir galería en foto ${activeIndex + 1}: ${current.alt}`}
        onClick={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          onOpen(activeIndex, event.currentTarget);
        }}
        onKeyDown={(event) => {
          if (images.length < 2) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className="relative block h-full w-full cursor-pointer touch-pan-y focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring"
      >
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          sizes="(min-width: 640px) 1px, calc(100vw - 32px)"
          className="h-full w-full object-cover"
        />
      </button>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => move(-1)}
            className="cover-carousel-arrow absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={() => move(1)}
            className="cover-carousel-arrow absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </>
      ) : null}
      {images.length > 1 ? (
        <span
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/85 px-3 py-1.5 font-sans text-body-sm font-semibold tracking-wide text-white tabular-nums"
        >
          {activeIndex + 1} / {images.length}
        </span>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1 [background:var(--brand-sheen)]"
      />
    </div>
  );
}
