import { Add } from "../vm/utils/nat";

type Nat = Array<1>;

interface HKT {
  readonly In1: unknown;
  readonly In2: unknown;
}

type Apply<F extends HKT, In1, In2> = F extends {
  readonly type: unknown;
}
? (F & {
      readonly In1: In1;
      readonly In2: In2;
    })['type']
  : never;

interface BasicAddHKT extends HKT {
  // @ts-expect-error Type 'this["In1"]' does not satisfy the constraint 'Nat'.ts(2344)
  type: Add<this['In1'], this['In2']>;
}

type Assert<T, P> = T extends P ? T : never;
interface AddHKT extends HKT {
  type: Add<Assert<this['In1'], Nat>, Assert<this['In2'], Nat>>;
}
type Three = Apply<AddHKT, [1], [1, 1]>['length']; // 3
