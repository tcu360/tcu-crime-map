module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({

    // Empty directories before build process
    clean: {
      css: ["dist/*.css", "dist/*.css.map"],
      js: ["dist/*.js", "dist/*.js.map"]
    },

    // Transpile LESS
    less: {
      options: {
        sourceMap: true,
        sourceMapFilename: "dist/style.css.map",
        sourceMapUrl: "style.css.map",
        sourceMapRootpath: '../',
        compress: true
      },
      css: {
        files: {
          "dist/style.css": "src/css/style.less"
        }
      }
    },

    // Run our JavaScript through JSHint
    /*
    jshint: {
      js: {
        src: ['js/**.js']
      }
    },
    */

    // Uglify/minify concatenated scripts
    uglify: {
      options: {
        sourceMap: true
      },
      js: {
        files: {
          "dist/scripts.js": [
            'src/js/jquery.js',
            'src/js/moment.js',
            'bootstrap/js/bootstrap.js',
            'src/js/jquery.tablesorter.js',
            'src/js/jquery.tablesorter.widgets.js',
            'src/js/daterangepicker.js',
            'src/js/jquery.address.js',
            'src/js/oms.min.js',
            'src/js/jquery.geocomplete.js',
            'src/js/maps_lib.js',
            'src/js/main.js'
          ]
        }
      }
    },

    // A lightweight local development server
    connect: {
      server: {
        options: {
          port: 3600,
          keepalive: true,
          livereload: 35729,
          open: true,
          useAvailablePort: true
        }
      }
    },

    // Watch for changes in LESS and JavaScript files,
    // relint/retranspile when a file
    watch: {
      options: {
        livereload: 35729,
      },
      scripts: {
        files: ['src/js/**.js'],
        tasks: ['clean:js', 'uglify']
      },
      styles: {
        files: ['src/css/**.less'],
        tasks: ['clean:css', 'less']
      }
    },

    // Concurrently run the dev server and watch task
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      dev: ['connect', 'watch'],
    }

  });

  // Load the task plugins
  grunt.loadNpmTasks('grunt-contrib-less');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['clean', 'less', 'uglify']);
  grunt.registerTask('default', ['build', 'concurrent']);

};
