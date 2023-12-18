# TypeScript类型作为目标语言

## 简介

## TypeScript 值层和类型层

## 方法

### TypeScript子集的定义

为了更好地理解TypeScript类型编程的性质，我们需要定义一个TypeScript的图灵完备的子集，将这个子集翻译成TypeScript的类型。

1. 静态单赋值(SSA)。所有变量必须用const声明。除初始化之外，不可以使用赋值(`=`)运算符。
1. 函数纯净。支持高阶函数作为函数的参数，但是函数不可以引用自由变量；自定义的函数不存在副作用。

## 实现

### Playground Demo

### 纯函数式数据结构的实现

## 参考文献

1. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
1. [Purely Functional Data Structures](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf)
