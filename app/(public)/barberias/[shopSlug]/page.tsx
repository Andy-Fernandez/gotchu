import { notFound } from "next/navigation";

import { PublicShopCatalog } from "@/components/catalog/public-shop-catalog";
import { getPublicShopProfile } from "@/modules/catalog/get-public-shop-profile";

type ShopPageProps = {
  params: Promise<{ shopSlug: string }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { shopSlug } = await params;
  const profile = await getPublicShopProfile(shopSlug);

  if (!profile) {
    notFound();
  }

  return <PublicShopCatalog profile={profile} />;
}
