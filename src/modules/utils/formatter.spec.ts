import { formatTSCode } from "./formatter";

describe("utils-formatter", () => {
  it("should format for TypeScript", () => {
    let output = formatTSCode("const a              = 1;");
    expect(output).toBe("const a = 1;");
    output = formatTSCode(`
    const a = 
    ()=>{
        return 1
    }`);
    expect(output).toBe("const a = () => { return 1; };");
  });
});
