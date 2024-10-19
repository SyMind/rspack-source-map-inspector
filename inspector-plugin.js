const lineColumn = require("line-column");
const { SourceMapConsumer } = require('source-map');
const { explore } = require("source-map-explorer");

class InspectorPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('LogFilesPlugin', async (compilation, callback) => {
      let total = 0;
      let incorrectCount = 0;

      const jsFiles = Object.keys(compilation.assets).filter(file => file.endsWith('.js'));
      for (const jsFile of jsFiles) {
        const mapAsset = compilation.assets[`${jsFile}.map`];
        if (!mapAsset) {
          continue;
        }
        const code = compilation.assets[jsFile].source();
        const map = mapAsset.source();

        await explore([
          {
            code: Buffer.from(code),
            map: Buffer.from(map),
          }
        ]).catch(({ errors }) => {
          if (errors.length) {
            const { message } = errors[0];
            throw new Error(message);
          }
        });

        await SourceMapConsumer.with(map, null, consumer => {
          const regex = /console\.log\(['"]diagnosticId: (\d+), line: (\d+)['"]\);/g;
          let match;
          while ((match = regex.exec(code)) !== null) {
            total++;

            const [_, diagnosticId, originLineLiteral] = match;
            const originLine = parseInt(originLineLiteral, 10);
            const { line: generatedLine, col: generatedColumn } = lineColumn(code).fromIndex(match.index);

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

        console.log('Total diagnostics:', total);
        console.log('Incorrect diagnostics:', incorrectCount);
      }

      callback();
    });
  }
}

module.exports = InspectorPlugin;