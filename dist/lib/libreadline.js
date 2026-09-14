"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLineReader = void 0;
function createLineReader(socket) {
    var buffer = '';
    var ended = false;
    var lineQueue = [];
    var waiterQueue = [];
    var cleanup = function () {
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
        socket.removeListener('end', onEnd);
        socket.removeListener('close', onClose);
    };
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
        if (ended)
            return;
        buffer += chunk.toString('utf8');
        processBuffer();
    };
    var onError = function (error) {
        if (error.code === 'ECONNRESET') {
            onClose();
            return;
        }
        ended = true;
        cleanup();
        while (waiterQueue.length > 0) {
            waiterQueue.shift().reject(error);
        }
    };
    var onEnd = function () {
        onClose();
    };
    var onClose = function () {
        var _a;
        if (ended)
            return;
        ended = true;
        cleanup();
        // Flush any leftover data in buffer as a line
        if (buffer.length > 0) {
            lineQueue.push(buffer);
            buffer = '';
        }
        processBuffer();
        // Resolve any remaining waiting calls with null (EOF)
        while (waiterQueue.length > 0) {
            var waiter = waiterQueue.shift();
            var line = (_a = lineQueue.shift()) !== null && _a !== void 0 ? _a : null;
            waiter.resolve(line);
        }
    };
    // Attach events
    socket.on('data', onData);
    socket.on('error', onError);
    socket.once('end', onEnd);
    socket.once('close', onClose);
    // The actual readLine function
    return function readLine() {
        return new Promise(function (resolve, reject) {
            // If a line is already buffered, return it immediately
            if (lineQueue.length > 0) {
                resolve(lineQueue.shift());
                return;
            }
            // If socket ended or closed, return null cleanly
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
