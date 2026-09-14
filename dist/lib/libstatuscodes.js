"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_MESSAGES = void 0;
exports.STATUS_MESSAGES = {
    // 100 range: something follows
    110: 'database(s) present; text follows:',
    111: 'strategy/ies available; text follows:',
    112: '- Database information follows:',
    113: '- Help text follows:',
    114: '- Server information follows:',
    130: '- Challenge follows:',
    150: 'definition(s) retrieved; definitions follow:',
    151: '- Definition content follows:',
    // 200 range: everything is OK
    210: '- Status',
    221: '- Closing connection.',
    230: '- Authentication successful!',
    250: '- Command completed!',
    // 300 range: continuation
    330: '- Send response:',
    // 400 range: temporary error
    420: '- Server temporarily unavailable.',
    421: '- Server shutting down at operator request.',
    // 500 range: permanent error
    500: '- Syntax error: command not recognized.',
    501: '- Syntax error: illegal parameters.',
    502: '- Command not implemented.',
    503: '- Command parameter not implemented.',
    530: '- Access denied.',
    531: '- Access denied. Use "SHOW INFO" for server information.',
    532: '- Access denied: unknown mechanism.',
    550: '- Invalid database. Use "SHOW DB" for list of databases.',
    551: '- Invalid strategy. Use "SHOW STRAT" for a list of strategies.',
    552: '- No match found.',
    554: '- No databases present.',
    555: '- No strategies available.'
};
