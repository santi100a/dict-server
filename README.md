# Santi's DICT Server

[![Build Status][workflow badge]][repo actions]
[![npm homepage][npm badge]][npm home]
[![GitHub stars][stars badge]][repo url]
[![License][license badge]][repo url]
[![Bundlephobia stats][bundlephobia badge]][bundlephobia url]

[workflow badge]: https://github.com/santi100a/dict-server/actions/workflows/ci.yml/badge.svg
[npm badge]: https://img.shields.io/npm/v/@santi100a/dict-server
[stars badge]: https://img.shields.io/github/stars/santi100a/dict-server.svg
[license badge]: https://img.shields.io/github/license/santi100a/dict-server.svg
[bundlephobia badge]: https://img.shields.io/bundlephobia/min/@santi100a/dict-server
[npm home]: https://npmjs.org/package/@santi100a/dict-server
[repo actions]: https://github.com/santi100a/dict-server/actions
[repo url]: https://github.com/santi100a/dict-server
[bundlephobia url]: https://bundlephobia.com/package/@santi100a/dict-server@latest

## Description

This package provides a full DICT (RFC 2229) server implementation for Node.js.

The API takes inspiration from the [Express.js](https://github.com/expressjs/express)
framework, but adapts it to the DICT protocol model by allowing you to register handlers for 
DICT commands such as `DEFINE`, `MATCH`, `SHOW DATABASES`, etc.

It includes:

- A TCP-based DICT server
- A `DictResponse` class for RFC-compliant protocol replies
- Optional metadata configuration (server banner, info, strategies, databases, etc.)
- Async handler model
- Graceful shutdown

## Installation

```sh
npm install @santi100a/dict-server # NPM, OR
yarn add @santi100a/dict-server # Yarn, OR
pnpm add @santi100a/dict-server # PNPM
```

## Usage

### Usage example

```javascript

import { DictServer } from '@santi100a/dict-server/server.class'; // TypeScript, OR
const DictServer = require('@santi100a/dict-server'); // CommonJS

// Create a new DICT server instance
const server = new DictServer();

// Configure metadata
server
  .setServerInfo('MyDictServer 1.0')
  .setDatabases([
    { name: 'simple', desc: 'Simple example dictionary' }
  ])
  .setStrategies([
    { name: 'exact', desc: 'Exact string matching' }
  ]);

// Register a DEFINE handler
server.define(async (cmd, res) => {
  const [db, word] = cmd.arguments;
  if (db !== '*' && db !== 'simple') {
    return res.status(550, 'no database present');
  }

  if (word === 'example') {
    res.writeDefinitions([{
      database: 'simple',
      dictionary: 'simple',
      dictionaryDescription: 'Simple example dictionary',
      definition: 'An example definition of the word "example".'
    }]);
    return res.status(250, 'ok');
  }

  return res.status(552, 'no match');
});

// Bind to a port
server.listen(2628, () => {
  console.log('DICT server listening on port 2628');
});
```

Then from a DICT client or TCP terminal program:

```sh
dict -h localhost example # dictd's dict client
curl dict://localhost/d:example # curl
telnet localhost 2628 # interactive session - you can type commands
```
### Handlers

Handlers override default behaviors:

```javascript
server.define(fn);        // DEFINE word
server.match(fn);         // MATCH word using strategy
server.showDatabases(fn); // SHOW DATABASES
server.showStrategies(fn);// SHOW STRATEGIES
server.showServer(fn);    // SHOW SERVER
server.showStatus(fn);    // STATUS
server.client(fn);        // CLIENT
```

Each handler receives:
```typescript
(cmd: DictCommand, res: DictResponse) => Promise<void> | void
```

Your handlers reply using DictResponse, which exposes convenient methods like:

```javascript
res.status(250, 'ok');
res.writeDefinitions(...);
res.writeMatches(...);
res.writeDatabases(...);
```

Response formatting (dot-stuffing, CRLF conventions, etc.) is handled for you.

### Graceful Shutdown

```javascript
await server.shutdown();
```

This stops the server from accepting new connections.

## License
See the [LICENSE](./LICENSE) file.