import { formatTSCode } from "../utils/formatter";
import { FileParseResult } from "../utils/parsing";

export function transpile(parsedResult: FileParseResult): string {
  const body = parsedResult.program.body;
  return formatTSCode();
}
