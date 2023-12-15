import { Eval } from "../eval";
import { EnvConcept, MakeEnv } from "./env";
import { EQUALS } from "./nat";
import { ExprConcept, EmptyStmtConcept, MakeNat } from "./syntax";

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
