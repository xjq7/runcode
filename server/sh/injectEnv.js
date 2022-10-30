const fs = require('fs/promises');

const args = process.argv.slice(2);

(async function () {
  let filehandle = null;
  try {
    filehandle = await fs.open('.env', 'r+');
    await filehandle.writeFile('');
    await filehandle.write(args.join('\n'));
  } catch (err) {
    console.log(err);
    process.exit(1);
  } finally {
    await filehandle?.close();
  }
})();
