const fs = require('node:fs');
const path = require('node:path');
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

let diagnosticId = 0;
const diagnosticMappings = {};

process.on('exit', () => {
    fs.writeFileSync(
        path.join(__dirname, 'dist/diagnostic-mappings.json'),
        JSON.stringify(diagnosticMappings, null, 2),
        'utf-8'
    );
});

module.exports = function (source) {
    const { resourcePath } = this;
    const lines = source.split('\n');

    const ast = parse(source, {
        sourceType: "module",
        plugins: [
            "jsx",
            "typescript",
        ],
    });

    let lineOffset;

    traverse(ast, {
        enter() {
            lineOffset = 1;
        },
        BlockStatement(path) {
            const { node } = path;
            const { start } = node.loc;
            if (node.body.length > 0) {
                const line = lines[start.line - 1];
                const diagnostic = `console.log('diagnosticId: ${diagnosticId}, line: ${start.line}');`;
                lines[start.line - 1] = line.substring(0, start.column + 1) + diagnostic + line.substring(start.column + 1);
                diagnosticMappings[diagnosticId] = resourcePath;
                diagnosticId++;
            }
        }
    });

    return lines.join('\n');
};
