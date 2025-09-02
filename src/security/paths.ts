import path from "node:path";

export const safeJoin = (base: string, rel: string): string => {
  const resolved = path.resolve(base, rel);
  const normalizedBase = path.resolve(base);
  
  if (!resolved.startsWith(normalizedBase)) {
    throw new Error("Path traversal attempt detected");
  }
  
  return resolved;
};
