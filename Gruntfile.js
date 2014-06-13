module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
        , gitpull: {
            origin: {
                options: {
                    branch: 'master'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-git');
    grunt.registerTask('default', ['gitpull']);

};