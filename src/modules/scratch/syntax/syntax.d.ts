import { Expect } from '@type-challenges/utils';
import { __NatToNumericLiteralType } from '../utils/helper';
import { Add, EQUALS } from '../utils/nat';
import { ValueConcept } from './env';

export type NatConcept = number[];
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

type SyntaxKind = ExprConcept['kind'];

export type BinaryExprConcept = {
  kind: 'BinaryOperator';
  op: '+' | '-' | '<=' | '<';
  left: ExprConcept;
  right: ExprConcept;
};
export type BindExprConcept = {
  kind: 'bind';
  name: string;
  value: ValueConcept;
};

export type IfStmtConcept = {
  kind: 'IfStmt';
  condition: ExprConcept;
  alternate: ExprConcept[];
};
export type EmptyStmtConcept = { kind: 'empty' };

export type IdentifierConcept = {
  kind: 'Identifier';
  name: string;
};

export type ValueExprConcept = {
  kind: 'ValueLiteral';
  value: ValueConcept;
};
export type MakeValueExpr<
  T extends ValueConcept,
  __returns extends ValueExprConcept = {
    kind: 'ValueLiteral';
    value: T;
  },
> = __returns;

export type ExprConcept =
  | ValueExprConcept
  | IdentifierConcept
  | BinaryExprConcept
  | BindExprConcept
  | EmptyStmtConcept
  | IfStmtConcept;
