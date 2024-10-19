const { SourceMapConsumer } = require('source-map');
const lineColumn = require("line-column");

class InspectorPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('LogFilesPlugin', async (compilation, callback) => {
      let total = 0;
      let incorrectCount = 0;

      const jsFiles = Object.keys(compilation.assets).filter(file => file.endsWith('.js'));
      for (const jsFile of jsFiles) {
        const map = compilation.assets[`${jsFile}.map`];
        if (!map) {
          continue;
        }
        const source = compilation.assets[jsFile].source();

        await SourceMapConsumer.with(map.source(), null, consumer => {
          const regex = /console\.log\("diagnosticId: (\d+), line: (\d+)"\);/g;
          let match;
          while ((match = regex.exec(source)) !== null) {
            total++;

            const [_, diagnosticId, originLineLiteral] = match;
            const originLine = parseInt(originLineLiteral, 10);
            const { line: generatedLine, col: generatedColumn } = lineColumn(source).fromIndex(match.index);

            const originalPosition = consumer.originalPositionFor({
              line: generatedLine,
              column: generatedColumn
            });
            if (originalPosition.line !== originLine) {
              incorrectCount += 1;
              console.log(`Mismatch: ${jsFile} diagnosticId=${diagnosticId}`);
            }
          }
        });

        console.log('Total diagnostics:', total, 'Incorrect diagnostics:', incorrectCount);
      }

      callback();
    });
  }
}

module.exports = InspectorPlugin;