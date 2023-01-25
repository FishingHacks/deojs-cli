import { join } from 'path';
import { generateBySchema, Schema } from './utils';

const schema: Schema = {
    files: [
        'tsconfig.json',
        'tsconfig.build.json',
        '.prettierrc',
        '.gitignore',
        '.eslintrc.js',
        'package.json',
        'test/root/root.controller.test.ts',
        'test/root/root.service.test.ts',
        'src/index.ts',
        'src/env.ts',
        'src/main.module.ts',
        'src/main.module.ts',
        'src/root/root.service.ts',
        'src/root/root.controller.ts',
        'src/root/root.module.ts',
    ],
    folders: ['test', 'test/root', 'src', 'src/root']
};

export function generateApplication(filepath: string, name: string) {
    const bpp = join(__dirname, 'boilerplate-project');
    generateBySchema(bpp, join(filepath, name), name, schema);
}
