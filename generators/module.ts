import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function generateModule(
    filepath: string,
    name: string
) {
    filepath = join(filepath, name);
    const nameCapitalized = name[0].toUpperCase() + name.substring(1);
    mkdirSync(join(filepath, name), { recursive: true });
    writeFileSync(
        join(filepath, name, name + '.controller.ts'),
        `import { Controller, Inject } from "deojs";
import { ${nameCapitalized}Service } from "./${name}.service";

@Controller('/${name.substring(name.startsWith('/') ? 1 : 0)}')
export class ${nameCapitalized}Controller {
    constructor(@Inject(${nameCapitalized}Service) private ${name}Service: ${nameCapitalized}Service) {}
}
`
    );
    writeFileSync(
        join(filepath, name, name + '.service.ts'),
        `import { Injectable } from "deojs";

@Injectable
export class ${nameCapitalized}Service {
    
}`
    );
    writeFileSync(
        join(filepath, name, name + '.module.ts'),
        `import { Module } from 'deojs';
import { ${nameCapitalized}Controller } from './${name}.controller';

@Module({ controllers: [${nameCapitalized}Controller] })
export class ${nameCapitalized}Module {}`
    );
}
