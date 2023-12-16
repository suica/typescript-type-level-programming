namespace core {
  declare function map<T, P>(arr: T[], f: (x: T) => P): P[];
  declare function mapKV<T extends keyof any, P>(
    obj: Record<string, any>,
    f: (kv: [string, any]) => [T, P],
  ): Record<T, P>;
}
