const recast = require("recast");

const b = recast.types.builders;

module.exports = function (source) {
    const ast = recast.parse(source);

    let diagnosticId = 0;
    let lineOffset;

    recast.visit(ast, {
        visitProgram(path) {
            diagnosticId++;
            lineOffset = 1;
            this.traverse(path);
        },
        visitBlockStatement(path) {
            const body = path.get('body').node;
            const line = body.loc.start.line + lineOffset;
            lineOffset ++;

            const consoleLog = b.expressionStatement(
                b.callExpression(
                    b.memberExpression(b.identifier('console'), b.identifier('log')),
                    [b.stringLiteral(`diagnosticId: ${diagnosticId}, line: ${line}`)]
                )
            );

            body.body.unshift(consoleLog);

            this.traverse(path);
        },
    });

    const { code } = recast.print(ast, {
        parser: require("recast/parsers/babel-ts"),
    });

    return code;
};
