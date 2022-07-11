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
    expect(transpileHelper(`const a = 1; const b = 2; const c = a + b;`)).toBe(
      `type a = [1];\ntype b = [1, 1];\ntype c = [...a, ...b];`
    );
  });
  it('should work for simple recursive function', () => {
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
