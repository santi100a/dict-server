"use strict";
exports.__esModule = true;
exports.createLineReader = void 0;
function createLineReader(socket) {
    var buffer = '';
    var ended = false;
    var destroyed = false;
    var lineQueue = [];
    var waiterQueue = [];
    var processBuffer = function () {
        var idx;
        // Support both CRLF and LF line endings
        while ((idx = buffer.indexOf('\n')) !== -1) {
            var line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            // Strip trailing \r if present
            if (line.endsWith('\r'))
                line = line.slice(0, -1);
            var waiter = waiterQueue.shift();
            if (waiter) {
                waiter.resolve(line);
            }
            else {
                lineQueue.push(line);
            }
        }
    };
    var onData = function (chunk) {
        if (destroyed)
            return;
        buffer += chunk.toString('utf8');
        processBuffer();
    };
    var onError = function (error) {
        destroyed = true;
        while (waiterQueue.length > 0) {
            var waiter = waiterQueue.shift();
            waiter.reject(error);
        }
    };
    var onEnd = function () {
        var _a;
        ended = true;
        // Flush any leftover data as a line
        if (buffer.length > 0) {
            lineQueue.push(buffer);
            buffer = '';
        }
        processBuffer();
        while (waiterQueue.length > 0) {
            var waiter = waiterQueue.shift();
            var line = (_a = lineQueue.shift()) !== null && _a !== void 0 ? _a : null;
            waiter.resolve(line);
        }
    };
    var onClose = function () {
        destroyed = true;
        while (waiterQueue.length > 0) {
            var waiter = waiterQueue.shift();
            waiter.reject(new Error('Socket closed'));
        }
    };
    // Attach events
    socket.on('data', onData);
    socket.on('error', function (err) {
        // Ignore ECONNRESET from clients disconnecting abruptly
        if (err.code === 'ECONNRESET')
            return;
        onError(err);
    });
    socket.once('end', onEnd);
    socket.once('close', onClose);
    // The actual readLine function
    return function readLine() {
        return new Promise(function (resolve, reject) {
            if (destroyed) {
                reject(new Error('Socket destroyed'));
                return;
            }
            // If a line is already buffered, return it immediately
            if (lineQueue.length > 0) {
                resolve(lineQueue.shift());
                return;
            }
            // If socket ended, return null
            if (ended) {
                resolve(null);
                return;
            }
            // Otherwise, wait for data
            waiterQueue.push({ resolve: resolve, reject: reject });
        });
    };
}
exports.createLineReader = createLineReader;
