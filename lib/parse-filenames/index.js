import {dirname} from 'node:path';
import putout from 'putout';
import * as convertEsmToCommonjs from '@putout/plugin-nodejs/convert-esm-to-commonjs';
import * as parseRequire from './parse-require/index.js';

const returns = (a) => () => a;

const {operator} = putout;
const {
    readFileContent,
    getFilename,
    findFile,
} = operator;

const getMessage = ({message}) => message;
const readExternalStub = returns('');

export const report = (root, {file}) => file;
export const fix = () => {};
export const scan = (root, {push, options}) => {
    const {
        entry = '/index.js',
        readExternal = readExternalStub,
    } = options;
    
    const files = new Set();
    const processingNames = new Set([entry]);
    
    for (const currentName of processingNames) {
        const [filename, content] = read(currentName, root, readExternal);
        const dir = dirname(filename);
        
        files.add(filename);
        
        const {places} = putout(content, {
            rules: {
                'parse-require': ['on', {
                    dir,
                }],
            },
            plugins: [
                ['convert-esm-to-commonjs', convertEsmToCommonjs],
                ['parse-require', parseRequire],
            ],
        });
        
        for (const name of places.map(getMessage))
            processingNames.add(name);
    }
    
    for (const file of files) {
        push(root, {
            file,
        });
    }
};

function read(currentName, root, readExternal) {
    if (!currentName.startsWith('/') && !currentName.startsWith('./'))
        return [currentName, readExternal(currentName)];
    
    const [file] = findFile(root, currentName);
    
    if (!file)
        throw Error(`file '${currentName}' not found`);
    
    const filename = getFilename(file);
    
    return [filename, readFileContent(file)];
}
