import { NatConcept } from './syntax';

export type Add<A extends NatConcept, B extends NatConcept> = [...A, ...B];
export type Sub<A extends NatConcept, B extends NatConcept> = A extends [
  ...B,
  ...infer C,
]
  ? C
  : [];
export type Lte<A extends NatConcept, B extends NatConcept> = Sub<
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

export type Lt<A extends NatConcept, B extends NatConcept> = Lte<
  A,
  B
> extends []
  ? EQUALS<A, B> extends false
    ? true
    : false
  : false;
