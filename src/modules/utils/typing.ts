export function assertNever(a: never) {
  throw new Error("cannot reach here");
}

export function isNotNil<T>(a: T): a is NonNullable<T> {
  return a !== undefined && a !== null;
}
