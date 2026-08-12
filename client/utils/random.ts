export function randomInt(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error("randomInt bounds must be integers.");
  }

  if (min > max) {
    throw new Error("randomInt min cannot be greater than max.");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot select a random item from an empty array.");
  }

  return items[randomInt(0, items.length - 1)];
}
