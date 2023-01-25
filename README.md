# DeoJS CLI

The DeoJS CLI is a command-line based tool that helps you to initialize, develop and maintain your DeoJS applications.

# Installation

```bash
$ npm install -g deojs-cli
```

# Usage

```bash
deojs-cli <command> [options]
```

### **Options**

> -v, --version Output the current version.
>
> -h, --help Output usage information.

### **Commands**

| Command  | Alias | Options                        |                    Description |
| :------- | ----- | ------------------------------ | -----------------------------: |
| new      | n     | <name> [directory]             |  Generate a DeoJS Application. |
| build    |       | [directory]                    |       Build DeoJS Application. |
| start    |       | [directory]                    |       Start DeoJS Application. |
| info     | i     | [directory]                    | Display DeoJS project details. |
| generate | g     | <schematic> <name> [directory] |      Generate a DeoJS element. |

<br />

### **Schematics available**

| <span style="color: #d97176;">Name</span>       | <span style="color: #d97176;">Alias</span>      | <span style="color: #d97176;">Description</span> |
| :---------------------------------------------- | :---------------------------------------------- | :----------------------------------------------- |
| <span style="color:#18bc74;">module</span>      | <span style="color:#367dd8;">mod</span>         | Generate a new Module                            |
| <span style="color:#18bc74;">service</span>     | <span style="color:#367dd8;">s</span>           | Generate a new Service                           |
| <span style="color:#18bc74;">controller</span>  | <span style="color:#367dd8;">co</span>          | Generate a new Controller                        |
| <span style="color:#18bc74;">application</span> | <span style="color:#367dd8;">application</span> | Generate a new Application Workspace             |
