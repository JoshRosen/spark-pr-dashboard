module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    react: {
      jsx: {
        files: [
          {
            expand: true,
            cwd: 'static/jsx',
            src: [ '**/*.jsx' ],
            dest: 'static/js',
            ext: '.js'
          }
        ]
      }
    },

    jscs: {
      src: "static/js/**/*.js"
    },

    watch: {
      react: {
        files: 'static/jsx/**/*.jsx',
        tasks: ['react']
      }
    }
  });

  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('default', ['react']);
};
