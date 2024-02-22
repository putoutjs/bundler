import {resolve} from 'node:path';
import {operator} from 'putout';

const {getTemplateValues} = operator;

const REQUIRE = 'require(__a)';

export const fix = () => {};
export const report = ({dir, filename}) => {
    if (!filename.startsWith('/') && !filename.startsWith('./'))
        return filename;
    
    const resolved = resolve(dir, filename);
    
    return resolved.endsWith('js') ? resolved : `${resolved}.js`;
};

export const traverse = ({push, options}) => ({
    [REQUIRE]: (path) => {
        const {dir = '/'} = options;
        const {__a} = getTemplateValues(path, REQUIRE);
        
        push({
            path,
            filename: __a.value,
            dir,
        });
    },
});
