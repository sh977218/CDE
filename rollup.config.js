import {uglify} from 'rollup-plugin-uglify';
// import {minify} from 'uglify-js';

export default {
    plugins: [
        uglify()
    ]
};
