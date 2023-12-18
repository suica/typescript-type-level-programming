import { type Expect } from '@type-challenges/utils';
import { TAIL } from '../vm/utils/helper';
import { EQUALS } from '../vm/utils/nat';

// code adapted from https://www.effect.website/docs/behaviour/hkt#what-are-higher-kinded-types

type MakeArityConstraint<
  T extends number,
  res_nat extends unknown[] = [],
> = EQUALS<T, number> extends true
  ? unknown[]
  : T extends 0
  ? []
  : T extends 1
  ? [unknown]
  : EQUALS<T, res_nat['length']> extends true
  ? res_nat
  : MakeArityConstraint<T, [unknown, ...res_nat]>;

// type TakeFirst<
//   Arr extends any[],
//   first extends number,
//   result extends any[] = [],
// > = Arr['length'] extends 0
//   ? result
//   : result['length'] extends first
//   ? result
//   : TakeFirst<TAIL<Arr>, first, [...result, Arr[0]]>;

type ReplaceFirstUnknownWith<
  Arr extends any[],
  item,
  result extends any[] = [],
> = Arr['length'] extends 0
  ? result
  : EQUALS<Arr[0], unknown> extends true
  ? [...result, item, ...TAIL<Arr>]
  : ReplaceFirstUnknownWith<TAIL<Arr>, item, [...result, Arr[0]]>;

type TestReplaceFirstUnknownWith = [
  Expect<
    EQUALS<
      ReplaceFirstUnknownWith<[unknown, unknown], number>,
      [number, unknown]
    >
  >,
  Expect<
    EQUALS<ReplaceFirstUnknownWith<[number, unknown], number>, [number, number]>
  >,
  Expect<EQUALS<ReplaceFirstUnknownWith<[], number>, []>>,
];

type TupleComponentIntersection<A extends any[], B extends any[]> = {
  [x in keyof A]: x extends keyof B ? A[x] & B[x] : A[x];
};
type TestTupleIntersection = [
  TupleComponentIntersection<[unknown, unknown], [string, number]>,
  Expect<
    EQUALS<
      TupleComponentIntersection<[unknown, unknown], [string, number]>,
      [string, number]
    >
  >,
  Expect<
    EQUALS<
      TupleComponentIntersection<[number, unknown], [unknown, string]>,
      [number, string]
    >
  >,
];

export interface HKT {
  readonly TypeArguments: unknown[];
  readonly type?: unknown;
}
export interface ArrayHKT extends HKTWithArity<1> {
  readonly type: Array<this['TypeArguments'][0]>;
}

type SingleApplication<F extends HKT, TypeArgument> = F & {
  readonly TypeArguments: ReplaceFirstUnknownWith<
    F['TypeArguments'],
    TypeArgument
  >;
};
type Kind<F extends HKT, TypeArgument> = EQUALS<
  SingleApplication<F, TypeArgument>['TypeArguments'][number],
  unknown
> extends false
  ? SingleApplication<F, TypeArgument>['type']
  : SingleApplication<F, TypeArgument>;

type TestSingleApplication = [
  Expect<EQUALS<Kind<ArrayHKT, string>, string[]>>,
  Expect<EQUALS<Kind<ArrayHKT, number>, number[]>>,
  Expect<EQUALS<Kind<Kind<MapHKT, string>, number>, Map<string, number>>>,
];

interface Mappable<F extends HKT> {
  readonly map: <A, B>(self: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
}

const stringify =
  <F extends HKT>(T: Mappable<F>) =>
  (self: Kind<F, number>): Kind<F, string> =>
    T.map(self, (n) => {
      type test = Expect<EQUALS<typeof n, number>>;
      return `number: ${n}`;
    });

interface HKTWithArity<Arity extends number> extends HKT {
  readonly TypeArguments: MakeArityConstraint<Arity>;
}
type PartialApply<lambda, arguments extends unknown[]> = lambda extends HKT
  ? arguments['length'] extends 0
    ? EQUALS<lambda['TypeArguments'][number], unknown> extends false
      ? lambda['type']
      : lambda
    : PartialApply<Kind<lambda, arguments[0]>, TAIL<arguments>>
  : lambda;

type CountUnknown<
  Arr extends any[],
  result extends number[] = [],
> = Arr['length'] extends 0
  ? result['length']
  : CountUnknown<
      TAIL<Arr>,
      [...result, ...(EQUALS<Arr[0], unknown> extends true ? [1] : [])]
    >;

type Arity<T> = T extends HKTWithArity<number>
  ? EQUALS<T['TypeArguments']['length'], number> extends true
    ? number
    : CountUnknown<T['TypeArguments']>
  : 0;

interface MapHKT extends HKTWithArity<2> {
  type: Map<this['TypeArguments'][0], this['TypeArguments'][1]>;
}

type AnotherMapHKT<
  TypeArguments extends MakeArityConstraint<2> = MakeArityConstraint<2>,
> = { type: Map<TypeArguments[0], TypeArguments[1]> };

type TestSingleApplicationArity = [
  Expect<EQUALS<Kind<MapHKT, string>['type'], Map<string, unknown>>>,
  Expect<EQUALS<Kind<MapHKT, number>['type'], Map<number, unknown>>>,
];
type TestArity = [
  Expect<EQUALS<Arity<PartialApply<ArrayHKT, [string]>>, 0>>,
  Expect<EQUALS<Arity<number>, 0>>,
  Expect<EQUALS<Arity<[string, number]>, 0>>,
  Expect<EQUALS<Arity<ArrayHKT>, 1>>,
  Expect<EQUALS<Arity<HKT>, number>>,
  Expect<EQUALS<Arity<MapHKT>, 2>>,
];

type TestApplication = [
  Expect<EQUALS<PartialApply<ArrayHKT, [string]>, string[]>>,
  Expect<EQUALS<Arity<PartialApply<MapHKT, [string]>>, 1>>,
  Expect<EQUALS<PartialApply<MapHKT, [string, number]>, Map<string, number>>>,
  Expect<
    EQUALS<PartialApply<MapHKT, [string, number, string]>, Map<string, number>>
  >,
  Expect<
    EQUALS<
      PartialApply<PartialApply<MapHKT, [string]>, [number]>,
      Map<string, number>
    >
  >,
];

// FIXME
type failed = PartialApply<PartialApply<MapHKT, [string]>, [number]>;
//   ^?
