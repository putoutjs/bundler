import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';

const {resolve} = createRequire(import.meta.url);

export const readExternal = (name) => {
    const absolute = resolve(name);
    return readFileSync(absolute);
};
