"use strict";
exports.__esModule = true;
exports.decorateMatchResponse = void 0;
function decorateMatchResponse(res) {
    var r = res;
    r.writeDatabases = function writeDatabases(databases, message, okMessage) {
        if (message === void 0) { message = 'databases present - text follows'; }
        if (okMessage === void 0) { okMessage = 'ok'; }
        if (databases.length > 0) {
            r.status(110)
                .writeMessage(String(databases.length).concat(' ', message))
                .ok(okMessage);
            return r;
        }
        return r.status(554);
    };
    return r;
}
exports.decorateMatchResponse = decorateMatchResponse;
