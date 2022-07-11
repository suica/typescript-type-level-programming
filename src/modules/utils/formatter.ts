import { generateTSCode } from './generator';
import { parseTS } from './parsing';

export function formatTSCode(input: string): string {
  return generateTSCode(parseTS(input));
}
