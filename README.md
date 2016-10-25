# Sync + Cached version of Request

Allow you send cached + sync requests. Depends on "syncrequest", "cachedrequest" and "request" module https://github.com/request/request/.
No extra configuration needed.

#### Installation
```sh
$ npm install -s cachedsyncrequest
```

#### Simple:
```javascript
var request = require('cachedsyncrequest');
var result = request.cached.sync('http://www.comlog.org');
console.info(result);
```

#### Set cache direcotry:
```javascript
var request = require('cachedsyncrequest');
request.setCacheDirectory('/my/path/to/cache/folder');
var result = request.cached.sync('http://www.comlog.org');
console.info(result);
```

#### Clear cache:
```javascript
var request = require('cachedsyncrequest');
request.setCacheDirectory('/my/path/to/cache/folder');
request.clearCache(function(errors, removed) {
    console.error(errors);
    console.info(removed);
});
```