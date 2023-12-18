# TypeScript类型作为目标语言

## 简介

## TypeScript 值空间和类型空间

## 方法

### TypeScript子集的定义

为了更好地理解TypeScript类型层编程的性质，我们需要定义一个TypeScript的图灵完备的子集，将这个子集翻译成TypeScript的类型。

这个子集需要满足以下性质：

1. 静态单赋值(SSA)。所有变量必须用const声明。除初始化之外，不可以使用赋值(`=`)运算符。
1. 函数纯净。支持高阶函数作为函数的参数，但是函数不可以引用自由变量；自定义的函数不存在副作用。
1. 语法简单。保持语法尽量少，在实现翻译器的时候不必处理过多的语法。处理边界情况不是我们关心的。

### 翻译策略

## 实现

### Playground

### Demo: 纯函数式数据结构的实现

## 参考文献

1. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
1. [Purely Functional Data Structures](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf)
1. [fp-ts](https://github.com/gcanti/fp-ts)
1. [Effective Typescript：使用Typescript的n个技巧](https://zhuanlan.zhihu.com/p/104311029)
1. [Type-Challenges](https://github.com/type-challenges/type-challenges)
1. [hkts](https://github.com/pelotom/hkts?tab=readme-ov-file)
