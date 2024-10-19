const fs = require('node:fs');
const path = require('node:path');
const recast = require("recast");

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

    const ast = recast.parse(source);

    let lineOffset;

    recast.visit(ast, {
        visitProgram(path) {
            lineOffset = 1;
            this.traverse(path);
        },
        visitBlockStatement(path) {
            const body = path.get('body').node;
            const { start } = body.loc;

            if (body.body.length > 0) {
                const line = lines[start.line - 1];
                const diagnostic = `console.log('diagnosticId: ${diagnosticId}, line: ${start.line}');`;
                lines[start.line - 1] = line.substring(0, start.column + 1) + diagnostic + line.substring(start.column + 1);
                diagnosticMappings[diagnosticId] = resourcePath;
                diagnosticId++;
            }

            this.traverse(path);
        },
    });

    return lines.join('\n');
};
