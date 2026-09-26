"use client";

import { useRef, useState } from "react";

import type { PublicShopImage } from "@/modules/catalog/public-shop-profile";

import { BarberShopCoverGalleryPreview } from "./barber-shop-cover-gallery-preview";
import { BarberShopFullGallery } from "./barber-shop-full-gallery";

type BarberShopCoverGalleryProps = {
  images: readonly PublicShopImage[];
  shopName: string;
};

export function BarberShopCoverGallery({
  images,
  shopName,
}: BarberShopCoverGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <BarberShopCoverGalleryPreview
        images={images}
        onOpen={(index, opener) => {
          openerRef.current = opener;
          setSelectedIndex(index);
        }}
      />

      {selectedIndex !== null ? (
        <BarberShopFullGallery
          images={images}
          shopName={shopName}
          selectedIndex={selectedIndex}
          onClose={() => {
            setSelectedIndex(null);
            requestAnimationFrame(() => openerRef.current?.focus());
          }}
        />
      ) : null}
    </div>
  );
}
