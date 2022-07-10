
import { isInteger } from "lodash";
export function repeatObject<T>(obj: T, times: number): T[] {
    if (times < 0 || !isInteger(times)) {
        times = 0;
    }
    return Array.from({ length: times }).map((x) => obj);
}