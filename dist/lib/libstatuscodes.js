"use strict";
exports.__esModule = true;
exports.statusText = exports.STATUS = void 0;
exports.STATUS = {
    // 100 range: something follows
    110: function (n) { return "".concat(n, " databases present - text follows"); },
    111: function (n) { return "".concat(n, " strategies available - text follows"); },
    112: function () { return 'database information follows'; },
    113: function () { return 'help text follows'; },
    114: function () { return 'server information follows'; },
    130: function () { return 'challenge follows'; },
    150: function (n) { return "".concat(n, " definitions retrieved - definitions follow"); },
    151: function (h) { return "\"".concat(h.HEADWORD, "\" ").concat(h.DICTNAME, " \"").concat(h.DICTDESC, "\""); },
    152: function (n) { return "".concat(n, " matches found - text follows"); },
    // 200 range: everything is OK
    210: function () { return 'status'; },
    220: function (b) { return "".concat(b.TEXT, " <").concat(b.CAPABILITIES, "> <").concat(b.MSGID, ">"); },
    221: function () { return 'Closing Connection'; },
    230: function () { return 'Authentication successful'; },
    250: function () { return 'ok'; },
    // 300 range: continuation
    330: function () { return 'send response'; },
    // 400 range: temporary error
    420: function () { return 'Server temporarily unavailable'; },
    421: function () { return 'Server shutting down at operator request'; },
    // 500 range: permanent error
    500: function () { return 'Syntax error, command not recognized'; },
    501: function () { return 'Syntax error, illegal parameters'; },
    502: function () { return 'Command not implemented'; },
    503: function () { return 'Command parameter not implemented'; },
    530: function () { return 'Access denied'; },
    531: function () { return 'Access denied, use "SHOW INFO" for server information'; },
    532: function () { return 'Access denied, unknown mechanism'; },
    550: function () { return 'Invalid database, use "SHOW DB" for list of databases'; },
    551: function () { return 'Invalid strategy, use "SHOW STRAT" for a list of strategies'; },
    552: function () { return 'No match'; },
    554: function () { return 'No databases present'; },
    555: function () { return 'No strategies available'; }
};
function statusText(code) {
    var _a;
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var fn = (_a = exports.STATUS[code]) !== null && _a !== void 0 ? _a : (function () { return 'Unknown'; });
    return fn.apply(void 0, args);
}
exports.statusText = statusText;
