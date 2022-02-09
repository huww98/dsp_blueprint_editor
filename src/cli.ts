/// <reference types="node" />

import { fromStr } from './blueprint'

function readStdin() {
    return new Promise<string>(resolve => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.on('readable', () => {
            let chunk
            while ((chunk = process.stdin.read())) {
                data += chunk
            }
        }).on('end', () => {
            resolve(data)
        })
    })
}

async function main() {
    const input = await readStdin();
    process.stdout.write(JSON.stringify(fromStr(input)));
}

main()
