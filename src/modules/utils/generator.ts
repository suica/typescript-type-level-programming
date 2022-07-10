import generate from "@babel/generator";
import { ASTNode } from "../types/ast";

export function generateTSCode(ast: ASTNode): string {
  const { code: output } = generate(ast, {
    concise: true,
    comments: false,
  });
  return output;
}
