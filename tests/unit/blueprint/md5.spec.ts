import { digest } from "@/blueprint/md5";

function strData(b: string) {
    const arr = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) {
        arr[i] = b.charCodeAt(i);
    }
    return arr.buffer;
}

describe('MD5F', () => {
    test('empty', () => {
        const data = new ArrayBuffer(0);
        const d = Uint8Array.of(
            0x84, 0xd1, 0xce, 0x3b, 0xd6, 0x8f, 0x49, 0xab,
            0x26, 0xeb, 0x0f, 0x96, 0x41, 0x66, 0x17, 0xcf,
        );
        expect(new Uint8Array(digest(data))).toEqual(d);
    });
    test('a', () => {
        const data = strData('a');
        const d = Uint8Array.of(
            0xf1, 0x0b, 0xdd, 0xae, 0xcb, 0x62, 0xe5, 0xa9,
            0x24, 0x33, 0x75, 0x78, 0x67, 0xee, 0x06, 0xdb,
        );
        expect(new Uint8Array(digest(data))).toEqual(d);
    });
    test('abcd', () => {
        const data = strData('abcd');
        const d = Uint8Array.of(
            0xfa, 0x27, 0xc7, 0x8b, 0x6e, 0xc3, 0x15, 0x59,
            0xf0, 0xe7, 0x60, 0xce, 0x3f, 0x2b, 0x03, 0xf6,
        );
        expect(new Uint8Array(digest(data))).toEqual(d);
    });
});
