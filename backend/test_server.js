const fs = require('fs');
try {
  require('./server.js');
} catch (e) {
  fs.writeFileSync('error_log.txt', e.stack, 'utf8');
}
