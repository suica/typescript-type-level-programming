# 理解 TypeScript 类型编程

## 简介

文本试图说明：

1. 值编程和类型编程在本质上没有什么区别，TypeScript 的类型编程仅仅是在 TypeScript 类型空间中的编程。通过建立 TypeScript 类型编程和值编程的对应关系，开发者可以很容易地掌握 TypeScript 类型编程。
2. JavaScript 的函数在类型编程中对应泛型类型。高阶函数则对应高阶类型。TypeScript 类型系统本身不支持高阶类型，通过编码可以在某种程度上实现高阶类型。在理论上，我们可以通过设计一个翻译器来实现 JavaScript 上的运行时计算过程到 TypeScript 类型编译期计算过程的翻译。
3. 通过对 TypeScript 类型编程的研究，和适当的类型编程实践，开发者可以更好地掌握 TypeScript 这门语言，实现对业务的精准建模，写出更好的代码。

## 类型编程的基本概念

首先，我们需要定义清楚什么是类型编程。

### TypeScript 的值空间和类型空间

为了定义什么是类型编程，我们需要引入一对概念：值空间和类型空间。

TypeScript 不仅为 JavaScript 引入了一些新的语法和特性，最重要的是附加了一个静态的、强的类型系统，让 JavaScript 代码库也能够得到类型检查和现代化的语言服务。
TypeScript 的编译器`tsc`在编译代码时，会对代码进行类型检查，擦除 TypeScript 源码上的类型信息并将新语法和特性转译为可被 JavaScript 解释器执行的 JavaScript 代码。

一份典型的 TypeScript 代码，由在编译期和运行时这两个不同时期执行的子语言交织而成。这两个语言分别负责 TypeScript 这门语言的静态语义和动态语义。

1. 类型语言。它包括 JavaScript 中不存在的语法成分：如，类型别名关键字`type`和取类型操作符`typeof`，泛型的实例化记号`<>`，`:`和`enum`等。
   1. 它在编译期通过类型检查器的类型检查被执行，执行规则由类型检查器所隐式表示的定型规则定义。承担了 TypeScript 的静态语义。
2. JavaScript，姑且称之为值语言。它在运行时被 JavaScript 运行环境执行，承担了 TypeScript 的动态语义。

如下面这份代码中，类型定义`type States = Array<State>;`和类型标注`: States`就是类型语言中的成分，不是合法的 JavaScript 成分，在 JavaScript 中并不存在；
而`concat([1], [2])`则是 JavaScript 中的成分，不是合法的类型语言中的成分。

```ts
enum State {
  Todo,
  Finished,
}
type States = Array<State>;
function mergeStates(a: States, b: States): States {
  return [...a, ...b];
}
const result = mergeStates([State.Todo], [State.Finished]);
type Result = typeof result;
```

其 JavaScript 的部分为：

```js
const State = {
  Todo: 0,
  Finished: 1,
  0: 'Todo',
  1: 'Finished',
};
function mergeStates(a, b) {
  return [...a, ...b];
}
const result = mergeStates([State.Todo], [State.Finished]);
```

其类型语言的部分：

```ts
enum State {
  Todo,
  Finished,
}
type States = Array<State>;
declare function mergeStates(a: States, b: States): States;
declare const result: States;
type Result = typeof result;
```

这两个子语言可以各自独立存在，独立执行。这自然地将 TypeScript 分为了值空间和类型空间。当我们考虑 TypeScript 中的一个项时，它可能仅属于值空间，也可能仅属于类型空间，又或是同时属于类型空间和值空间。例如：

1. 常量`result`是值，仅属于值空间。
1. 类型`States`是类型，仅属于类型空间。
1. 作为类构造器的`Array`，它既是值空间中的函数、类构造器，又是类型语言中的一个泛型类型；
1. 作为枚举`enum`的`State`，它既是值空间中的一个 Object，又是类型语言中的一个枚举类型。

值空间中的项可以单向地转换为类型空间中的项，例如：

1. 通过类型语言中的`typeof`运算符，我们可以获取一个值空间中的符号的类型，得到的类型仅存在于值空间。在 TypeScript 中，仅存在于类型空间的项无法对值空间产生影响。

以上这些概念可以通过下图概括：

(示意图)

### 类型编程

类型编程 (Type-level Programming)就是用编程的方式，操作类型空间中的类型。而值编程（Value-level Programming, 即一般的编程），操作的是值空间中的值。

类型编程在函数式编程语言社区由来已久，人们对 Haskell 和 Scala 的类型编程就有深入的研究，因为它们有着较强的静态类型系统。早在 2006 年，一个 Haskell Wiki 的页面中[^OOP-vs-type-classes]，就已经在使用 Type Gymnastics(类型体操)来指代那些复杂烧脑的类型操作。下面列举了这些社区中一些常见的类型编程主题：

[^OOP-vs-type-classes]: https://wiki.haskell.org/OOP_vs_type_classes

1. Church 编码 [^thinking-with-types] [^type-level-programming-in-scala]
1. Peano 数所构建的自然数类型，及其上的递归函数和算术 [^thinking-with-types] [^type-level-programming-in-scala]
1. 井字棋(Tic-Tac-Toe) [^type-level-programming-in-scala]
1. 存在类型（Existential Types）[^thinking-with-types]
1. 高阶类型(Higher-kinded Types) [^thinking-with-types]
1. 广义代数数据类型(GADTs) [^thinking-with-types]
1. 依赖类型(Dependent Types) [^thinking-with-types]

[^thinking-with-types]: https://leanpub.com/thinking-with-types
[^type-level-programming-in-scala]: https://apocalisp.wordpress.com/2010/06/08/type-level-programming-in-scala/

> 注：关于类型体操这个说法是否有更早的来源，以及它和英文中 Mental Gymnastics 以及在俄语圈中据传是 Alexander Suvorov 所说的"数学是思维的体操(Математика - гимнастика ума)"的关系，暂时无法考证。如果读者有线索，可以联系我们。

函数式编程社区和学术界靠的比较近，而 TypeScript 社区则和工业界更近。随着 TypeScript 自身类型系统的能力和在 Web 应用开发者社区的影响力日渐增强，社区对 TypeScript 类型编程的研究文章和项目也逐渐增多。

国外社区里：

1. TypeScript's Type System is Turing Complete[^TypeScripts-Type-System-is-Turing-Complete]。早期关于 TypeScript 的类型系统的图灵完备性的讨论，是理解 TypeScript 类型编程绕不开的一篇文章。
1. HypeScript[^HypeScript]。一个纯由 TypeScript 类型实现的，TypeScript 解析器和类型检查器。
1. Meta-typing[^meta-typing]。收集了非常多类型编程的例子，包括排序（插入、快速、归并）、数据结构（列表、二叉树）、自然数算术以及一些谜题（迷宫、N 皇后）等等。
1. Type-challenges[^type-challenges]。一个带有在线判题功能的，具有难度标记的 TypeScript 类型编程习题集。包括简单到中等的常用的工具类型（`Awaited`、`Camelize`）的实现，和一些比较困难的问题（`Vue`的 this 类型，整数大小比较，`JSON`解析器）。这个仓库包括了几乎所有 TypeScript 类型编程可能用到的知识和技巧，可以当成类型编程的速查表使用。
1. Type-gymnastics[^type-gymnastics]。包括 URL 解析器、整数大小比较等问题的解答。
1. HKTS[^HKTS]。在 TypeScript 的类型系统中编码高阶类型。关于高阶类型是什么，我们之后会讨论。
1. Effect[^Effect]。通过类型编程实现类型安全的副作用管理。其中也使用到了高阶类型。
1. 国际象棋[^Chesskell]。通过类型编程实现了一个双人国际象棋。

[^TypeScripts-Type-System-is-Turing-Complete]: https://github.com/microsoft/TypeScript/issues/14833
[^HypeScript]: https://github.com/ronami/HypeScript
[^meta-typing]: https://github.com/ronami/meta-typing
[^Type-Challenges]: https://github.com/type-challenges/type-challenges
[^type-gymnastics]: https://github.com/g-plane/type-gymnastics
[^HKTS]: https://github.com/pelotom/hkts
[^Effect]: https://github.com/Effect-TS/effect
[^Chesskell]: https://dl.acm.org/doi/10.1145/3471874.3472987

在国内的 TypeScript 社区里也有一些非常有教益的文章（集）：

1. 中国象棋[^type-chess]。如何通过类型编程实现一个中国象棋。
2. Lisp 解释器[^lisp-interpreter]。
3. 《Effective TypeScript：使用 TypeScript 的 n 个技巧》[^effective-ts-zhihu]。
4. "来玩 TypeScript 啊，机都给你开好了！"[^zhihu-typescript]。是一个知乎上的 TypeScript 专栏。

[^type-chess]: https://github.com/chinese-chess-everywhere/type-chess
[^lisp-interpreter]: https://zhuanlan.zhihu.com/p/427309936
[^zhihu-typescript]: https://www.zhihu.com/column/c_206498766
[^effective-ts-zhihu]: https://zhuanlan.zhihu.com/p/104311029

### 重新思考类型编程的价值

谈到类型编程，有一个避不开的问题：类型编程究竟是没事找事的消遣，还是对开发者来说真有其价值？

本文对此持实用主义的立场：进行恰当的类型编程确实有其价值。

仅仅只是将值编程中非常容易实现的事情用类型编程重写一遍的类型体操，纯粹是为了消遣或者在理论上验证一个想法，很难说具有什么实用价值。

而对库设计的场景来说，一个有一定复杂度的类型带来的很可能是类型安全的接口和开发者良好的补全体验，更不用说能够把许多潜在的错误在编译期暴露出来了。举个例子，若是 Vue 2 在一开始就通过类型编程提供完善的类型定义，甚至为了类型安全反过来约束框架本身的设计，那么开发者就不必在使用 TypeScript 时面对满屏幕的 any 了，也能够将一些不合法的调用拦在编译期。

再考虑业务开发的场景。假定我们需要写一个流程管理逻辑，由多个函数组成。我们必须要按照一定的顺序来组织这些流程。这就非常适合使用类型编程。例子改编自[^write-you-a-typescript]：

[^write-you-a-typescript]: https://github.com/suica/write-you-a-typescript

```ts
type Code = { fileList: string[]; addedTime: Date };
declare const LintInternalSymbol: unique symbol;
type Linted<T> = T & { [LintInternalSymbol]: undefined };
declare function lint<T extends Code>(code: T): Linted<Code>;
declare function commit(code: Linted<Code>): Promise<void>;

declare const code: Code;

commit(code); // 类型错误，报错

commit(lint(code)); // 正确，不报错
```

总的来说，类型只是一个极为有效的对代码进行静态约束、对业务进行建模的手段。我们更应该把类型编程的一些技巧类比成设计模式(Design Patterns)：模式不是目的，而是手段。过犹不及，我们不应该为了去使用某个模式而设计，而应当使用模式去改善我们的设计，让我们的设计不多也不少，刚好能够精确地描述业务本身。

> 往对象上添加元信息来模拟名义类型 (Nominal Type)的这种技巧俗称"打标"(Tagging)。 这些类型编程的具体技巧不是本文的关注点，不会过多介绍。

## 方法

那么，我们应该如何理解 TypeScript 中的类型编程？

### TypeScript 到其类型系统的嵌入

#### 值编程-类型编程的对应关系

| 值编程的元素                                                                                          | 类型编程的元素                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 常量声明 `const a = ...`                                                                              | 类型声明 `type a = ...`                                                                                                                                             |
| 实例测试 `a instanceof b`                                                                             | 条件类型 `a extends b ? ... : ...`                                                                                                                                  |
| 布尔表达式条件语句 `if (a) {b} else {c}`                                                              | 条件类型 `a extends true ? b : c`                                                                                                                                   |
| 函数定义 `function A(b) {...}`                                                                        | 泛型定义 `type A<T> = ...;`                                                                                                                                         |
| 函数参数和返回值的类型标注 `function A(b: Ty): C {...}`                                               | 泛型参数类型和返回值类型标注 `type A<T extends Ty, _returns extends C = ...> = _returns;`                                                                           |
| 函数应用 `A(b)`                                                                                       | 泛型实例化 `A<b>`                                                                                                                                                   |
| 列表 `[]`                                                                                             | 元组 `[]`                                                                                                                                                           |
| 列表长度 `[].length`                                                                                  | 元组长度 `[]['length']`                                                                                                                                             |
| 字面量 `1`                                                                                            | 字面量类型 `type A = 1; type B = '字符串字面量';`                                                                                                                   |
| 自然数 `0`, `1`, `2`,...                                                                              | 一进制数 `type Nat = 1[]; type Zero = []; type One=[1]; type Two = [1, 1]; ...`                                                                                     |
| -                                                                                                     | 一进制数转换为字面量类型 `One['length']`                                                                                                                            |
| 自然数加法 `const add = (a: number, b: number) => a + b`                                              | 元组连接 `type Add<a extends Nat, b extends Nat> = [...a, ...b];`                                                                                                   |
| 抛出异常 `throw`                                                                                      | 让计算过程返回`never`                                                                                                                                               |
| 模式匹配 (JavaScript 无此特性)                                                                        | 子类型测试中的类型推导 `arr extends [infer cur, ... infer rest] ? tail : never`                                                                                     |
| 严格相等 `_.equal(a, b)`                                                                              | `Equal` 工具泛型 `Equal<a, b>`                                                                                                                                      |
| `reduce`实现迭代 `const sum = (nums: number[], init: number)=>nums.reduce((acc,cur)=> acc+cur, init)` | 使用递归泛型模拟迭代过程 `type Sum<arr extends Nat[], result extends Nat = Zero> = arr extends [infer cur, ... infer rest] ? Sum<rest, Add<result, cur>> : result;` |
| 高阶函数 const apply1 = (f, arg) => f(arg)                                                            | 编码高阶类型 `type Apply1<f, arg> = $<f, arg>;`                                                                                                                     |

> 注：
>
> 1. 类型编程的元素一栏中，有些代码块并不是完整的，需要将其声明为一个类型，即在前面加上`type XXX = `才符合 TypeScript 的类型语言语法。
> 1. 泛型类型也可以理解为类型层面的函数，因为它接受一些类型返回另外一个类型，正如值空间中的函数接受一些值返回另外一个值。另可称呼为类型函数(Type Functions)、类型构造器(Type Constructors)、类型算子(Type Operators)，本文为了便于理解，采用了泛型类型的称呼。

自然数在 TypeScript 类型编程中的编码极为重要，因此我们着重介绍一下：

我们将自然数类型`Nat`定义为一个长度不定的数组，其中的元素的类型可以任意选取，这里我们选取`unknown`作为数组元素。

```ts
type Nat = Array<unknown>;
```

这样一来，值空间的以下值都是 `Nat` 类型的：

```ts
const zero: Nat = [];
const one: Nat = [1];
const two: Nat = [1, 1];
const three: Nat = [1, 1, 1];
```

`Nat`因为本质上是个 Array，我们若是取其`length`属性，会得到`number`，这也非常合理，因为 Array 的长度是不确定的，我们只知道他是个自然数。

```ts
type NatLength = Nat['length']; // 得到 number
```

接下来，我们会利用到 TypeScript 类型语言 的另外一个特性：元组。

元组是`Array`的特化形式，最重要的区别就是，元组是定长的：取元组的`length`会得到一个数字字面量类型。

```ts
type Zero = [];
type LengthOfZero = Zero['length']; // 得到 0
type One = [1];
type LengthOfOne = One['length']; // 得到 1
type Two = [1, 1];
type LengthOfTwo = Two['length']; // 得到 2
```

此时，我们就能够通过元组连接实现自然数加法：

```ts
type Add<a extends Nat, b extends Nat> = [...a, ...b];
type Three = Add<One, Two>;
type LengthOfThree = Three['length'];
```

另外，我们可以通过条件类型的`infer`关键字得到元组的第一项和去掉这一项的剩余元组。这个操作也非常常用，通常叫作`Head`和`Tail`：

```ts
type IsNotEmpty<a extends any[]> = a['length'] extends 0 ? false : true;
type Head<a extends any[]> = a extends [infer head, ...infer tail]
  ? head
  : never;
type Tail<a extends any[]> = a extends [infer head, ...infer tail] ? tail : [];
```

#### 高阶类型的困境

在 TypeScript 的值语言 (即，JavaScript) 中，我们可以构造高阶函数(Higher-order Functions)：也就是输入或者返回值为函数的函数。

```ts
function fold(nums: number[], f: (acc: number, cur: number) => number): number {
  let acc = 0;
  for (const num of nums) {
    acc = f(acc, num);
  }
  return acc;
}
```

上面，我们在 TypeScript 中实现了一个`fold`函数。它接受一个数字数组，和一个二元函数，将这个函数应用在"上一次应用的输出和数组的每一项上"，最后把结果返回。

毫无疑问，`fold`函数以函数为参数，因此它是一个高阶函数，像这种高阶函数在 TypeScript 的标准库和实践中比比皆是。

我们的问题是，我们在类型编程中如何使用高阶函数？我们如何将这种结构翻译到类型上？

一个最直接的想法是，既然我们将函数翻译成为了泛型类型，那我们直接将泛型类型作为泛型类型的类型参数传入即可。此时，泛型类型就成了接受泛型类型的类型。类型系统的这种能力叫作高阶类型(Higher-kinded Types, HKT)。

很遗憾，在目前的 TypeScript 中，这样的代码无法通过类型检查，因为 TypeScript 本身不支持 HKT，无法把泛型类型的参数(也就是`f`)标记为一个泛型，也不支持将未实例化的泛型传来传去。

```ts
type Fold<
  nums extends Nat[],
  f,
  acc extends Nat = [],
> = IsNotEmpty<nums> extends true
  ? Fold<Tail<nums>, f, f<acc, Head<nums>>> // 报错：Type 'f' is not generic.ts(2315)
  : acc;
type Test = Fold<[One, Two], Add>; // 报错：Generic type 'Add' requires 2 type argument(s).ts(2314)
```

若是要将一个类型作为泛型类型的参数使用，这个类型就必不能是未实例化的泛型，必须是一个具体的类型。也就是说，我们需要把代码改成如下样子：

```ts
type Fold<
  nums extends Nat[],
  f,
  acc extends Nat = [],
> = IsNotEmpty<nums> extends true
  ? Fold<Tail<nums>, f, Apply<f, [acc, Head<nums>]>>
  : acc;
type Test = Fold<[One, Two], AddHKT>;
// @ts-expect-error
type AddHKT = Add的无参数版，里面包含两个隐式的占位符?;
// @ts-expect-error
type Apply<f, arguments extends any[]> = 将arguments应用在f上???;
```

现在，让我们整理一下目标：

1. 找到一种将`Add`转换为`AddHKT`的方法。
2. 实现`Apply`。

完成了这两个目标，我们就成功地构造出了高阶类型，也就可以在类型编程中自由地传递泛型了。

#### 高阶类型的实现及其扩展

在 TypeScript 社区中，也有不少关于高阶类型的研究，其中较新的一个实现来自 Effect [^Effect-Higher-Kinded-Types].

下面定义了`HKT`这个 interface，用来表示有两个类型参数的泛型。可以看到，其`In1`和`In2`都是`unknown`类型的。

```ts
interface HKT {
  readonly In1: unknown;
  readonly In2: unknown;
}
```

`Apply`是一个泛型类型，接受一个`HKT`，和两个类型参数，负责将参数应用上去。

```ts
type Apply<F extends HKT, In1, In2> = F extends {
  readonly type: unknown;
}
  ? (F & {
      readonly In1: In1;
      readonly In2: In2;
    })['type']
  : never;
```

最后是这个方法的关键，`AddHKT`的实现：

```ts
interface BasicAddHKT extends HKT {
  // @ts-expect-error Type 'this["In1"]' does not satisfy the constraint 'Nat'.ts(2344)
  type: Add<this['In1'], this['In2']>;
}
type BasicAddHKT = Expect<Equal<Apply<AddHKT, [1], [1, 1]>['length'], 3>>;
```

其实现思路有如下要点：

1. 利用了`interface`具有类型上的`this`的特性，通过在`Apply`中增加对`In1`和`In2`的约束，让`In1`和`In2`从`unknown`变为传入的类型。
1. 利用了顶类型`unknown`的吸收性质：对于任意的类型`A`，`unknown & A`都是`A`本身。

这个实现基本解决了 HKT 的问题，但是仍然存在一些不足：

1. 无法通过类型检查。`Add`要求两个类型参数都是`Nat`的子类型，但是`BasicAddHKT`并没有办法保证这点。
2. 泛型类型的元数是固定的。对`BasicAddHKT`来说，它是一个 2 元的泛型类型，需要接受 2 个类型参数才能实例化。那么，对其他元数的泛型类型，我们就无法复用 HKT。
3. 不支持部分应用(Partial Application)而必须一次性传入所有的类型参数。它对应于值编程中的柯里化函数。

我们可以对它进行改进：

1. 利用`Assert`工具类型，将输入的类型参数`In1`和`In2`限制为`Nat`，消除不合法的路径。
1. 改造`Apply`得到`PartialApply`，使其支持部分应用。
1. 改造`HKT`类，并提供工具类型`HKTWithArity`，使其支持任意元数。

为了让这份代码通过类型检查，我们需要一个工具类型`Assert<T, P>`。简单来说，它断言`T`是`P`的子类型。加上了这个断言，`Add`的两个参数就都必定为`Nat`类型了。

```ts
type Assert<T, P> = T extends P ? T : /* T若非P的子类型就报错 */ never;
interface AddHKT extends HKT {
  type: Add<Assert<this['In1'], Nat>, Assert<this['In2'], Nat>>; // 没有类型错误了
}
type TestAddHKT = Apply<AddHKT, [1], [1, 1]>['length'];
```

接着，我们可以改造`Apply`，得到`PartialApply`。其核心逻辑是：

1. 检查到传入的`lambda`还需要几个类型参数。
2. 若为 0 个，`lambda['type']`已经存储着一个实例化完毕的类型，直接返回`lambda['type']`。
3. 若还需要类型参数，尝试从 `arguments` 中拿一个元素。若`arguments`已空，直接返回`lambda`。否则，进行一次应用，并回到第 1 步。

```ts
type PartialApply<lambda, arguments extends unknown[]> = lambda extends HKT
  ? arguments['length'] extends 0
    ? Equal<lambda['TypeArguments'][number], unknown> extends false
      ? lambda['type']
      : lambda
    : PartialApply<Kind<lambda, arguments[0]>, TAIL<arguments>>
  : lambda;
type TestApplication = [
  Expect<Equal<PartialApply<number, []>, number>>,
  Expect<
    Equal<
      PartialApply<PartialApply<MapHKT, [string]>, [number]>,
      Map<string, number>
    >
  >,
];
```

接下来，我们改造`HKT`类，并提供工具类型`HKTWithArity`，使其支持任意元数(Arity)。

```ts
type MakeArityConstraint<
  T extends number,
  res_nat extends unknown[] = [],
> = Equal<T, number> extends true
  ? unknown[]
  : T extends 0
  ? []
  : Equal<T, res_nat['length']> extends true
  ? res_nat
  : MakeArityConstraint<T, [unknown, ...res_nat]>;

type TestMakeArityConstraint = [
  Expect<Equal<MakeArityConstraint<0>, []>>,
  Expect<Equal<MakeArityConstraint<1>, [unknown]>>,
  Expect<Equal<MakeArityConstraint<2>, [unknown, unknown]>>,
];

interface HKTWithArity<Arity extends number> extends HKT {
  readonly TypeArguments: MakeArityConstraint<Arity>;
}
```

这样一来，我们就可以改写`AddHKT`，让它继承`HKTWithArity<2>`，实现对元数的约束。

```ts
interface BetterAddHKT extends HKTWithArity<2> {
  type: Add<
    Assert<this['TypeArguments']['0'], Nat>,
    Assert<this['TypeArguments']['1'], Nat>
  >;
}
```

另外，它可以支持递归。

```ts
interface TreeHKT extends HKTWithArity<1> {
  type: this extends infer A extends this
    ? { value: A['TypeArguments']['0']; nodes: A['type'][] }
    : never;
}

type NumberTreeHKTInstance = PartialApply<TreeHKT, [number]>;
//   ^?

declare const tree: NumberTreeHKTInstance;

const value = tree.nodes[0]?.nodes[0]?.nodes[0]?.nodes[0]?.nodes[0];

type NumberTree = { value: number; nodes: NumberTree[] };
type TestRecursive = [
  Expect<Equal<PartialApply<TreeHKT, [number]>, NumberTree>>,
  Expect<Equal<typeof value, NumberTreeHKTInstance | undefined>>,
  Expect<Equal<typeof tree, NumberTreeHKTInstance>>,
];
```

目前为止，我们得到了一个比较完善的实现。这个实现仍有一些值得改进的点，但是我们已经基本上达到我们的目的了。

1. 仍然依赖`Assert`进行类型断言。我们可以考虑引入类型参数的参考数组，保证每一个类型参数都是参考数组对应位置上元素的子类型。

[^Effect-Higher-Kinded-Types]: https://www.effect.website/docs/behaviour/hkt

> 注：HKTS 使用占位符实例化泛型，再对实例递归替换占位符来实现 HKT [^HKTS]。这种思路是无法用在`Add`上的。因为 Add 在`[...a, ...b]`时会尝试将占位符`a`和`b`展开，此时会得到`any[]`，导致后续进行递归替换的时候找不到占位符。此外，HKTS 的方法不支持递归数据类型。

#### TypeScript 子集的定义

为了更好地理解 TypeScript 类型层编程的性质，我们需要定义一个 TypeScript 的图灵完备的子集，将这个子集翻译成 TypeScript 的类型。

这个子集需要满足以下性质：

1. 静态单赋值(Static Single Assignment, SSA)。所有变量必须用 const 声明，被赋值且仅被赋值一次。这要求我们除初始化之外，不可以使用赋值(`=`)运算符。
1. 函数纯净。支持高阶函数作为函数的参数，但是函数不可以引用自由变量；自定义的函数不存在副作用。
1. 语法简单。保持语法尽量少，在实现翻译器的时候不必处理过多的语法。处理边界情况不是我们关心的。

### 翻译器的设计

### 类型编程的配套设施

在进行类型编程的时候，我们需要保证类型符合预期或者在类型不符合预期的时候 Debug 代码。我们有如下设施：

1. 类型单元测试。
1. 类型嵌入提示。

#### 类型单元测试

和运行时世界的单元测试一样，在类型世界也同样有单测来支持我们放心大胆地重构现有代码、测试驱动地开发新的类型。

区别是，在运行时世界里我们需要 Jest/Mocha/Vitest 这样的测试框架去执行测试，而类型世界的单测主要需要 TypeScript 编译器来做类型检查。

为了判断一个类型的计算结果符合预期，我们使用的工具主要有：

1. `Expect`。用来判断类型变量是`true`的子类型。因为字面量类型的子类型有且只有`never`和他本身，因此需要搭配`Equal`使用。
1. `Equal`。判断两个类型是否严格相等。

可以从`@type-challenges/utils`导入：

```ts
import type { Expect, Equal } from '@type-challenges/utils';
```

其源码如下，

```ts
export type Expect<T extends true> = T;
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? true
  : false;
```

1. `// @ts-expect-error` 注释。若下面一行不存在类型错误，则这个注释会导致类型检查时报错。需要断言某个类型会产生错误时使用。例如：

```ts
type TestCases = [
  // @ts-expect-error Array 是个泛型，不传入类型参数而单独存在会报错
  Array,
];
```

在`*.ts`文件中书写类型单元测试即可。 通常，我们会用类型检查来跑单元测试，例如调用`tsc`：

```
tsc --noEmit
```

其中`--noEmit`表示不产出编译结果。若检查没有报错，说明类型的单元测试通过了。

另外，在测试时把`test`目录和`src`目录包括在内，而在发布时不处理`test`目录下的文件也是一个很常见的需求。
若需要在测试时指定配置文件，可以使用`-p [config file]`来指定配置文件，如：`tsc --noEmit -p tsconfig.test.json`。

`tsconfig.test.json`可以放在项目原本的`tsconfig.json`旁边并继承它。接着，可以视需要修改`include`配置，决定将哪些文件包括进来。例如：

```json
{
  "extends": "./tsconfig.json", // 未指明的项继承自此配置
  "include": ["src/*", "test/*"] // 包括src和test目录下的文件
}
```

#### 类型嵌入提示

我们在 Debug 的时候需要关心某些语言元素（即，类型或值）的类型。但每次将鼠标 hover 到类型或者变量上去看 QuickInfo 效率不高，我们通常用类型嵌入提示查询元素的类型。

类型嵌入提示主要是在开发时提供方便，并不能代替类型单元测试。

类型查询分为手动的基于注释的嵌入提示、自动的嵌入提示两种：

1. 基于注释的嵌入提示(Inlay Hint)。

   1. TypeScript Playground 内，写上`// ^?`，并让`^`的箭头对准你想要查询类型的元素（类型和值都可以），就会通过嵌入提示展示出类型，一目了然。
   1. VS Code 中，也有类似插件 vscode-comment-queries [^vscode-comment-queries]，同时支持 Python/Go 等语言，和更加丰富的查询语法（如，`//  _?` 查询`_`下一行同一个列的元素的类型）。

1. 自动嵌入提示。
   1. VS Code 和 WebStorm 均可在设置中开启 JavaScript/TypeScript 类型的嵌入提示。关于要对哪些元素进行自动的类型嵌入提示，同样可以配置，请自行探索。

[^vscode-comment-queries]: https://marketplace.visualstudio.com/items?itemName=YiJie.vscode-comment-queries

(示意图)

#### 性能诊断

若想获得类型检查的过程的观测性数据，可以启用`tsc`的`--diagnostics`标志：

```shell
tsc --diagnostics
```

执行后会额外输出一段诊断信息，展示类型检查的过程的一些计数器。例如，标识符（Identifiers）、符号（Symbols）和实例化（Instantiations，即泛型类型被填上参数成为具体类型的过程）。

```
Files:              464
Lines:           103012
Identifiers:     126477
Symbols:        1196143
Types:           593053
Instantiations:  675088
Memory used:    619829K
I/O read:         0.05s
I/O write:        0.00s
Parse time:       0.38s
Bind time:        0.14s
Check time:       2.39s
Emit time:        0.00s
Total time:       2.91s
```

## 实现

### Playground

## 结语：从类型编程到类型驱动开发

<!-- 类型驱动开发(TyDe) -->

那么，作为一名开发者，如何掌握 TypeScript 类型编程？这里提供一个思路，仅供参考。

- 步骤一：学习。掌握 TypeScript 类型编程，应当从基础知识开始。

  1. 阅读 TypeScript 手册[^typescript-handbook]。
  1. 解答 Type-challenges[^type-challenges]中尽量多的问题，同时在这个过程中反复阅读手册。

[^typescript-handbook]: https://www.typescriptlang.org/docs/handbook/intro.html

- 步骤二：实践。

  1. 在平时的开发过程中发掘类型不合理的地方，并使用更加精准的类型来描述业务。非必要不做类型体操，除非它带来足够的收益。
  1. 尝试使用类型先行的思想，实践类型驱动开发。在这个过程中，一定要用上 AI。有问题可以询问 ChatGPT 或者 Copilot，能够大大提高建模的效率。
  1. 参与库的设计和改进和社区的讨论。一个充分利用类型系统的 API，能够把部分错误在编译期检查出来。

- 步骤三：回到步骤一。

<h2> 参考文献 </h2>

[^Purely-Functional-Data-Structures]: https://www.cs.cmu.edu/~rwh/students/okasaki.pdf
[^fp-ts]: https://github.com/gcanti/fp-ts
[^Type-level-programming-with-match-types]: https://dl.acm.org/doi/10.1145/3498698

[^Generative type abstraction and type-level computation]: https://dl.acm.org/doi/10.1145/1925844.1926411
[^Refinement kinds: type-safe programming with practical type-level computation]: https://dl.acm.org/doi/10.1145/3360557
[^Refinement types for TypeScript]: https://dl.acm.org/doi/10.1145/2908080.2908110
