import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getHorizontalSwipeStep,
  isFullRowGalleryImage,
  wrapImageIndex,
} from "../../components/catalog/cover-gallery-navigation.ts";

test("image navigation wraps in both directions for variable image counts", () => {
  assert.equal(wrapImageIndex(6, 6), 0);
  assert.equal(wrapImageIndex(-1, 6), 5);
  assert.equal(wrapImageIndex(13, 8), 5);
  assert.equal(wrapImageIndex(-1, 1), 0);
  assert.equal(wrapImageIndex(1, 0), 0);
});

test("only deliberate horizontal gestures move the carousel", () => {
  assert.equal(getHorizontalSwipeStep(-90, 5), 1);
  assert.equal(getHorizontalSwipeStep(90, 5), -1);
  assert.equal(getHorizontalSwipeStep(-15, 0), 0);
  assert.equal(getHorizontalSwipeStep(-90, 100), 0);
  assert.equal(getHorizontalSwipeStep(0, 0), 0);
});

test("gallery rows repeat a wide image and two pairs without a lone half-width tile", () => {
  assert.deepEqual(
    Array.from({ length: 6 }, (_, index) => isFullRowGalleryImage(index, 6)),
    [true, false, false, false, false, true],
  );
  assert.deepEqual(
    Array.from({ length: 10 }, (_, index) => isFullRowGalleryImage(index, 10)),
    [true, false, false, false, false, true, false, false, false, false],
  );
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => isFullRowGalleryImage(index, 4)),
    [true, false, false, true],
  );
  assert.deepEqual(
    Array.from({ length: 7 }, (_, index) => isFullRowGalleryImage(index, 7)),
    [true, false, false, false, false, true, true],
  );
});
