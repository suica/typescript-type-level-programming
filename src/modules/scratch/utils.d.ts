import { type Expect } from '@type-challenges/utils';
export type NatConcept = number[];
type __NatToNumericLiteralType<T extends NatConcept> = T['length'];
export type ZERO = [];
export type ONE = [1];
export type MakeNat<
  T extends number,
  res_nat extends NatConcept = [],
> = T extends 0
  ? ZERO
  : T extends 1
  ? [1]
  : EQUALS<T, __NatToNumericLiteralType<res_nat>> extends true
  ? res_nat
  : MakeNat<T, Add<ONE, res_nat>>;
type _ = [
  Expect<EQUALS<ZERO, []>>,
  Expect<EQUALS<MakeNat<0>, ZERO>>,
  Expect<EQUALS<MakeNat<1>, [1]>>,
  Expect<EQUALS<MakeNat<2>, [1, 1]>>,
  Expect<EQUALS<MakeNat<3>, [1, 1, 1]>>,
  Expect<EQUALS<MakeNat<4>, [1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<5>, [1, 1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<6>, [1, 1, 1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<7>, [1, 1, 1, 1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<8>, [1, 1, 1, 1, 1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<9>, [1, 1, 1, 1, 1, 1, 1, 1, 1]>>,
  Expect<EQUALS<MakeNat<10>, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]>>,
  Expect<EQUALS<__NatToNumericLiteralType<MakeNat<128>>, 128>>,
  Expect<EQUALS<__NatToNumericLiteralType<MakeNat<512>>, 512>>,
  Expect<EQUALS<__NatToNumericLiteralType<MakeNat<999>>, 999>>,
  // @ts-expect-error exceeds the instantiation limit
  Expect<EQUALS<__NatToNumericLiteralType<MakeNat<1000>>, 1000>>,
];

export type Add<A extends NatConcept, B extends NatConcept> = [...A, ...B];
export type Sub<A extends NatConcept, B extends NatConcept> = A extends [
  ...B,
  ...infer C,
]
  ? C
  : [];
export type LTE<A extends NatConcept, B extends NatConcept> = Sub<
  A,
  B
> extends []
  ? true
  : false;

export type EQUALS<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? true
  : false;

export type NOT<T extends boolean> = T extends true ? false : true;

export type AND<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

export type OR<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false;

export type LT<A extends NatConcept, B extends NatConcept> = LTE<
  A,
  B
> extends []
  ? EQUALS<A, B> extends false
    ? true
    : false
  : false;

type Select2Way<index extends boolean, first, second> = index extends true
  ? first
  : second;

type EnsureArr<T extends any[] | any> = T extends (infer B)[] ? T : T[];
type Eval<env extends EnvConcept, Expr extends ExprConcept[] | ExprConcept> = [
  env,
  EnsureArr<Expr>,
];

type Stack = { name: string; value: NatConcept }[];
type MakeEnv<
  T extends boolean,
  S extends { name: string; value: NatConcept }[] = [],
> = {
  return: T;
  stack: S;
};
type E = MakeEnv<false, [{ name: 'haha'; value: [1] }]>;

type Stmt<T> = any;

type EnvConcept = MakeEnv<boolean, Stack>;
type SyntaxKind = 'IfStmt' | 'For' | 'Call';
type ExprConcept =
  | {
      kind: 'IfStmt';
      condition: ExprConcept;
      alternate: ExprConcept[];
    }
  | {
      kind: 'BinaryOperator';
      op: string;
      left: ExprConcept;
      right: ExprConcept;
    };

type TempAnonymousLoop<
  env extends EnvConcept,
  i extends NatConcept,
  test extends ExprConcept,
  update extends ExprConcept[],
> = Select2Way<LTE<i, MakeNat<10>>, Eval<env, test>, Eval<env, update>>;

type HEAD<T extends any[]> = T extends [infer head, ...infer rest]
  ? head
  : never;

type _TestHead = [
  Expect<EQUALS<HEAD<[1, 2, 3]>, 1>>,
  Expect<EQUALS<HEAD<[]>, never>>,
];

type TAIL<T extends any[]> = T extends [infer head, ...infer rest] ? rest : [];

type _TestTail = [
  Expect<EQUALS<TAIL<[1, 2, 3]>, [2, 3]>>,
  Expect<EQUALS<TAIL<[]>, []>>,
];

type Lookup<
  env extends EnvConcept,
  name extends string,
  rest_variables extends Stack = env['stack'],
> = EQUALS<rest_variables, []> extends true
  ? never
  : HEAD<rest_variables> extends { name: name; value: infer value }
  ? value
  : Lookup<env, name, TAIL<rest_variables>>;

type _ExampleEnv = MakeEnv<
  false,
  [
    { name: 'ten'; value: MakeNat<10> },
    // shadowed
    { name: 'ten'; value: MakeNat<9> },
    { name: 'one'; value: MakeNat<1> },
    { name: 'zero'; value: MakeNat<0> },
  ]
>;

type _TestLookup = [
  Expect<EQUALS<MakeNat<10>, Lookup<_ExampleEnv, 'ten'>>>,
  Expect<EQUALS<MakeNat<1>, Lookup<_ExampleEnv, 'one'>>>,
  Expect<EQUALS<MakeNat<0>, Lookup<_ExampleEnv, 'zero'>>>,
  Expect<EQUALS<never, Lookup<_ExampleEnv, 'not_found'>>>,
];

// type _test = TempAnonymousLoop<{}, MakeNat<0>, LTE<>>;
// function test_for() {
//   for (let i = 0; i < 10; i++) {
//     if (i * i > 5) {
//       if (i - 3 > 4) {
//         return 233;
//       }
//       break;
//     } else {
//       continue;
//     }
//     return i;
//   }
//   return 233;
// }
