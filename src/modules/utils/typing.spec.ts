import { assertNever, isNotNil } from './typing';

describe('assertNever', () => {
  it('should throw error when invoked', () => {
    const f = () => {
      assertNever(1 as never);
    };
    expect(f).toThrowError();
  });
});

describe('isNotNil', () => {
  it('should work for nullish values', () => {
    expect(isNotNil(null)).toBe(false);
    expect(isNotNil(undefined)).toBe(false);
  });

  it('should work for falsy but not nullish values', () => {
    expect(isNotNil(false)).toBe(true);
    expect(isNotNil('')).toBe(true);
    expect(isNotNil(0)).toBe(true);
    expect(isNotNil(-0)).toBe(true);
  });
  it('should work for truthy values', () => {
    expect(isNotNil(true)).toBe(true);
    expect(isNotNil(1)).toBe(true);
    expect(isNotNil('haha')).toBe(true);
  });
});
