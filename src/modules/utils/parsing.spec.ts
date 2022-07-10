import { parseTS } from "./parsing";

describe("utils-parsing", () => {
  it("should work for simple TypeScript code", () => {
    const code = parseTS("const a:number = 1; //test");
    const node = code.program.body[0];
    if (!node) {
      throw new Error("the ast node cannot be found");
    }
    if (node.type !== "VariableDeclaration") {
      throw new Error("the ast node can wrong type");
    }
    expect(node.trailingComments?.[0]?.value).toBe("test");
  });
});
