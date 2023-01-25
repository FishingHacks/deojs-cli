import { writeFileSync } from 'fs';
import { join } from 'path';

export function generateController(
    directory: string,
    name: string
) {
    writeFileSync(
        join(directory, name + '.controller.ts'),
        `import { Controller } from 'deojs';

@Controller('${name.replaceAll("'", "\\'")}')
export class ${name[0].toUpperCase()}${name.substring(1)}Controller {

}`
    );
}
