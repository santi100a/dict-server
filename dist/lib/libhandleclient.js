"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.handleClient = void 0;
var libparsecommand_1 = require("./libparsecommand");
var libreadline_1 = require("./libreadline");
function handleClient(socket, onCommand, response) {
    return __awaiter(this, void 0, void 0, function () {
        var readLine, line, command, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    readLine = (0, libreadline_1.createLineReader)(socket);
                    _b.label = 1;
                case 1:
                    if (!!socket.destroyed) return [3 /*break*/, 10];
                    return [4 /*yield*/, readLine()];
                case 2:
                    line = _b.sent();
                    if (line === null)
                        return [3 /*break*/, 10];
                    if (!line.trim()) {
                        return [3 /*break*/, 1];
                    }
                    if (!(line.length > 1024)) return [3 /*break*/, 4];
                    // Line too long - invalid!
                    return [4 /*yield*/, onCommand({
                            raw: line.split('').slice(0, 1024).join(''),
                            name: '',
                            parameters: [],
                            syntaxValid: false
                        }, response)];
                case 3:
                    // Line too long - invalid!
                    _b.sent();
                    return [3 /*break*/, 1];
                case 4:
                    command = void 0;
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 6, , 8]);
                    command = (0, libparsecommand_1.parseCommand)(line);
                    return [3 /*break*/, 8];
                case 6:
                    _a = _b.sent();
                    // Parsing error → invalid command
                    return [4 /*yield*/, onCommand({
                            raw: line,
                            name: '',
                            parameters: [],
                            syntaxValid: false
                        }, response)];
                case 7:
                    // Parsing error → invalid command
                    _b.sent();
                    return [3 /*break*/, 1];
                case 8: return [4 /*yield*/, onCommand(command, response)];
                case 9:
                    _b.sent();
                    // Break after QUIT command
                    if (command.name === 'QUIT') {
                        return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.handleClient = handleClient;
