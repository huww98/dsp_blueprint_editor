import { fromStr, toStr } from "@/blueprint/parser";

describe('blueprint parser', () => {
    test('round trip', () => {
        const bp = fromStr('BLUEPRINT:0,10,401,0,0,0,0,0,637818182165693716,0.9.24.11286,test,test%20desc"H4sIAAAAAAAAC+2aP0wUQRTG3+4dt+uBt5ioySUml0hxIdHmlgDhiDvsFhYSCy0MoYBEhRYsLfxXa+IVFhbiNVrYGMMFEAuprKXCxBAawIAxFAiCiYz7dmeWF24bG2neL3mzX2bve29mdu+aewYAtISRgZjWMHJKGyAB6mo6B+1qGpZf3Zv9Iz1hLBRnqNb3V60ySEXBcQrxbFbfDvOS67qUwoUHHiagWn/4uX0hSQYEE4dvB1K8KZd6Hrpr75+dPT0wvPFifnLs4ofHfQ1/6fW0/9XqjHaGtfMy3hDWNfSOf8rSQDQ1MTZLta5yYF86Uj2TbCCrl69NVL+rNnyMRauDJtBbj848Osgrc4PCqHzvpXpdugEGmpGj5pw2L9x4JGrF0SrVO6FxR5lblNkgZkubs1BPzFrvh8Z9Zc6lmG0cataUGO+667k35/qp/nyqEmCguTXFfEJXXrrsJnvWWoZVparcpl8Q89Ccx+GTvC+2wjCeFnuo3v5ypxuj166kvSz2ZiZeBkZ7GRiG+Y/o7x5zPAjfASjlf8O5q4XoOVy3oueBP6q3jndpDMMwDMMwDMMwDMMwDMMwDMMwDPPPYDcCrMqXAq/YnkH1rxkzwMDOg5PQ3LYQdSNgq8J2fderDY1Uqd6TbrCn2hbS+jwwIazJj0k1qq9Bw8dAs9NU2YRN1ZUTddA8OT8lxs0f3u3uM/1Uv+3rCjAwCbZn4H96ht2cxIlXskJWcqjn5bSPgUmyKWfwF3VXFSMnJAAA"A7DF4C8BFFFC74EA6F1C5C2F8CA778BB')
        expect(fromStr(toStr(bp))).toEqual(bp);
    })
});
