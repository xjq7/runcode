const fs = require('fs/promises');

const args = process.argv.slice(2);

(async function () {
  let filehandle = null;
  try {
    await fs.unlink('.env');
    await fs.writeFile('.env', args.join('\n'));
  } catch (err) {
    console.log(err);
    process.exit(1);
  } finally {
    await filehandle?.close();
  }
})();
