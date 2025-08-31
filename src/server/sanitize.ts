export function sanitizeSeed(seed: any) {
  if (seed && typeof seed.isbn === "string") {
    // strip anything not 10 or 13 digit ISBN patterns
    const digits = seed.isbn.replace(/[^0-9Xx]/g, "");
    if (!(digits.length === 10 || digits.length === 13)) seed.isbn = "";
  }
  return seed;
}
