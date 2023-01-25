const { mkdirSync, readFileSync, writeFileSync, readdirSync } = require('fs');
const { join, sep } = require('path');

function copyFile(a, b) {
    mkdirSync(join(b, '..'), { recursive: true });
    writeFileSync(b, readFileSync(a));
}

function tree(dir) {
    const directories = [dir];
    const files = [];

    while (directories.length > 0) {
        const dir = directories.pop();
        if (!dir) break;
        for (const f of readdirSync(dir, { withFileTypes: true })) {
            if (f.isFile()) files.push(join(dir, f.name));
            if (f.isDirectory()) directories.push(join(dir, f.name));
        }
    }

    return files;
}

const a = join(__dirname, 'generators/boilerplate-project');
const b = join(__dirname, 'dist/generators/boilerplate-project');
mkdirSync(b, { recursive: true });
const files = tree(a);

for (const f of files) {
    copyFile(f, join(b, f.replace(a.endsWith(sep) ? a : a + sep, '')))
}
