import { Expect } from '@type-challenges/utils';
import {
  EnvConcept,
  Lookup,
  ReadOffTempValue,
  UpdateEnv,
  ValueConcept,
} from './syntax/env';
import { _SampleEnv } from './syntax/loop';
import {
  AssignmentConcept,
  BinaryExprConcept,
  BindExprConcept,
  EmptyStmtConcept,
  ExprConcept,
  IdentifierConcept,
  IfStmtConcept,
  MakeIdentifier,
  MakeNat,
  MakeValueExpr,
  NatConcept,
  ValueLiteralConcept,
  ZERO,
} from './syntax/syntax';
import { MatchCase } from './utils/helper';
import { Add, EQUALS, Lt, Lte, Sub } from './utils/nat';

// TODO: test "return" state and decided whether to stop ?
export type Eval<
  env extends EnvConcept,
  expr extends ExprConcept[],
> = expr extends [
  infer head extends ExprConcept,
  ...infer tail extends ExprConcept[],
]
  ? Eval<EvalSingleStmt<env, head>, tail>
  : env;

export type EvalSingleStmt<
  env extends EnvConcept,
  expr extends ExprConcept,
> = EQUALS<expr, ExprConcept> extends true
  ? never
  : expr extends BindExprConcept
  ? UpdateEnv<env, [Omit<expr, 'kind'>], []>
  : expr extends EmptyStmtConcept
  ? env
  : expr extends BinaryExprConcept
  ? EvalBinaryExpr<env, expr>
  : expr extends IfStmtConcept
  ? EvalIfStmt<env, expr>
  : expr extends ValueLiteralConcept
  ? UpdateEnv<env, [], [expr['value']]>
  : expr extends IdentifierConcept
  ? UpdateEnv<env, [], [Lookup<env, expr['name']>]>
  : expr extends AssignmentConcept
  ? EvalAssignment<env, expr>
  : never;

type TestEvalBinaryExpr = [
  Expect<
    EQUALS<
      ReadOffTempValue<
        EvalBinaryExpr<
          _SampleEnv,
          {
            kind: 'BinaryOperator';
            op: '+';
            left: MakeValueExpr<MakeNat<1>>;
            right: MakeValueExpr<MakeNat<2>>;
          }
        >
      >,
      MakeNat<3>
    >
  >,
];

type A = Eval<
  _SampleEnv,
  [
    {
      kind: 'IfStmt';
      test: MakeValueExpr<true>;
      consequent: [MakeValueExpr<MakeNat<1>>];
      alternate: [MakeValueExpr<MakeNat<2>>];
    },
  ]
>;

export type TestEvalSingleStmt = [
  Expect<
    EQUALS<ReadOffTempValue<Eval<_SampleEnv, [MakeIdentifier<'i'>]>>, ZERO>
  >,
  EvalSingleStmt<
    _SampleEnv,
    {
      kind: 'BinaryOperator';
      op: '+';
      left: MakeValueExpr<MakeNat<1>>;
      right: MakeValueExpr<MakeNat<2>>;
    }
  >,
  Expect<EQUALS<EvalSingleStmt<_SampleEnv, EmptyStmtConcept>, _SampleEnv>>,
  Expect<
    EQUALS<
      EvalSingleStmt<
        _SampleEnv,
        {
          kind: 'BinaryOperator';
          op: '+';
          left: MakeValueExpr<MakeNat<1>>;
          right: MakeValueExpr<MakeNat<2>>;
        }
      >,
      UpdateEnv<_SampleEnv, [], [MakeNat<3>]>
    >
  >,
  Expect<
    EQUALS<
      EvalSingleStmt<
        _SampleEnv,
        {
          kind: 'BinaryOperator';
          op: '+';
          left: MakeIdentifier<'i'>;
          right: MakeValueExpr<MakeNat<2>>;
        }
      >,
      UpdateEnv<_SampleEnv, [], [MakeNat<2>]>
    >
  >,
];

type EvalBinaryExpr<
  env extends EnvConcept,
  expr extends BinaryExprConcept,
  __nat_literal_concept extends MakeValueExpr<NatConcept> = MakeValueExpr<NatConcept>,
  __evaluated_expr extends ValueConcept = [
    expr['op'],
    expr['left'],
    expr['right'],
  ] extends [
    infer op extends BinaryExprConcept['op'],
    infer __left extends ExprConcept,
    infer __right extends ExprConcept,
  ]
    ? [
        ReadOffTempValue<Eval<env, [__left]>>,
        ReadOffTempValue<Eval<env, [__right]>>,
      ] extends [infer l extends NatConcept, infer r extends NatConcept]
      ? MatchCase<
          [
            [EQUALS<op, '+'>, Add<l, r>],
            [EQUALS<op, '-'>, Sub<l, r>],
            [EQUALS<op, '<='>, Lte<l, r>],
            [EQUALS<op, '<'>, Lt<l, r>],
          ]
        >
      : never
    : never,
> = EvalSingleStmt<env, MakeValueExpr<__evaluated_expr>>;

type TestReadOffTempValue = [
  Expect<EQUALS<ReadOffTempValue<_SampleEnv>, MakeNat<1>>>,
];

type EvalIfStmt<
  env extends EnvConcept,
  expr extends IfStmtConcept,
> = EvalSingleStmt<
  env,
  expr['test']
> extends infer __env_after_test extends EnvConcept
  ? ReadOffTempValue<__env_after_test> extends true
    ? Eval<__env_after_test, expr['consequent']>
    : Eval<__env_after_test, expr['alternate']>
  : never;

type EvalAssignment<
  env extends EnvConcept,
  expr extends AssignmentConcept,
> = UpdateEnv<
  env,
  [
    {
      name: expr['left']['name'];
      value: ReadOffTempValue<Eval<env, [expr['right']]>>;
    },
  ],
  []
>;
