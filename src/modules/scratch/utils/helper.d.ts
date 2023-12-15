import { type Expect } from '@type-challenges/utils';
import { NatConcept } from '../syntax/syntax';
import { EQUALS } from './nat';
export type __NatToNumericLiteralType<T extends NatConcept> = T['length'];
export type EnsureArr<T extends any[] | any> = T extends any[] ? T : T[];
export type _MatchBranch = [cond: boolean, result: any];
export type MatchCase<T extends _MatchBranch[]> = T extends []
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

export type IsEmptyList<
  T extends any[],
  __returns extends boolean = EQUALS<HEAD<T>, never>,
> = __returns;
