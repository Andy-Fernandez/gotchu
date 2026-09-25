import assert from "node:assert/strict";
import { test } from "node:test";

import { demoCatalog } from "../../modules/catalog/demo-catalog.ts";
import {
  createPublicShopProfileReader,
  getPublicShopProfile,
} from "../../modules/catalog/get-public-shop-profile.ts";

test("demo returns a fictional Bolivian shop with two barbers and three services", async () => {
  const profile = await getPublicShopProfile("demo");

  assert.ok(profile);
  assert.equal(profile.shop.id, "shop-demo");
  assert.equal(profile.shop.slug, "demo");
  assert.match(profile.shop.description, /fictici/);
  assert.equal(profile.shop.timezone, "America/La_Paz");
  assert.equal(profile.shop.currency, "BOB");
  assert.equal(profile.shop.coverImage?.src, "/demo/barbershop-cover.png");
  assert.equal(profile.shop.coverImage?.width, 2048);
  assert.equal(profile.barbers.length, 2);
  assert.equal(profile.services.length, 3);
  assert.ok(profile.shop.openingHours.length > 0);
  assert.ok(profile.shop.publicPolicy.cancellation);
  assert.ok(profile.shop.publicPolicy.noShow);
  assert.deepEqual(
    profile.services.map((service) => [service.name, service.priceMinorUnits]),
    [
      ["Corte de pelo normal", 4500],
      ["Cejas", 500],
      ["Barba", 1500],
    ],
  );
});

test("unknown and empty slugs return null", async () => {
  assert.equal(await getPublicShopProfile("unknown"), null);
  assert.equal(await getPublicShopProfile(""), null);
});

test("inactive shops return null", async () => {
  const catalog = structuredClone(demoCatalog);
  catalog.shops[0].isActive = false;

  assert.equal(await createPublicShopProfileReader(catalog)("demo"), null);
});

test("inactive services are excluded without removing the active catalog", async () => {
  const catalog = structuredClone(demoCatalog);
  const inactiveId = catalog.services[0].id;
  catalog.services[0].isActive = false;

  const profile = await createPublicShopProfileReader(catalog)("demo");

  assert.ok(profile);
  assert.equal(profile.services.length, 2);
  assert.ok(profile.services.every((service) => service.id !== inactiveId));
  assert.equal(profile.barbers.length, 2);
});

test("each slug returns only its own services and barbers", async () => {
  const catalog = structuredClone(demoCatalog);
  const otherShop = { ...catalog.shops[0], id: "shop-other", slug: "other" };
  const otherBarber = {
    ...catalog.barbers[0],
    id: "barber-other",
    shopId: otherShop.id,
  };
  const otherService = {
    ...catalog.services[0],
    id: "service-other",
    shopId: otherShop.id,
    eligibleBarberIds: [otherBarber.id],
  };
  catalog.shops = [...catalog.shops, otherShop];
  catalog.barbers = [...catalog.barbers, otherBarber];
  catalog.services = [...catalog.services, otherService];
  const readProfile = createPublicShopProfileReader(catalog);

  const demo = await readProfile("demo");
  const other = await readProfile("other");

  assert.ok(demo);
  assert.ok(other);
  assert.equal(demo.services.length, 3);
  assert.equal(demo.barbers.length, 2);
  assert.deepEqual(
    other.services.map((service) => service.id),
    [otherService.id],
  );
  assert.deepEqual(
    other.barbers.map((barber) => barber.id),
    [otherBarber.id],
  );
  for (const profile of [demo, other]) {
    assert.ok(
      profile.services.every((service) => service.shopId === profile.shop.id),
    );
    assert.ok(
      profile.barbers.every((barber) => barber.shopId === profile.shop.id),
    );
  }
});

test("eligibility includes only explicitly eligible active barbers from the same shop", async () => {
  const catalog = structuredClone(demoCatalog);
  catalog.barbers[1].isActive = false;
  catalog.barbers = [
    ...catalog.barbers,
    { ...catalog.barbers[0], id: "barber-foreign", shopId: "shop-other" },
  ];
  catalog.services[0].eligibleBarberIds = [
    ...catalog.services[0].eligibleBarberIds,
    "barber-foreign",
    "barber-missing",
  ];

  const profile = await createPublicShopProfileReader(catalog)("demo");

  assert.ok(profile);
  assert.deepEqual(
    profile.barbers.map((barber) => barber.id),
    ["barber-demo-alex"],
  );
  assert.deepEqual(profile.services[0].eligibleBarberIds, ["barber-demo-alex"]);
  // An empty eligible list must not silently become "any barber".
  assert.deepEqual(profile.services[1].eligibleBarberIds, []);
});

test("demo money, durations, and relationships satisfy catalog invariants", () => {
  assert.equal(demoCatalog.shops.length, 1);
  assert.ok(demoCatalog.shops[0].coverImage?.src.startsWith("/"));
  assert.ok((demoCatalog.shops[0].coverImage?.width ?? 0) > 0);
  assert.ok((demoCatalog.shops[0].coverImage?.height ?? 0) > 0);
  assert.equal(
    new Set(demoCatalog.services.map((service) => service.id)).size,
    3,
  );
  assert.equal(new Set(demoCatalog.barbers.map((barber) => barber.id)).size, 2);
  for (const service of demoCatalog.services) {
    assert.ok(demoCatalog.shops.some((shop) => shop.id === service.shopId));
    assert.ok(Number.isSafeInteger(service.priceMinorUnits));
    assert.ok(Number.isSafeInteger(service.depositMinorUnits));
    assert.ok(service.priceMinorUnits >= 0);
    assert.ok(service.depositMinorUnits >= 0);
    assert.ok(service.depositMinorUnits <= service.priceMinorUnits);
    assert.ok(
      Number.isSafeInteger(service.durationMinutes) &&
        service.durationMinutes > 0,
    );
    assert.ok(
      Number.isSafeInteger(service.bufferMinutes) && service.bufferMinutes >= 0,
    );
    assert.ok(service.eligibleBarberIds.length > 0);
    for (const id of service.eligibleBarberIds) {
      assert.ok(
        demoCatalog.barbers.some(
          (barber) =>
            barber.id === id &&
            barber.shopId === service.shopId &&
            barber.isActive,
        ),
      );
    }
  }
});

test("public values come from catalog configuration, including zero deposits", async () => {
  const catalog = structuredClone(demoCatalog);
  catalog.services[0].priceMinorUnits = 6000;
  catalog.services[0].depositMinorUnits = 2000;
  catalog.services[0].durationMinutes = 40;
  catalog.services[0].bufferMinutes = 10;

  const profile = await createPublicShopProfileReader(catalog)("demo");

  assert.ok(profile);
  assert.equal(profile.services[0].priceMinorUnits, 6000);
  assert.equal(profile.services[0].depositMinorUnits, 2000);
  assert.equal(profile.services[0].durationMinutes, 40);
  assert.equal(profile.services[0].bufferMinutes, 10);
  assert.equal(profile.services[1].depositMinorUnits, 0);
});

test("public responses omit active flags and unexpected private fields, including nested fields", async () => {
  const catalog = structuredClone(demoCatalog);
  const shop = catalog.shops[0];
  Object.assign(shop, { privateNote: "internal shop note" });
  Object.assign(shop.publicPolicy, { internalNote: "internal policy note" });
  Object.assign(shop.coverImage ?? {}, {
    privateStorageKey: "private/object/key",
  });
  Object.assign(shop.openingHours[0], { internalNote: "internal hours note" });
  Object.assign(catalog.services[0], { privateNote: "internal service note" });
  Object.assign(catalog.barbers[0], { phone: "private phone" });

  const profile = await createPublicShopProfileReader(catalog)("demo");

  assert.ok(profile);
  assert.equal("isActive" in profile.shop, false);
  assert.equal("privateStorageKey" in (profile.shop.coverImage ?? {}), false);
  assert.ok(profile.services.every((service) => !("isActive" in service)));
  assert.ok(profile.barbers.every((barber) => !("isActive" in barber)));
  assert.deepEqual(profile, await getPublicShopProfile("demo"));
});

test("changing a returned profile cannot change source data or subsequent reads", async () => {
  const catalog = structuredClone(demoCatalog);
  const original = structuredClone(catalog);
  const readProfile = createPublicShopProfileReader(catalog);
  const profile = await readProfile("demo");

  assert.ok(profile);
  profile.shop.name = "Changed";
  profile.shop.publicPolicy.cancellation = "Changed";
  if (profile.shop.coverImage) profile.shop.coverImage.alt = "Changed";
  profile.shop.openingHours[0].opensAt = "00:00";
  profile.services[0].priceMinorUnits = 1;
  profile.services[0].eligibleBarberIds = [];
  profile.barbers[0].displayName = "Changed";
  profile.services.pop();

  assert.deepEqual(catalog, original);
  assert.deepEqual(
    await readProfile("demo"),
    await getPublicShopProfile("demo"),
  );
});
