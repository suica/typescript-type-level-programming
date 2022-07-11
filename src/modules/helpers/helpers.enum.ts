export enum HelperTypeEnum {
  LTE = 'LTE',
  SUB = 'SUB',
  LT = 'LT',
  EQUALS = 'EQUALS',
  NOT = 'NOT',
  AND = 'AND',
  OR = 'OR',
}

export const helperTypesKeys = Object.keys(HelperTypeEnum) as HelperTypeEnum[];

// type SUB<A extends number[], B extends number[]> = A extends [...B, ...infer C]
//   ? C
//   : [];
// type LTE<A extends number[], B extends number[]> = SUB<A, B> extends []
//   ? true
//   : false;

// type EQUALS<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
//   ? 1
//   : 2
//   ? true
//   : false;

// type NOT<T extends boolean> = T extends true ? false : true;

// type C = NOT<false>;

// type AND<A extends boolean, B extends boolean> = A extends true
//   ? B extends true
//     ? true
//     : false
//   : false;

// type OR<A extends boolean, B extends boolean> = A extends true
//   ? true
//   : B extends true
//   ? true
//   : false;

// type LT<A extends number[], B extends number[]> = LTE<A, B> extends []
//   ? EQUALS<A, B> extends false
//     ? true
//     : false
//   : false;

export const helperTypesSourceCodeMap: Record<HelperTypeEnum, string> = {
  [HelperTypeEnum.SUB]: `
type SUB<A extends number[], B extends number[]> = A extends [...B, ...infer C]
  ? C
  : [];
  `,
  [HelperTypeEnum.EQUALS]: `
type EQUALS<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;
  `,
  [HelperTypeEnum.LTE]: `
type LTE<A extends number[], B extends number[]> = SUB<A, B> extends []
  ? true
  : false;
  `,
  [HelperTypeEnum.NOT]: `
type NOT<T extends boolean> = T extends true ? false : true;
`,
  [HelperTypeEnum.LT]: `
type LT<A extends number[], B extends number[]> = LTE<A, B> extends []
  ? EQUALS<A, B> extends false
    ? true
    : false
  : false;
  `,
  [HelperTypeEnum.AND]: `
type AND<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;
  `,
  [HelperTypeEnum.OR]: `
type OR<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false;
  `,
};
