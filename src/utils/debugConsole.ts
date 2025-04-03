export function debug(...args: Parameters<typeof console.log>): void {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}
