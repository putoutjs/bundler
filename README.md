# Bundle [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/@putout/bundler "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/@putout/bundler.svg?style=flat&longCache=true
[BuildStatusURL]: https://github.com/putoutjs/printer/actions/workflows/nodejs.yml "Build Status"
[BuildStatusIMGURL]: https://github.com/putoutjs/printer/actions/workflows/nodejs.yml/badge.svg
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageURL]: https://coveralls.io/github/putoutjs/printer?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/putoutjs/printer/badge.svg?branch=master&service=github

## Install

```
npm i @putout/bundle
```

## API

```js
import {bundle} from '@putout/bundler';

console.log(bundle(CWD, entry, filesystem));
```

## Convert ESM to CommonJS

To Simplify things up all files converted to CommonJS first.
Let's suppose none of them use top-level await to get things simpler.

## Parse filenames

Traverse all files starting from `entry` and get all filenames.

- [`parse-require`](https://putout.cloudcmd.io/#/gist/d973366be6b07ab705b5c9d793369904/ca8b6b15fa953d95f57b42e07136c65791f38ca1);
- [`parse-filenames`](https://putout.cloudcmd.io/#/gist/d973366be6b07ab705b5c9d793369904/3067150ad161029e75b95e9bfff290e03953ef41);
- [`resolve-filenames`](https://putout.cloudcmd.io/#/gist/8ca1ac9b5fb4d1a47d185836c3f0b393/edf99b8064fe0faf4545aa0cc66138a7fa34c557);
- [`resolve-require`](https://putout.cloudcmd.io/#/gist/833539f66cb238fcc3b6ca6cee61ef9e/79a068c96b686bb0eacdf3f570d532981499b114);
- [`bundle-files`](https://putout.cloudcmd.io/#/gist/7dd3bffa8e88f7542c84065f622b63d7/3b1e68e0babc3a72af947076ed9801c0034a096e);

## Bundle all files to object

Traverse filesystem and create object that contains filename and file content:

```js
const __filesystem = {
    '/entry.js': () => {
        const client = require('/client.js');
        console.log(client);
    },
    '/client.js': (exports, require, module) => {
        module.exports = 'hello';
    },
};
```

## IIFE

Most likely we need IIFE so couple bundles can be loaded on page simultaneously.

## Result Example

```js
const __modules = {};
const __filesystem = {
    '/entry.js': () => {
        const client = require('/client.js');
        console.log(client);
    },
    '/client.js': (exports, require, module) => {
        module.exports = 'hello';
    },
};

const require = (name) => {
    const exports = {};
    const module = {
        exports,
    };
    
    if (__modules[name])
        return __modules[name];
    
    __filesystem[name](exports, require, module);
    __modules[name] = module.exports;
    
    return module.exports;
};

require('/entry.js');
```

## License

MIT
