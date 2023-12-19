# 理解类型编程：TypeScript到其类型系统的嵌入

## 简介

<!-- TODO -->

## 背景

### 值空间和类型空间

TypeScript不仅为JavaScript引入了一些新的语法和特性，最重要的是附加了一个静态的、强的类型系统，让JavaScript代码库也能够得到类型检查和现代化的语言服务。
TypeScript的编译器`tsc`在编译代码时，会对代码进行类型检查，擦除TypeScript源码上的类型信息并将新语法和特性转译为可被JavaScript解释器执行的JavaScript代码。

一份典型的TypeScript代码，由在编译期和运行时这两个不同时期执行的子语言交织而成。这两个语言分别负责TypeScript这门语言的静态语义和动态语义。
1. 类型语言。
  1. 它包括JavaScript中不存在的语法成分：如，类型别名关键字`type`和取类型操作符`typeof`，泛型的实例化记号`<>`，`:`和`enum`等。
  1. 它包含独特的语义。由类型检查器所隐式表示的定型规则定义，在编译期通过类型检查器的类型检查被执行。
1. JavaScript。它在运行时被JavaScript运行环境执行的JavaScript语言，承担了TypeScript的动态语义。

如下面这份代码中，类型定义`type States = Array<State>;`和类型标注`: States`就是类型语言中的成分，不是合法的JavaScript成分，在JavaScript中并不存在；
而`concat([1], [2])`则是JavaScript中的成分，不是合法的类型语言中的成分。

```ts
enum State {
  Todo,
  Finished
}
type States = Array<State>;
function mergeStates(a: States, b: States): States {
  return [...a, ...b];
}
const result = mergeStates([State.Todo], [State.Finished]);
type Result = typeof result;
```

这两个子语言可以各自独立工作，自然地将TypeScript分为了值空间和类型空间。当我们考虑TypeScript中的一个项时，它
有一些项同时属于类型空间和值空间，具有二态性。例如：

1. 作为类构造器的`Array`，它既是值空间中的函数、类构造器，又是类型语言中的一个泛型类型；
1. 作为枚举`enum`的`State`，它既是值空间中的一个对象，又是类型语言中的一个枚举类型。

值空间中的项可以单向地转换为类型空间中的项，例如：

1. 通过类型语言中的`typeof`运算符，我们可以获取一个值空间中的符号的类型，得到的类型仅存在于值空间。在TypeScript中，仅存在于类型空间的项无法对值空间产生影响。

以上这些概念可以通过下图概括：

TODO：示意图

### 类型编程

类型编程 (Type-level Programming) 在函数式编程语言社区由来已久。

## 方法

#### TypeScript子集的定义

为了更好地理解TypeScript类型层编程的性质，我们需要定义一个TypeScript的图灵完备的子集，将这个子集翻译成TypeScript的类型。

这个子集需要满足以下性质：

1. 静态单赋值(SSA)。所有变量必须用const声明。除初始化之外，不可以使用赋值(`=`)运算符。
1. 函数纯净。支持高阶函数作为函数的参数，但是函数不可以引用自由变量；自定义的函数不存在副作用。
1. 语法简单。保持语法尽量少，在实现翻译器的时候不必处理过多的语法。处理边界情况不是我们关心的。

### 类型编程的配套设施

在进行类型编程的时候，我们需要保证类型符合预期或者在类型不符合预期的时候Debug代码。我们有如下设施：

1. 类型单元测试。
1. 类型嵌入提示。

#### 类型单元测试

和运行时世界的单元测试一样，在类型世界也同样有单测来支持我们放心大胆地重构现有代码、测试驱动地开发新的类型。

区别是，在运行时世界里我们需要Jest/Mocha/Vitest这样的测试框架去执行测试，而类型世界的单测主要需要TypeScript编译器来做类型检查。

为了判断一个类型的计算结果符合预期，我们使用的工具主要有：

1. `Expect`。用来判断类型变量是`true`的子类型。因为字面量类型的子类型有且只有`never`和他本身，因此需要搭配`Equal`使用。
1. `Equal`。判断两个类型是否严格相等。

可以从`@type-challenges/utils`导入：

```
import type { Expect, Equal } from '@type-challenges/utils';
```

其源码如下，

```ts
export type Expect<T extends true> = T;
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;
```

1. `// @ts-expect-error` 注释。若下面一行不存在类型错误，则这个注释会导致类型检查时报错。需要断言某个类型会产生错误时使用。例如：

```ts
type TestCases = [
  // @ts-expect-error Array 是个泛型，因此必须传入类型参数
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

我们在Debug的时候需要关心某些语言元素（即，类型或值）的类型。但每次将鼠标hover到类型或者变量上去看QuickInfo效率不高，我们通常用类型嵌入提示查询元素的类型。

类型嵌入提示主要是在开发时提供方便，并不能代替类型单元测试。

类型查询分为手动的基于注释的嵌入提示、自动的嵌入提示两种：

1. 基于注释的嵌入提示(Inlay Hint)。
  1. TypeScript Playground内，写上`// ^?`，并让`^`的箭头对准你想要查询类型的元素（类型和值都可以），就会通过嵌入提示展示出类型，一目了然。
  1. VS Code中，也有类似插件 (vscode-comment-queries)，同时支持Python/Go等语言，和更加丰富的查询语法（如，`//  _?` 查询`_`下一行同一个列的元素的类型）。
1. 自动嵌入提示。
  1. VS Code和WebStorm均可在设置中开启JavaScript/TypeScript类型的嵌入提示。关于要对哪些元素进行自动的类型嵌入提示，同样可以配置，请自行探索。

TODO: 示意图

#### 性能诊断

若想获得类型检查的过程的观测性数据，可以启用`tsc`的`--diagnostics`标志：

```
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

### 翻译策略

## 实现

### Playground

### Demo: 纯函数式数据结构的实现

<!-- ### 类型编程背后的哲学

#### 开发范式

类型驱动开发(TyDe) -->

## 参考文献

1. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
1. [Purely Functional Data Structures](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf)
1. [fp-ts](https://github.com/gcanti/fp-ts)
1. [Effective Typescript：使用Typescript的n个技巧](https://zhuanlan.zhihu.com/p/104311029)
1. [Type-Challenges](https://github.com/type-challenges/type-challenges)
1. [hkts](https://github.com/pelotom/hkts)
1. [HypeScript](https://github.com/ronami/HypeScript)
1. [TypeScripts Type System is Turing Complete](https://github.com/microsoft/TypeScript/issues/14833)
1. [write-you-a-typescript](https://github.com/suica/write-you-a-typescript)
1. [Thinking with Types: Type-Level Programming in Haskell](https://leanpub.com/thinking-with-types)
1. [type-chess](https://github.com/chinese-chess-everywhere/type-chess)
1. [vscode-comment-queries](https://marketplace.visualstudio.com/items?itemName=YiJie.vscode-comment-queries)
