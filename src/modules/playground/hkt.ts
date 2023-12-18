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

export interface HKT {
  readonly TypeArgument: unknown;
  readonly type?: unknown;
}
export interface ArrayHKT extends HKTWithArity<1> {
  readonly type: Array<this['TypeArgument']>;
}
type Kind<F extends HKT, TypeArgument> = F extends {
  readonly type: unknown;
}
  ? (F & {
      readonly TypeArgument: TypeArgument;
    })['type']
  : {
      readonly F: F;
      readonly invariance: (_: TypeArgument) => TypeArgument;
    };

type TestSingleApplication = [
  Expect<EQUALS<Kind<ArrayHKT, string>, string[]>>,
  Expect<EQUALS<Kind<ArrayHKT, number>, number[]>>,
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

interface HKTWithArity<arity extends number> extends HKT {
  readonly TypeArguments: MakeArityConstraint<arity>;
}
type PartialApply<lambda, arguments extends unknown[]> = EQUALS<
  arguments['length'],
  number
> extends true
  ? unknown
  : lambda extends HKT
  ? PartialApply<Kind<lambda, arguments[0]>, TAIL<arguments>>
  : lambda;

type Arity<T> = T extends HKTWithArity<number>
  ? T['TypeArguments']['length']
  : 0;

interface MapHKT extends HKTWithArity<2> {
  type: Map<this['TypeArguments'][0], this['TypeArguments'][1]>;
}

type TestArity = [
  Expect<EQUALS<Arity<PartialApply<ArrayHKT, [string]>>, 0>>,
  Expect<EQUALS<Arity<number>, 0>>,
  Expect<EQUALS<Arity<[string, number]>, 0>>,
  Expect<EQUALS<Arity<ArrayHKT>, 1>>,
  Expect<EQUALS<Arity<HKT>, 0>>,
];

type TestApplication = [
  Expect<EQUALS<PartialApply<ArrayHKT, [string]>, string[]>>,
  Expect<EQUALS<PartialApply<MapHKT, [string, number]>, Map<string, number>>>,
];

// FIXME
type failed = PartialApply<MapHKT, [string, number]>;
//   ^?
