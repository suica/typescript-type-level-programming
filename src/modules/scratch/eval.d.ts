import { Expect } from '@type-challenges/utils';
import { EnvConcept, Lookup, UpdateEnv, ValueConcept } from './syntax/env';
import { _SampleEnv } from './syntax/loop';
import {
  BinaryExprConcept,
  BindExprConcept,
  EmptyStmtConcept,
  ExprConcept,
  IdentifierConcept,
  IfStmtConcept,
  MakeNat,
  MakeValueExpr,
  NatConcept,
  ValueLiteralConcept,
} from './syntax/syntax';
import { EnsureArr, IsEmptyList, MatchCase } from './utils/helper';
import { Add, EQUALS, Lt, Lte, Sub } from './utils/nat';

export type Eval<
  env extends EnvConcept,
  expr extends ExprConcept[] | ExprConcept,
  _input extends ExprConcept[] = EnsureArr<expr>,
  __result extends any = IsEmptyList<_input> extends true
    ? // no stmt, do nothing
      env
    : // get first element to process
    _input extends [
        infer head extends ExprConcept,
        ...infer tail extends ExprConcept[],
      ]
    ? // TODO: test "return" state and decided whether to stop ?
      Eval<EvalSingleStmt<env, head>, tail>
    : never,
> = __result;

export type EvalSingleStmt<
  env extends EnvConcept,
  expr extends ExprConcept,
  __returns extends EnvConcept = expr extends BindExprConcept
    ? UpdateEnv<env, [Omit<expr, 'kind'>], []>
    : expr extends EmptyStmtConcept
    ? env // do nothing
    : expr extends BinaryExprConcept
    ? EvalBinaryExpr<env, expr>
    : expr extends IfStmtConcept
    ? EvalIfStmt<env, expr>
    : expr extends ValueLiteralConcept
    ? UpdateEnv<env, [], [expr['value']]>
    : expr extends IdentifierConcept
    ? UpdateEnv<env, [], [Lookup<env, expr['name']>]>
    : never,
> = __returns;

type TestEvalBinaryExpr = [
  Expect<
    EQUALS<
      EvalBinaryExpr<
        _SampleEnv,
        {
          kind: 'BinaryOperator';
          op: '+';
          left: MakeValueExpr<MakeNat<1>>;
          right: MakeValueExpr<MakeNat<2>>;
        }
      >['stack'],
      [MakeNat<3>]
    >
  >,
];

export type TestEvalSingleStmt = [
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
    infer __left extends __nat_literal_concept,
    infer __right extends __nat_literal_concept,
  ]
    ? MatchCase<
        [
          [EQUALS<op, '+'>, Add<__left['value'], __right['value']>],
          [EQUALS<op, '-'>, Sub<__left['value'], __right['value']>],
          [EQUALS<op, '<='>, Lte<__left['value'], __right['value']>],
          [EQUALS<op, '<'>, Lt<__left['value'], __right['value']>],
        ]
      >
    : never,
  __returns extends EnvConcept = EvalSingleStmt<
    env,
    MakeValueExpr<__evaluated_expr>
  >,
> = __returns;

type EvalIfStmt<
  env extends EnvConcept,
  expr extends IfStmtConcept,
  __evaluated_condition = Eval<env, expr['test']>,
  __returns extends EnvConcept = unknown,
> = __returns;
