/**
 * Created by COMLOG GmbH on 21.10.2016.
 */

var req = require('../');
console.info('begin');
var result = req.sync.cached({uri:'http://www.comlog.org/', formData: {test:'test'}});
console.info(result);
console.info('end');