import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CommandNotFoundError, NotEnoughArgumentsError } from './errors';

export function copyFile(a: string, b: string, objs?: Record<string, string>) {
    objs ||= {};
    let f = readFileSync(a + '.txt').toString();
    for (const [k, v] of Object.entries(objs)) {
        f.replaceAll('{' + k + '}', v);
    }
    writeFileSync(b, f);
}

export function fileCopyProvider(dirA: string, dirB: string) {
    return function (file: string, objs?: Record<string, string>) {
        return copyFile(join(dirA, file), join(dirB, file), objs);
    };
}

export function generateBySchema(
    dirA: string,
    dirB: string,
    name: string,
    schema: Schema,
    variables?: Record<string, string>
) {
    const copier = fileCopyProvider(dirA, dirB);
    const objs = {
        ...(variables || {}),
        name,
        className: name[0].toUpperCase() + name.substring(1),
    };
    mkdirSync(dirB, { recursive: true });

    for (const f of schema.folders) {
        mkdirSync(join(dirB, f), { recursive: true });
    }
    for (const f of schema.files) {
        copier(f, objs);
    }
}

export function parseCLI(
    commands: CLIOptions[],
    options: string[],
    args: string[]
):
    | {
          type: 'option';
          name: string;
      }
    | {
          type: 'command';
          id: string;
          options: Record<string, string>;
          required: Record<string, string>;
      } {
    for (const opt of options) {
        if (args.includes(opt)) return { type: 'option', name: opt };
    }

    const command = args.shift();
    if (!command) throw new NotEnoughArgumentsError();

    for (const cmd of commands) {
        if (command !== cmd.alias && command !== cmd.name) continue;

        const required: Record<string, string> = {};
        const options: Record<string, string> = {};
        if (args.length < cmd.required.length)
            throw new NotEnoughArgumentsError();
        for (const r of cmd.required) {
            const value = args.shift();
            if (!value) throw new NotEnoughArgumentsError();
            required[r] = value;
        }
        for (const r of cmd.options) {
            const value = args.shift();
            if (!value) break;
            options[r] = value;
        }
        return {
            type: 'command',
            id: cmd.id,
            options,
            required,
        };
    }

    throw new CommandNotFoundError();
}

export interface CLIOptions {
    id: string;
    name: string;
    alias?: string;
    options: string[];
    required: string[];
}

export interface Schema {
    files: string[];
    folders: string[];
}
