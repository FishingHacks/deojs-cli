import { existsSync } from "fs";

export function strMul(str: string, num: number) {
    let string = '';
    for (let i = 0; i < num; i++) string += str;
    return string;
}

export function removeColorSignature(str: string): string {
    return str.replaceAll(/\033\[([0-9]{1,3})(;[0-9]{1,3})*m/g, '');
}

export function resolveFilePaths(files: string[]): string {
    for (const f of files) {
        if (existsSync(f)) return f;
    }
    throw new Error('Could not find the main file')
}