// Keep startup diagnostics without a console or shell command quoting.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const log = path.join(process.env.VAULTCRAFT_DATA_DIR, 'servidor.log');
for (const stream of [process.stdout, process.stderr]) {
  stream.write = function (chunk, encoding, callback) {
    try { fs.appendFileSync(log, chunk); } catch {}
    if (typeof encoding === 'function') encoding();
    else if (typeof callback === 'function') callback();
    return true;
  };
}
const emit = http.Server.prototype.emit;
http.Server.prototype.emit = function (event, ...args) {
  if (event === 'request' && args[0].url === '/__vaultcraft/health') {
    args[1].writeHead(200, {'Content-Type':'text/plain', 'Cache-Control':'no-store'});
    args[1].end(process.env.VAULTCRAFT_INSTANCE_TOKEN);
    return true;
  }
  return emit.call(this, event, ...args);
};
require(path.join(__dirname, 'app', 'server.js'));
