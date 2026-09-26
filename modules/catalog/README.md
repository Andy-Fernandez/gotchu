# Catalog

Owns the shop-scoped public profile, service catalog, price/duration/deposit snapshots, and barber eligibility. It does not calculate availability.

## Day 1 implementation

| File                         | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `types.ts`                   | Framework-independent `Shop`, ordered public images, `Service`, `Barber`, and in-memory `Catalog` types. |
| `demo-catalog.ts`            | One explicitly fictional shop, two barbers, and three active services.                                   |
| `public-shop-profile.ts`     | Explicit allowlists of customer-safe response fields.                                                    |
| `get-public-shop-profile.ts` | Shop lookup, active-record filtering, eligibility, and public-field projection.                          |

The public page calls the application operation:

```ts
import { getPublicShopProfile } from "@/modules/catalog/get-public-shop-profile";

const profile = await getPublicShopProfile("demo");
// { shop, services, barbers }, or null for an unknown/inactive shop.
```

Pages must not import `demo-catalog.ts`. The promise-based operation keeps the caller independent of whether a future implementation reads a file, database, or API. `createPublicShopProfileReader` binds isolated in-memory fixtures for tests; it is not a database abstraction or a public write operation.

Only active services and barbers belonging to the selected shop are returned. Each service retains its `shopId` and only its explicitly eligible, active, same-shop barber IDs. An active service with no eligible active barbers retains an empty list; it does not imply availability or permission to use another barber. Responses copy explicit public fields, including each image's `src`, `alt`, `width`, and `height`, nested hours, and policy, rather than returning source records. The gallery receives the narrower `PublicShopImage` contract. `shop.images` is ordered and scoped to the shop; the first image is the cover. An empty list produces the neutral cover fallback.

The demo exposes six images in the order documented by [the cover gallery specification](../../docs/specs/discovery/barber-shop-profile/cover-gallery.spec.md). The stored dimensions match the checked-in PNG files. Files `barbershop-cover-5.png` and `barbershop-cover-6.png` currently have identical contents; a distinct sixth photograph should replace the latter before using this catalog with a real shop.

## Fictional catalog assumptions

Currency is `BOB`, displayed as Bs. All money is stored in integer minor units (Bs 45 = `4500`). Prices are provisional user-suggested examples; durations, buffers, deposits, opening hours, address, names, and policy text are demonstration assumptions, not validated business data.

| Service              | Price (Bs) | Duration (minutes) | Buffer (minutes) | Deposit (Bs) | Eligible barbers |
| -------------------- | ---------: | -----------------: | ---------------: | -----------: | ---------------- |
| Corte de pelo normal |         45 |                 30 |                5 |           10 | Alex, Sam        |
| Cejas                |          5 |                 10 |                5 |            0 | Sam              |
| Barba                |         15 |                 20 |                5 |            5 | Alex             |

These are configurable catalog values, not UI constants. Additional services such as ondulado/base can be added as records later. Opening hours are recurring `HH:mm` intervals interpreted in `America/La_Paz`; omitted weekdays are closed. They are not appointment timestamps or calculated availability.

`pnpm test` checks lookup, visibility, shop scope, eligibility, money and duration invariants, response privacy, and isolation. TypeScript `number` fields do not validate runtime inputs; these static demo records are checked by tests. Future catalog writes must validate integers, ranges, and relationships at the server boundary.

No booking snapshots, persistence provider, authentication, or storage provider is implemented in this catalog boundary.
