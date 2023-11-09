export function asBits(n: number) {
    let s = "";
    while (n !== 0) {
        s = (n & 1 ? "1" : "0") + s;
        n >>>= 1;
    }
    return s.length > 0 ? s : "0";
}
