/**
 * Created by COMLOG GmbH on 25.10.2016.
 */

const _os = require('os'),
    _crypto = require('crypto'),
    _fs = require('fs'),
    _path = require('path');

var
    cacheDirectory = _os.tmpdir(),
    prefix = 'cr_',
    syncrequestPath = _path.dirname(require.resolve('syncrequest')) + _path.sep + 'extend.js',
    cachedrequestPath = _path.dirname(require.resolve('cachedrequest')) + _path.sep + 'extend.js',
    srExtend = require(syncrequestPath),
    crExtend = require(cachedrequestPath),
    request = crExtend(srExtend(require('request')));

var uriToCachePath = function(uri) {
    var md5sum = _crypto.createHash('md5');
    md5sum.update(uri && uri.uri ? uri.uri : (uri && uri.url ? uri.url : uri));
    return _path.normalize(cacheDirectory + _path.sep + prefix + md5sum.digest('hex') + '.json');
}

var saveCache = function(uri, data) {
    if (!data) data = {};
    if (!data.headers) data.headers = {};

    // Expires from cache-control
    if (!data.headers['expires'] && data.headers['cache-control']) {
        var maxAgePos = -1;
        if ((maxAgePos = data.headers['cache-control'].toUpperCase().indexOf('MAX-AGE=')) > -1) {
            var maxAgePosEnd = data.headers['cache-control'].indexOf(',', maxAgePos);
            if (maxAgePosEnd < maxAgePos) maxAgePosEnd = data.headers['cache-control'].length;
            var maxAge = data.headers['cache-control'].substring(maxAgePos+8, maxAgePosEnd).trim();
            if (!isNaN(maxAge)) {
                maxAge = parseInt(maxAge);
                var expires = new Date();
                expires.setTime(expires.getTime()+maxAge*1000);
                data.headers['expires'] = expires+'';
            }
        }
    }

    // no-cache
    if (data.headers['pragma'] && data.headers['pragma'].toUpperCase().indexOf('NO-CACHE') > -1) {
        return null;
    }

    // expired
    if (data.headers['expires']) {
        var expires = new Date(data.headers['expires']);
        if (expires.getTime() < (new Date()).getTime()) callback(null, null);
    }

    var cacheFile = uriToCachePath(uri);
    try { _fs.unlinkSync(cacheFile); } catch (e) {};
    _fs.writeFileSync(cacheFile, JSON.stringify(data));
    return cacheFile;
};

var readCache = function(uri) {
    var cacheFile = uriToCachePath(uri);
    try {
        var data = _fs.readFileSync(cacheFile, 'utf8');
        data = JSON.parse(data);

        // cache check
        if (data.headers.expires) {
            expires = new Date(data.headers.expires);
            if ((new Date()).getTime() <= expires.getTime()) {
                return data;
            }
        }
        else {
            if (data.headers['last-modified']) {
                var response = request.head.sync(uri);

                if (response.headers['last-modified']) {
                    var d1 = new Date(data.headers['last-modified']);
                    var d2 = new Date(response.headers['last-modified']);
                    if (d1.getTime() == d2.getTime()) {
                        response.body = data.body;
                        return response;
                    }
                }
            }
        }
    }
    catch (e) {}

    return null;
};

var _call = function(method, uri, options) {
    var data = readCache(uri);
    if (!data) {
        var f = !method ? request.sync : request.sync[method];
        var result = f(uri, options);
        if (!result.err) {
            var cacheFile = saveCache(uri, result.response);
            //console.info(cacheFile);
        }

        return result
    }
    else {
        return {error: null, response: data, body: data.body};
    }
};

/**
 * Send cached request
 * @param {string} uri
 * @param {object|Function} options settings or Calback function
 * @param {Function} [callback]
 */
request.sync.cached = request.cached.sync = function (uri, options) { return _call(null, uri, options); };
request.get.sync.cached = request.get.cached.sync = function (uri, options) { return _call('get', uri, options); };
request.post.sync.cached = request.post.cached.sync = function (uri, options) { return _call('post', uri, options); };
request.put.sync.cached = request.put.cached.sync = function (uri, options) { return _call('put', uri, options); };
request.patch.sync.cached = request.patch.cached.sync = function (uri, options) { return _call('patch', uri, options); };
request.del.sync.cached = request.del.cached.sync = function (uri, options) { return _call('del', uri, options); };

request.parent = {setCacheDirectory: request.setCacheDirectory};
request.setCacheDirectory = function(dir) {
    request.parent.setCacheDirectory(dir);
    cacheDirectory = dir;
};

module.exports = request;