module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
        , gitpull: {
            origin: {
                options: {
                  // Target-specific options go here.
                },
                files: {
                    // Specify the files you want to commit
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-git');
    grunt.registerTask('default', ['grunt-git']);

};