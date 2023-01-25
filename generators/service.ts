import { writeFileSync } from "fs";
import { join } from "path";

export function generateService(directory: string, name: string) {
    writeFileSync(
        join(directory, name + '.service.ts'),
        `import { Injectable } from "deojs";

@Injectable
export class ${name[0].toUpperCase()}${name.substring(1)}Service {

}`
    );
}