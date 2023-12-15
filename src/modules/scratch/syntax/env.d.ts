import { Expect } from '@type-challenges/utils';
import { EQUALS } from '../utils/nat';
import { MakeNat, NatConcept } from './syntax';
export type ValueConcept = NatConcept | boolean;
export type Binding = { name: string; value: ValueConcept };
export type BindingStack = Binding[];
export type MakeBinding<
  name extends string,
  value extends ValueConcept,
  __returns extends Binding = {
    name: name;
    value: value;
  },
> = __returns;
export type MakeEnv<
  T extends boolean,
  B extends BindingStack = [],
  S extends ValueConcept[] = [],
  __returns extends EnvConcept = {
    return: T;
    bindings: B;
    stack: S;
  },
> = __returns;
export type EnvConcept = MakeEnv<boolean, BindingStack, ValueConcept[]>;

export type UpdateEnv<
  env extends EnvConcept,
  bindings extends Binding[] = [],
  values extends ValueConcept[] = [],
  __returns extends EnvConcept = {
    bindings: [...bindings, ...env['bindings']];
    return: env['return'];
    stack: [...values, ...env['stack']];
  },
> = __returns;

export type Lookup<
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
