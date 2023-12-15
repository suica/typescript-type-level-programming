import generate from '@babel/generator';
import * as parser from '@babel/parser';
import { expression } from '@babel/template';
import traverse from '@babel/traverse';
import { Statement } from '@babel/types';

export function compile(code: string) {
  const ast = parser.parse(code);
  let res = '';
  traverse(ast, {
    enter(path) {          
      if (path.isVariableDeclaration()) {
        
      }
      // if (path.isIdentifier({ name: 'a' })) {
      //   const aa = expression`x`();
      //   path.replaceInline(aa);
      // }
    },
    exit(path) {
      // path.traverse(visitor, state)
    }
  });
  return generate(ast).code;
}
