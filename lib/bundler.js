import {createProgress} from '@putout/engine-runner/progress';
import * as pluginFilesystem from '@putout/plugin-filesystem';
import {
    parse,
    transform,
    print,
    findPlaces,
} from 'putout';
import {
    branch as originalBranch,
    merge as originalMerge,
} from '@putout/processor-filesystem';
import * as pluginParseFilenames from './parse-filenames/index.js';
import * as pluginResolveFilenames from './resolve-filenames/index.js';
import * as pluginBundleFiles from './bundle-files/index.js';

const [, replaceCwd] = pluginFilesystem.rules['replace-cwd'];
const [, readAllFiles] = pluginFilesystem.rules['read-all-files'];

const getMessage = (a) => a.message;

export const bundle = (from, entry, filesystem, overrides = {}) => {
    const {
        progress = createProgress(),
        branch = originalBranch,
        merge = originalMerge,
    } = overrides;
    
    const [{source}] = branch(filesystem);
    const ast = parse(source);
    
    transform(ast, filesystem, {
        fix: true,
        fixCount: 1,
        progress,
        rules: {
            'read-all-files': ['on', {
                mask: '*.js',
            }],
            'replace-cwd': ['on', {
                from,
                to: '/',
            }],
        },
        plugins: [
            ['read-all-files', readAllFiles],
            ['replace-cwd', replaceCwd],
        ],
    });
    
    const places = findPlaces(ast, filesystem, {
        rules: {
            'parse-filenames': ['on', {
                entry,
            }],
        },
        plugins: [
            ['parse-filenames', pluginParseFilenames],
        ],
    });
    
    const code = print(ast);
    
    merge(filesystem, [code]);
    const filenames = places.map(getMessage);
    
    transform(ast, filesystem, {
        progress,
        rules: {
            'resolve-filenames': ['on', {
                filenames,
            }],
            'bundle-files': ['on', {
                entry: filenames[0],
                filenames,
            }],
        },
        plugins: [
            ['resolve-filenames', pluginResolveFilenames],
            ['bundle-files', pluginBundleFiles],
        ],
    });
    
    return print(ast);
};
