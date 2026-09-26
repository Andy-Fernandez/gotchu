// Wraps an image index to the valid range [0, length).
export function wrapImageIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** One full-width image, then two pairs; widen an unpaired final image. */
export function isFullRowGalleryImage(index: number, length: number): boolean {
  const position = index % 5;
  return position === 0 || (index === length - 1 && position % 2 === 1);
}

/** Ignores short or mostly vertical touch movements. */
export function getHorizontalSwipeStep(
  deltaX: number,
  deltaY: number,
): -1 | 0 | 1 {
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return 0;
  }
  return deltaX < 0 ? 1 : -1;
}
