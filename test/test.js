/**
 * Created by COMLOG GmbH on 21.10.2016.
 */

var req = require('../');
console.info('begin');
var result = req.sync.cached('http://test.speedorder.local/js/jquery-3.1475578826.min.js');
console.info(result);
console.info('end');