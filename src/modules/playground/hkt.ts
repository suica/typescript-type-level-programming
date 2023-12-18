import { EQUALS } from '../vm/utils/nat';

// code adapted from https://www.effect.website/docs/behaviour/hkt#what-are-higher-kinded-types

type MakeArityConstraint<
  T extends number,
  res_nat extends unknown[] = [],
> = T extends 0
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
export interface ArrayHKT extends HKT {
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

type Test1 = Kind<ArrayHKT, string>; // Applying ArrayTypeLambda to string
//   ^?
type Test2 = Kind<ArrayHKT, number>; // Applying ArrayTypeLambda to number
//   ^?
interface Mappable<F extends HKT> {
  readonly map: <A, B>(self: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
}

const stringify =
  <F extends HKT>(T: Mappable<F>) =>
  (self: Kind<F, number>): Kind<F, string> =>
    T.map(self, (n) => `number: ${n}`);
