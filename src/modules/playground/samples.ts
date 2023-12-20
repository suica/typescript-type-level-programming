import { HKTWithArity, PartialApply } from "./hkt";
import { $, Fixed, _0, _1 } from "./hkts";

type Nat = Array<1>;
type IsNotEmpty<a extends any[]> = a['length'] extends 0 ? false : true;
type Head<a extends any[]> = a extends [infer head, ...infer tail]
  ? head
  : never;
type Tail<a extends any[]> = a extends [infer head, ...infer tail] ? tail : [];
type Add<a extends Nat, b extends Nat> = [...a, ...b];

type Zero = [];
type LengthOfZero = Zero['length']; // 得到 0
type One = [1];
type LengthOfOne = One['length']; // 得到 1
type Two = [1, 1];


type BadFold<
  nums extends Nat[],
  f,
  acc extends Nat = [],
> = IsNotEmpty<nums> extends true
  //@ts-expect-error
  ? BadFold<Tail<nums>, f, f<acc, Head<nums>>>
  : acc;
//@ts-expect-error
type TestBadFold = BadFold<[One, Two], Add>;

type AssertNat<T> = T extends Nat ? T : never;

type Assert<T, P> = T extends P ? T : never;
export interface AddHKT extends HKTWithArity<2> {
  type: Add<Assert<this['TypeArguments'][0], Nat>, Assert<this['TypeArguments'][1], Nat>>;
}

type ShouldBeThree = PartialApply<AddHKT, [One, Two]>['length'];
//   ^?
