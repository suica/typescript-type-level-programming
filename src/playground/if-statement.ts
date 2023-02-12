function what() {
  if (1 > 2) {
    const a = 1;
  }
  return 1;
}

type Unit = void;

// 实现的方法
// 1. 虚拟机+指令application
// 各种Stmt都翻译成一个表达式： 这个表达式如果返回 Unit，那么说明这个stmt成功被执行，并且不包含return语句。
// 如果这个表达式的返回值不为Unit，那么说明这个stmt有return语句，产生了返回值。
