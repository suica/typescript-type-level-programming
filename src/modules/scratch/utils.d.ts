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

type Select2Way<index extends boolean, first, second> = index extends true
  ? first
  : second;

type EnsureArr<T extends any[] | any> = T extends any[] ? T : T[];

type AssertNumber<T extends number> = T extends number ? number : never;
type Eval<
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

type EvalSingleStmt<
  env extends EnvConcept,
  expr extends ExprConcept,
  __returns extends EnvConcept = expr extends BindExprConcept
    ? UpdateEnv<env, [Omit<expr, 'kind'>], []>
    : expr extends EmptyStmtConcept
    ? env // do nothing
    : expr extends BinaryExprConcept
    ? EvalBinaryExpr<env, expr>
    : expr extends IfStmtConcept
    ? env
    : expr extends ValueExprConcept
    ? UpdateEnv<env, [], [expr['value']]>
    : expr extends IdentifierConcept
    ? UpdateEnv<env, [], [Lookup<env, expr['name']>]>
    : never,
> = __returns;

type TestValSingleStmt = [
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

type _MatchBranch = [cond: boolean, result: any];
type MatchCase<T extends _MatchBranch[]> = T extends []
  ? never
  : T extends [infer head, ...infer tail extends _MatchBranch[]]
  ? head extends [true, infer matched_output]
    ? matched_output
    : MatchCase<tail>
  : never;

type TestMatchCase = [
  Expect<EQUALS<MatchCase<[[true, 2]]>, 2>>,
  Expect<EQUALS<MatchCase<[[false, 2]]>, never>>,
  Expect<EQUALS<MatchCase<[]>, never>>,
  Expect<EQUALS<MatchCase<[[false, 2], [true, 3]]>, 3>>,
];

type NatLiteralConcept = MakeValueExpr<NatConcept>;
type EvalBinaryExpr<
  env extends EnvConcept,
  expr extends BinaryExprConcept,
  __evaluated_expr extends ValueConcept = [
    expr['op'],
    expr['left'],
    expr['right'],
  ] extends [
    infer op extends '+' | '-' | '<=' | '<',
    infer _left extends NatLiteralConcept,
    infer _right extends NatLiteralConcept,
  ]
    ? MatchCase<
        [
          [EQUALS<op, '+'>, Add<_left['value'], _right['value']>],
          [EQUALS<op, '-'>, Sub<_left['value'], _right['value']>],
          [EQUALS<op, '<='>, Lte<_left['value'], _right['value']>],
          [EQUALS<op, '<'>, Lt<_left['value'], _right['value']>],
        ]
      >
    : never,
  __returns extends EnvConcept = EvalSingleStmt<
    env,
    MakeValueExpr<__evaluated_expr>
  >,
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
type ValueConcept = NatConcept | boolean;

type Binding = { name: string; value: ValueConcept };
type BindingStack = Binding[];
type MakeBinding<
  name extends string,
  value extends ValueConcept,
  __returns extends Binding = {
    name: name;
    value: value;
  },
> = __returns;
type MakeEnv<
  T extends boolean,
  B extends BindingStack = [],
  S extends ValueConcept[] = [],
  __returns extends EnvConcept = {
    return: T;
    bindings: B;
    stack: S;
  },
> = __returns;
type EnvConcept = MakeEnv<boolean, BindingStack, ValueConcept[]>;
type UpdateEnv<
  env extends EnvConcept,
  bindings extends Binding[] = [],
  values extends ValueConcept[] = [],
  __returns extends EnvConcept = {
    bindings: [...bindings, ...env['bindings']];
    return: env['return'];
    stack: [...values, ...env['stack']];
  },
> = __returns;

type SyntaxKind = ExprConcept['kind'];

type BinaryExprConcept = {
  kind: 'BinaryOperator';
  op: '+' | '-' | '<=' | '<';
  left: ExprConcept;
  right: ExprConcept;
};
type BindExprConcept = {
  kind: 'bind';
  name: string;
  value: ValueConcept;
};

type IfStmtConcept = {
  kind: 'IfStmt';
  condition: ExprConcept;
  alternate: ExprConcept[];
};
type EmptyStmtConcept = { kind: 'empty' };

type IdentifierConcept = {
  kind: 'Identifier';
  name: string;
};

type ValueExprConcept = {
  kind: 'ValueLiteral';
  value: ValueConcept;
};
type MakeValueExpr<
  T extends ValueConcept,
  __returns extends ValueExprConcept = {
    kind: 'ValueLiteral';
    value: T;
  },
> = __returns;

type ExprConcept =
  | ValueExprConcept
  | IdentifierConcept
  | BinaryExprConcept
  | BindExprConcept
  | EmptyStmtConcept
  | IfStmtConcept;

type TempAnonymousLoop<
  env extends EnvConcept,
  init extends ExprConcept = EmptyStmtConcept,
  test extends ExprConcept = EmptyStmtConcept,
  update extends ExprConcept = EmptyStmtConcept,
  body extends ExprConcept[] = [EmptyStmtConcept],
  __evaluated_test extends EnvConcept = Eval<env, test>,
  __return extends EnvConcept = env,
> = EQUALS<init, EmptyStmtConcept> extends true
  ? // no need to init, test first
    Eval<env, test> extends MakeEnv<
      infer __should_return,
      infer bindings,
      infer stack
    >
    ? { stack: stack }
    : never
  : TempAnonymousLoop<Eval<env, init>, EmptyStmtConcept, test, update, body>;

type _SampleEnv = MakeEnv<false, [{ name: 'i'; value: MakeNat<0> }]>;
type C = TempAnonymousLoop<
  _SampleEnv,
  EmptyStmtConcept,
  EmptyStmtConcept,
  EmptyStmtConcept
>;

// Select2Way<Eval<__init_env, test>, Eval<env, test>, Eval<env, update>>;

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

type IsEmptyList<
  T extends any[],
  __returns extends boolean = EQUALS<HEAD<T>, never>,
> = __returns;

type Lookup<
  env extends EnvConcept,
  name extends string,
  rest_variables extends BindingStack = env['bindings'],
  __returns extends ValueConcept = rest_variables extends [
    infer head,
    ...infer tail extends BindingStack,
  ]
    ? head extends { name: name; value: infer value }
      ? value
      : Lookup<env, name, tail>
    : never,
> = __returns;
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
