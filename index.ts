import { version as os_vFunction } from 'os';
import { generateModule } from './generators/module';
import { generateService } from './generators/service';
import { generateController } from './generators/controller';
import { generateApplication } from './generators/application';
import chalk from 'chalk';
import { removeColorSignature, resolveFilePaths, strMul } from './utils';
import { parseCLI } from './generators/utils';
import {
    CommandNotFoundError,
    NotEnoughArgumentsError,
} from './generators/errors';
import { format } from 'util';
import { version } from './package.json';
import { join } from 'path';
import { spawn, spawnSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';

function printHelp() {
    console.log(help.join('\n'));
    printTable(
        ['name', 'alias', 'description'],
        generators.map((el) => ({
            alias: chalk.blue(el.alias),
            description: el.description,
            name: chalk.green(el.name),
        })),
        { bottom: 0, left: 5, top: 2 }
    );
}
function printTable<T extends string>(
    heads: T[],
    options: Record<T, string>[],
    margin: { top: number; left: number; bottom: number }
) {
    if (heads.length < 1) return;
    heads = Array.from(new Set(heads));
    const lengths = heads.map((head) =>
        Math.max(
            removeColorSignature(head).length,
            options
                .map((el) => el[head])
                .reduce(
                    (a, b) => Math.max(a, removeColorSignature(b).length),
                    0
                )
        )
    );

    if (margin.top > 0) console.log(strMul('\n', margin.top - 1));

    // PRINT TABLE
    let str = '';
    for (const l of lengths) {
        str += '┬' + strMul('─', l + 3);
    }
    console.log(chalk.gray('┌' + str.substring(1) + '┐'));
    str = '';

    for (let i = 0; i < heads.length; i++) {
        str +=
            chalk.gray('│ ') +
            chalk.red(heads[i]) +
            strMul(' ', lengths[i] - removeColorSignature(heads[i]).length) +
            '  ';
    }
    str += chalk.gray('│');
    console.log(str);
    str = '';

    for (const o of options) {
        for (let i = 0; i < heads.length; i++) {
            const h = heads[i];
            str +=
                chalk.gray('│ ') +
                o[h] +
                strMul(' ', lengths[i] - removeColorSignature(o[h]).length) +
                '  ';
        }
        str += chalk.gray('│');
        console.log(str);
        str = '';
    }

    for (const l of lengths) {
        str += '┴' + strMul('─', l + 3);
    }
    console.log(chalk.gray('└' + str.substring(1) + '┘'));
    str = '';

    if (margin.bottom > 0) console.log(strMul('\n', margin.bottom - 1));
}

const generators: {
    name: string;
    alias: string;
    description: string;
    function: (file: string, name: string) => void;
}[] = [
    {
        name: 'module',
        alias: 'mod',
        description: 'Generate a new module',
        function: generateModule,
    },
    {
        name: 'service',
        alias: 's',
        description: 'Generate a new service',
        function: generateService,
    },
    {
        name: 'controller',
        alias: 'co',
        description: 'Generate a new controller',
        function: generateController,
    },
    {
        name: 'application',
        alias: 'application',
        description: 'Generate a new application workspace',
        function: generateApplication,
    },
];
const help: string[] = [
    'Usage: deojs-cli <command> [options]',
    'Options:',
    '  -v, --version                                   Output the current version.',
    '  -h, --help                                      Output usage information.',
    '',
    'Commands:',
    'new | n <name> [directory]                        Generate a DeoJS Application.',
    'build [directory]                                 Build DeoJS Application.',
    'start [directory]                                 Start DeoJS Application.',
    'info | i [directory]                              Display DeoJS project details.',
    'generate | g <schematic> <name> [directory]       Generate a DeoJS element.',
    '  Schematics available:',
];

export async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) return printHelp();
    try {
        const parsed = parseCLI(
            [
                {
                    name: 'new',
                    alias: 'n',
                    id: 'generateApplication',
                    options: ['directory'],
                    required: ['name'],
                },
                {
                    name: 'build',
                    id: 'build',
                    options: ['directory'],
                    required: [],
                },
                {
                    name: 'start',
                    id: 'start',
                    options: ['directory'],
                    required: [],
                },
                {
                    name: 'info',
                    alias: 'i',
                    id: 'info',
                    options: ['directory'],
                    required: [],
                },
                {
                    name: 'generate',
                    alias: 'g',
                    id: 'generate',
                    options: ['directory'],
                    required: ['schematic', 'name'],
                },
            ],
            ['--version', '-v', '--help', '-h'],
            args
        );
        if (
            parsed.type === 'option' &&
            (parsed.name === '--version' || parsed.name === '-v')
        )
            console.log(chalk.bold('DeoJS Cli v' + version));
        else if (parsed.type === 'option') printHelp();
        else {
            try {
                const { id, options, required } = parsed;
                if (id === 'generate' || id === 'info')
                    options.directory ||= join(process.cwd(), 'src');
                else options.directory ||= process.cwd();
                if (id === 'generateApplication') {
                    generateApplication(options.directory, required.name);
                    try {
                        console.log(chalk.blue('Installing packages...'));
                        const proc = spawnSync('pnpm i', {
                            shell: true,
                            cwd: join(options.directory, required.name),
                        });
                        if (proc.error || proc.status !== 0) throw new Error();
                        console.log(
                            chalk.green('Successfully installed all packages!')
                        );
                    } catch {
                        console.log(
                            chalk.red('Error: Failed to install packages!')
                        );
                    }
                    console.log(
                        chalk.green('  Successfully initiated a new project!')
                    );
                    console.log(
                        chalk.green('  Use ') +
                            chalk.blue('cd ' + required.name) +
                            chalk.green(' to get to the project directory.')
                    );
                    console.log(
                        chalk.green('  Use ') +
                            chalk.blue('pnpm start') +
                            chalk.green(' to start your project.\n')
                    );
                } else if (id === 'build') {
                    runTSCInFolder(options.directory);
                } else if (id === 'start') {
                    const cwd = join(
                        runTSCInFolder(options.directory),
                        'dist/src'
                    );
                    let mainFiles = [
                        join(cwd, 'index.js'),
                        join(cwd, 'main.js'),
                    ];
                    const a = spawn('node', [resolveFilePaths(mainFiles)], {
                        cwd,
                    });
                    a.stderr.pipe(process.stderr);
                    a.stdout.pipe(process.stdout);
                    a.stdin.pipe(process.stdin);
                    a.on('close', process.exit);
                    a.on('disconnect', process.exit);
                    a.on('exit', process.exit);
                    a.on('error', (e) => {
                        console.log(e);
                        process.exit(1);
                    });
                    return;
                } else if (id === 'generate') {
                    const directory = options.directory;
                    const name = required.name;
                    const schematic = required.schematic;

                    const generateFunction = generators.find(
                        (el) => el.name === schematic || el.alias === schematic
                    )?.function;
                    if (!generateFunction) {
                        console.error(
                            chalk.red(
                                'Error: ' +
                                    schematic +
                                    ' is not an available schematic!'
                            )
                        );
                        console.log('Availbale schematics:');
                        printTable(
                            ['name', 'alias', 'description'],
                            generators.map((el) => ({
                                alias: chalk.blue(el.alias),
                                description: el.description,
                                name: chalk.green(el.name),
                            })),
                            { bottom: 0, left: 5, top: 2 }
                        );
                    } else {
                        generateFunction(directory, name);
                    }
                } else if (id === 'info') {
                    const npm_v = tryRun('npm', '-v');
                    const pnpm_v = tryRun('pnpm', '-v');
                    const yarn_v = tryRun('yarn', '-v');
                    const node_v = tryRun('node', '-v');
                    const os_v = os_vFunction();

                    console.log(chalk.green('[System Information]'));
                    if (os_v !== undefined)
                        console.log('OS Version     : ' + chalk.blue(os_v));
                    if (node_v !== undefined)
                        console.log(
                            'NodeJS Version : ' + chalk.blue(node_v.trim())
                        );
                    if (npm_v !== undefined)
                        console.log(
                            'NPM Version    : ' + chalk.blue(npm_v.trim())
                        );
                    if (pnpm_v !== undefined)
                        console.log(
                            'PNPM Version   : ' + chalk.blue(pnpm_v.trim())
                        );
                    if (yarn_v !== undefined)
                        console.log(
                            'Yarn Version   : ' + chalk.blue(yarn_v.trim())
                        );
                    console.log('');
                    console.log(chalk.green('[DeoJS CLI]'));
                    console.log('DeoJS CLI Version : ' + chalk.blue(version));
                    console.log('');
                    console.log(chalk.green('[Project Information]'));
                    await displayProjectInformation(options.directory);
                }
            } catch (e: any) {
                if (e instanceof Error)
                    console.error(
                        chalk.redBright(
                            format(
                                'Error:',
                                e.message ||
                                    e.name ||
                                    e.toString() ||
                                    'unknown error'
                            )
                        )
                    );
                else console.error(chalk.redBright(format('Error:', e)));
                process.exit(1);
            }
        }
    } catch (e: any) {
        if (e instanceof NotEnoughArgumentsError)
            console.log(chalk.redBright('Error: Not enough arguments\n'));
        else if (e instanceof CommandNotFoundError)
            console.log(chalk.redBright('Error: Command not found\n'));
        else console.log(chalk.red(format('Unkown Error', e)));
        printHelp();
        process.exit(1);
    }
}

export function runTSCInFolder(folder: string) {
    if (!existsSync(join(folder, 'tsconfig.json'))) folder = join(folder, '..');
    if (!existsSync(join(folder, 'tsconfig.json')))
        throw new Error('Could not find the tsconfig.json file');
    spawnSync('npx', ['tsc'], { cwd: folder });
    return folder;
}

export function tryRun(command: string, ...args: string[]) {
    try {
        const proc = spawnSync(
            '"' +
                command.replaceAll('"', '\\"') +
                '"' +
                (args.length > 0 ? ' ' : '') +
                args
                    .map((el) => '"' + el.replaceAll('"', '\\"') + '"')
                    .join(' '),
            { shell: true }
        );
        if (proc.error) throw proc.error;
        if (proc.status !== 0) throw new Error(proc.stderr.toString());
        return proc.output
            .filter((el) => !!el)
            .map((el) => el?.toString())
            .filter((el) => !!el)
            .join('');
    } catch (e) {
        return undefined;
    }
}

async function displayProjectInformation(dir: string) {
    if (dir.includes('src') && !existsSync(join(dir, 'package.json')))
        dir = join(dir, '..');
    if (!existsSync(join(dir, 'package.json'))) {
        console.error(
            chalk.red(
                'Error: cannot read your projects package.json file, are you inside your project directory?'
            )
        );
        process.exit(1);
    }
    try {
        const packageJson = await import(join(dir, 'package.json'));

        const srcTree = tryRunFunction([], tree, join(dir, 'src'));
        const modules = srcTree.filter((el) => el.endsWith('.module.ts'));
        const controllers = srcTree.filter((el) =>
            el.endsWith('.controller.ts')
        );
        const services = srcTree.filter((el) => el.endsWith('.service.ts'));
        console.log(
            'Module Files             : ' +
                chalk.blue(modules.length.toString())
        );
        console.log(
            'Controller Files         : ' +
                chalk.blue(controllers.length.toString())
        );
        console.log(
            'Service Files            : ' +
                chalk.blue(services.length.toString())
        );
        if (packageJson?.dependencies?.deojs)
            console.log(
                'deojs Version            : ' +
                    chalk.blue(makeVersion(packageJson?.dependencies?.deojs))
            );
        if (packageJson?.dependencies?.['reflect-metadata'])
            console.log(
                'reflect-metadata Version : ' +
                    chalk.blue(
                        makeVersion(
                            packageJson?.dependencies?.['reflect-metadata']
                        )
                    )
            );
        if (packageJson?.devDependencies?.jest)
            console.log(
                'jest Version             : ' +
                    chalk.blue(makeVersion(packageJson?.devDependencies?.jest))
            );
        if (packageJson?.devDependencies?.['ts-jest'])
            console.log(
                'ts-jest Version          : ' +
                    chalk.blue(
                        makeVersion(packageJson?.devDependencies?.['ts-jest'])
                    )
            );
        if (packageJson?.devDependencies?.['deojs-cli'])
            console.log(
                'deojs-cli Version        : ' +
                    chalk.blue(
                        makeVersion(packageJson?.devDependencies?.['deojs-cli'])
                    )
            );
    } catch {
        console.error(
            chalk.red(
                'Error: cannot read your projects package.json file, are you inside your project directory?'
            )
        );
        process.exit(1);
    }
}

function tryRunFunction<T, K extends any[]>(
    defaultValue: T,
    fn: (...args: K) => T,
    ...args: K
): T {
    try {
        return fn(...args);
    } catch {
        return defaultValue;
    }
}

function tree(dir: string) {
    const directories: string[] = [dir];
    const files: string[] = [];

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

function makeVersion(version: string | number) {
    if (typeof version === 'string' && version.startsWith('^'))
        return version.substring(1);
    if (typeof version === 'string' && version.startsWith('@'))
        return version.substring(1);
    return version.toString();
}