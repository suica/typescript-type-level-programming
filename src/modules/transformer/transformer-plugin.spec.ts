import { transformSync } from '@babel/core';
import TypeScriptToTypePlugin from './transformer-plugin';

function transpileHelper(sourceCode: string) {
  const result = transformSync(sourceCode, {
    filename: 'test.ts',
    plugins: [TypeScriptToTypePlugin, '@babel/plugin-syntax-typescript'],
    configFile: false,
  });
  return result?.code ?? '';
}

describe('transpiler', () => {
  it.skip('should work for number literal', () => {
    // TODO complete this case
    expect(transpileHelper(`0;`)).toBe('[];');
    expect(transpileHelper(`1;`)).toBe('[1];');
    expect(transpileHelper(`10;`)).toBe('[1, 1, 1, 1, 1, 1, 1, 1, 1, 1];');
  });
  it('should work for simple type declaration', () => {
    expect(transpileHelper(`const a = 0;`)).toBe('type a = [];');
    expect(transpileHelper(`const a = 1;`)).toBe('type a = [1];');
    expect(transpileHelper(`const a = 2;`)).toBe('type a = [1, 1];');
    expect(transpileHelper(`const a = 10;`)).toBe(
      'type a = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];'
    );
  });

  it('should work for simple single-statement functions', () => {
    expect(
      transpileHelper(`
        function makeZero(){
          return 0;
        }
    `)
    ).toBe(`type makeZero = [];`);

    expect(
      transpileHelper(`
        function makeZero(){
          return 0;
        }
        const zero = makeZero();
    `)
    ).toBe(`type makeZero = [];\ntype zero = makeZero;`);

    expect(
      transpileHelper(`
        function makeZero2(x: number){
          return 0;
        }
        const a = makeZero2(10);
        const b = makeZero2(a);
    `)
    ).toBe(
      `type makeZero2<x> = [];\ntype a = makeZero2<[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]>;\ntype b = makeZero2<a>;`
    );

    expect(
      transpileHelper(`
      function add(x: number, y: number){
        return x + y;
      }
      const b = add(1, 2);
      const c = add(c, 2);
      const d = add(b, c);
    `)
    ).toBe(
      'type add<x, y> = [...x, ...y];\ntype b = add<[1], [1, 1]>;\ntype c = add<c, [1, 1]>;\ntype d = add<b, c>;'
    );

    expect(
      transpileHelper(`
        function addOne(x: number){
          return x+1;
        }
        function makeZero(){
          return 0;
        }
        const a = addOne(makeZero());
    `)
    ).toBe(
      `type addOne<x> = [...x, ...[1]];\ntype makeZero = [];\ntype a = addOne<makeZero>;`
    );
  });

  it('should inject helper types for binary operator', () => {
    expect(transpileHelper(`const a = 1; const b = 2; const c = a + b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = [...a, ...b];`
    );
    expect(transpileHelper(`const a = 1; const b = 2; const c = a - b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = SUB<a, b>;`
    );
  });

  it.skip('should inject helper types for simple binary relation', () => {
    expect(transpileHelper(`const a = 1; const b = 2; const c = a<=b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = LTE<a, b>;`
    );
    expect(transpileHelper(`const a = 1; const b = 2; const c = a<b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = LT<a, b>;`
    );
    expect(transpileHelper(`const a = 1; const b = 2; const c = a===b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = EQUALS<a, b>;`
    );
    expect(transpileHelper(`const a = 1; const b = 2; const c = a!==b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = NOT<EQUALS<a, b>>;`
    );
  });

  it.skip('should work for single functions with single if statement', () => {
    expect(
      transpileHelper(`
        function sub(x: number, y:number){
          if(x<=y){
            return 0;
          }else{
            return x-y;
          }
        }
    `)
    ).toBe(``);
  });

  it.todo('should work for functions with ?! operators');

  it.skip('should work for simple recursive function', () => {
    expect(
      transpileHelper(`
        function fib(x:number){
          if(x<=1){
            return x;
          }else{
            return fib(x-1) + fib(x-2);
          }
        }
    `)
    ).toBe('');
  });
});
