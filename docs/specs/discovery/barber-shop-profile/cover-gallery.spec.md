# BarberShopCoverGallery

**Status:** Implemented; revised September 26, 2026

**Surface:** Public barbershop profile at `/barberias/[shopSlug]`

**Scope:** Shop photography and gallery navigation only. Booking behavior is unchanged.

## Goal

Let a visitor browse multiple photos of the barbershop from its direct public profile link. The preview should remain useful on a phone, while a full gallery should make every photo easy to inspect on any screen size.

## Starting point

Before this feature, the profile rendered one `shop.coverImage`. The public catalog exposed one optional image with `src`, `alt`, `width`, and `height`. The demo had six local image files, but five were not part of the public image contract.

## Image contract and demo content

- `BarberShopCoverGallery` receives an **ordered, shop-scoped list** of public images. Each image has a source, descriptive alternative text, and intrinsic width and height. The first image is the cover and initial preview image.
- The gallery and individual-image viewer use the list length. Six is demo content, not a component limit.
- The public profile reader copies only the allowed image fields, preserving the order and keeping future private storage metadata out of the response.
- Proposed demo order, retaining the current cover as the first image:

  1. `/demo/barbershop-cover.png`
  2. `/demo/barbershop-cover-2.png`
  3. `/demo/barbershop-cover-3.png`
  4. `/demo/barbershop-cover-4.png`
  5. `/demo/barbershop-cover-5.png`
  6. `/demo/barbershop-cover-6.png`

- Record the actual dimensions of each file. The existing metadata for `barbershop-cover.png` says `2048 × 1280`, while the checked-in file is `1586 × 992`.

## Responsive preview

| Width                       | Required behavior                                                                                                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone, under 640 px         | Show a single-image carousel starting at the first image, with a visible current/total counter. Do not show “Ver todas las imágenes” at this width. Tapping the current image opens the full gallery at that image. Keep the image tall enough to remain useful. |
| Small, 640–767 px           | Show the first image as a static cover with the visible gallery action overlaid on the image. Tapping the cover opens the full gallery at the first image.                                                                                                       |
| Medium, 768–1023 px         | Keep a single static cover with the visible gallery action overlaid on the image. Clicking the cover opens the full gallery at the first image. Avoid a shallow, heavily cropped strip or a squeezed multi-tile layout.                                          |
| Expanded, 1024 px and above | Show a fixed three-image composition: the first image prominent on the left and the next two ordered images stacked on the right. Clicking any tile opens the full gallery at that image. Overlay “Ver todas las imágenes” visibly.                              |

Below 640 px, the carousel's previous and next arrows appear on hover with a fine pointer and on visible keyboard focus; touch users can reach the controls without hover. The current/total count remains visible so visitors know there are more images. Horizontal touch swipes and keyboard arrow keys also move between images, wrapping from last to first and first to last. From 640 px upward, the preview is static and its gallery action remains clearly visible without hover; the action opens the full gallery at the first image. The page's existing demo badge remains visible and must not cover the counter or action. Preview images may crop to fill their tiles without distortion; the full gallery shows their complete contents.

### Navigation rules

- The preview always starts with the first image. Only below 640 px can preview navigation change the current image; from 640 px upward, interactions do not rotate tiles or change their order.
- The expanded composition shows at most the first three images. The gallery action gives access to every image, including those omitted from the preview.
- Clicking a preview image opens the full gallery at that image. From 640 px upward, clicking “Ver todas las imágenes” opens it at the first image.
- Gallery navigation does not alter the profile URL or booking state.

## Full gallery

- Open in a modal view above the profile, starting at or scrolling to the image the visitor selected.
- Display **every** image in the supplied order and allow vertical scrolling through the entire set.
- Use one column on compact screens. As space permits, repeat an ordered five-image pattern in a two-column grid: one large image spans the full row, followed by two rows of two images each. Let a final unpaired image span the row rather than leaving an empty column. Preserve image, reading, and keyboard order; show complete images at their natural proportions without stretching or cropping.
- Make each image in the grid an interactive entry to an individual-image viewer. The viewer starts at the selected image and moves left or right through the entire ordered list with on-screen controls, keyboard arrow keys, or a deliberate horizontal touch swipe. Both directions wrap between the first and final images. Changing images does not change the profile URL or booking state.
- Do not show a visible “Foto n de m” caption below each grid image. Give every interactive image an accessible name that identifies its position and content; keep the current and total count available in the individual-image viewer.
- Include a visible title identifying the shop gallery, the total image count, and a clean close control anchored at the upper right on all viewport sizes, including at 200% text zoom.
- Escape and the close control dismiss the gallery or individual-image viewer. Focus moves into the active modal view when it opens and returns to the control that opened it when it closes. Background content cannot receive focus or scroll while a modal view is open.

## States and accessibility

- **No images:** Keep the current neutral cover fallback. Hide the gallery action.
- **One image:** Show the static cover without carousel controls. Only show “Ver todas las imágenes” from 640 px upward; opening the full gallery through the image remains available.
- **Two or more images:** Below 640 px, show the carousel with circular navigation and the current/total counter. From 640 px upward, keep the preview static and show only the available expanded preview tiles, up to three images total. All images remain accessible in the full gallery.
- Give each image useful, nonduplicative alternative text based on its actual content. Do not use filenames as alt text.
- Give icon controls accessible names and visible focus. Standalone controls have at least a 44 × 44 px target. Fine-pointer hover affordances must also appear on visible keyboard focus; touch controls remain visible without hover.
- Keep the mobile carousel counter legible against light and dark photos. From 640 px upward, keep the overlaid gallery action legible and reachable. Support text zoom to 200% and `prefers-reduced-motion`.
- Use intrinsic dimensions and responsive image sizes to prevent layout shifts and avoid downloading gallery-sized versions for small preview tiles.

## Acceptance scenarios

1. **Six-image data:** Given the demo shop, the public profile returns the six listed images in the agreed order with accurate dimensions; its image objects contain no private catalog fields.
2. **Mobile preview:** Given six images below 640 px, the carousel starts at `1/6` and shows no “Ver todas las imágenes” action. Previous and next arrows appear on hover or keyboard focus and remain usable on touch; a horizontal swipe or keyboard arrow changes the image and count. Navigation wraps in both directions. Tapping the current image opens the complete gallery at that image.
3. **Small and medium preview:** From 640 px through 1023 px, the static cover and visible overlaid gallery action remain usable without a squeezed tile arrangement, clipped button, or horizontal overflow.
4. **Desktop preview:** At expanded width, the first image remains prominent beside the next two images stacked in order. The visible “Ver todas las imágenes” action opens the complete gallery; clicking any tile opens it at that image. No preview interaction rotates the fixed composition.
5. **Full gallery and viewer:** At expanded width, the six complete images appear in order as one full-row image, two paired rows, and a final full-row image; compact widths use one column. There are no empty columns or visible per-image number captions. Selecting any grid image opens it individually; on-screen arrows, keyboard arrows, and touch swipes move through the list, including `6/6` to `1/6` and `1/6` to `6/6`.
6. **Dialog accessibility:** Keyboard users can open, navigate, scroll, enter an image, and close the gallery. Escape and the upper-right close control work in the modal views, focus returns to the opener, and profile controls cannot be reached while a modal view is open.
7. **Variable length:** With zero, one, two, or more than six images, the component shows the appropriate fallback, mobile carousel controls when applicable, available preview tiles, gallery action at 640 px and above, and dynamic gallery and viewer counts without empty tiles or broken navigation.
8. **Responsive quality:** Compact, medium, and expanded layouts avoid horizontal page overflow; gallery actions remain reachable at 200% text zoom and with reduced motion enabled.

## Implementation tasks in dependency order

1. **Define and expose ordered public images.** Extend the shop catalog and public profile reader; add the six demo files with accurate dimensions and descriptive alt text. Update catalog tests for ordering, public-field copying, and variable list lengths.
2. **Build the preview component.** Implement the carousel with circular arrows, swipe and keyboard navigation, and current/total count below 640 px. Hide “Ver todas las imágenes” there. From 640 px upward, implement the static cover and the fixed expanded composition of one prominent plus two stacked images, with the visible gallery action over the cover or collage. Keep it independent of the demo's fixed image count.
3. **Build the full gallery.** Add the responsive, scrollable modal; clickable images and individual-image viewer with circular navigation; selected-image entry point; upper-right close and focus behavior; and the repeating full-row-plus-pairs layout.
4. **Integrate the profile.** Replace the current single-image presentation while preserving the demo badge, fallback, shop details, and booking actions.
5. **Verify the complete experience.** Exercise touch, keyboard, focus, hover, responsive widths, variable image counts, reduced motion, loading, and image proportions. Update relevant product and catalog documentation with the final behavior.

## Implemented defaults

| Decision                   | Recommended default                                                                                      | Reason                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Image order                | Existing cover first, then numbered files in ascending order.                                            | Preserves the familiar profile hero.                                           |
| Expanded preview           | Fixed first image plus up to two ordered stacked tiles and a visible “Ver todas las imágenes” action.    | Shows several photos with a clear route to the full set.                       |
| Full-gallery arrangement   | Repeat one full-row image followed by two paired rows; promote an unpaired final image to a full row.    | Adds rhythm while keeping complete images in order and avoiding empty columns. |
| Low-resolution third image | Use it in the demo, but avoid relying on it as a large hero until a higher-resolution file is available. | `barbershop-cover-3.png` is only `544 × 305` and may look soft when enlarged.  |
