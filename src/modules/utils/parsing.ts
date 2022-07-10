import { parse } from "@babel/parser";

export function parseTS(code: string) {
  return parse(code, {
    plugins: [["typescript", {}]],
  });
}

export type FileParseResult = ReturnType<typeof parseTS>;
