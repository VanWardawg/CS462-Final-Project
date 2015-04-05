
'use strict';

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Fix windows path issues
	require('path').sep = '/';

	// New name for replacing in this app
	var newName = '';

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		yeoman: {
			// configurable paths
			app: require('./bower.json').appPath || 'app',
			dist: 'dist',
			deployFolder: 'YOUR_DEPLOY_FOLDER_HERE',// For the app at cdn.mtc.byu.edu/flashcards, this value would be 'flashcards'
			imagesToCopy: '{webp}'// projects with a large amount of images take forever to minify and deploy. Images should be in a static location as they dont change like code
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						'!<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',// this is usually the line you would change. Images declared in the db or css dont get updated filenames when rev changes the source
						'!<%= yeoman.dist %>/styles/fonts/*'
					]
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [	'<%= yeoman.app %>/scripts/{,*/}*.js'
					// add more files to ignore here
			],
			test: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: ['test/spec/{,*/}*.js']
			}
		},

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			js: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.js', '<%= yeoman.app %>/version.json'],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: true
				}
			},
			css: {
				files: ['<%= yeoman.app %>/styles/less/**/*.less'],
				tasks: ['less:development']
			},
			bower: {
				files: ['<%= yeoman.app %>/bower_components/**/*'],
				tasks: ['wiredep'],
				options: {
					livereload: true
				}
			},
			jsTest: {
				files: ['test/spec/{,*/}*.js'],
				tasks: ['newer:jshint:test', 'karma']
			},
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= yeoman.app %>/{,*/}*.html',
					'.tmp/styles/{,*/}*.css',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		less: {
			development: {
				files: {
					'<%= yeoman.app %>/styles/main.css': '<%= yeoman.app %>/styles/less/main.less'
				}
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost',
				livereload: 35729
			},
			livereload: {
				options: {
					open: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>',
					base: [
						'.tmp',
						'<%= yeoman.app %>'
					]
				}
			},
			test: {
				options: {
					port: 9001,
					base: [
						'.tmp',
						'test',
						'<%= yeoman.app %>'
					]
				}
			},
			dist: {
				options: {
					base: '<%= yeoman.dist %>'
				}
			},
			coverage: {
				options: {
					port: 9090,
					open: 'http://<%= connect.options.hostname %>:9090',
					keepalive: true,
					base: ['coverage/html']
				}
			},
			'test-coverage': {
				options: {
					port: 9191,
					open: 'http://localhost:9191',
					keepalive: true,
					base: ['coverage/html-test']
				}
			}
		},

		// the rest of this config for this task gets generated during 'grunt build'. This is needed to make it make source maps between original code and minified code
		uglify: {
			generated: {
				options: {
					sourceMap: true,
					sourceMapIn: '.tmp/concat/scripts/scripts.js.map'
				}
			}
		},

		// Auto add bower
		wiredep: {
			target: {
				src: ['<%= yeoman.app %>/index.html']
			}
		},

		// Shell task for running any command
		shell: {
			update: {
				command: 'bower update'
			},
			install: {
				command: 'bower install'
			}
		},

		// Update app versions
		bumpup: {
			files: ['package.json', 'bower.json', '<%= yeoman.app %>/version.json']
		},

		// Deploy files for test
		// Uncomment this out if you want to allow devs to push changes to QA
		// Set host to be the server where test code lives
		// 'testKey' can be found in .ftppass in root, set user name/password there
		// 'dest' should be the folder on the server to put the code in

		// 'sftp-deploy': {
		// 	test: {
		// 		auth: {
		// 			host: 'test-apps1.mtc.byu.edu',
		// 			port: 22,
		// 			authKey: 'testKey'
		// 		},
		// 		src: '<%= yeoman.dist %>',
		// 		dest: '/cdn/<%= yeoman.deployFolder %>',
		// 		exclusions: ['<%= yeoman.dist %>/bower_components/**/*'],
		// 		server_sep: '/'
		// 	},
		// 	dev: {
		// 		auth: {
		// 			host: 'dev-apps.mtc.byu.edu',
		// 			port: 22,
		// 			authKey: 'devKey'
		// 		},
		// 		src: '<%= yeoman.dist %>',
		// 		dest: '/cdn/<%= yeoman.deployFolder %>',
		// 		exclusions: ['<%= yeoman.dist %>/bower_components/**/*'],
		// 		server_sep: '/'
		// 	},
		// 	beta: {
		// 		auth: {
		// 			host: 'beta-apps1.mtc.byu.edu',
		// 			port: 22,
		// 			authKey: 'betaKey'
		// 		},
		// 		src: '<%= yeoman.dist %>',
		// 		dest: '/cdn/<%= yeoman.deployFolder %>',
		// 		exclusions: ['<%= yeoman.dist %>/bower_components/**/*'],
		// 		server_sep: '/'
		// 	},
		// 	stage: {
		// 		auth: {
		// 			host: 'stage-apps.mtc.byu.edu',
		// 			port: 22,
		// 			authKey: 'stageKey'
		// 		},
		// 		src: '<%= yeoman.dist %>',
		// 		dest: '/cdn/<%= yeoman.deployFolder %>',
		// 		exclusions: ['<%= yeoman.dist %>/bower_components/**/*']
		// 	}
		// },

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			server: '.tmp',
			coverage: 'coverage'
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: '{,*/}*.css',
					dest: '.tmp/styles/'
				}]
			}
		},

		// Make sure autoprefixer changes make it into final css
		// (min-css will aggressively merge and break cross-browser rules)
		cssmin: {
			options: {
				noAggressiveMerging: true
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},

		// Files are concated before uglify. The source map needs to be created between original files and concatonated. The rest of this config is generated by running 'grunt build'.
		concat: {
			options: {
				sourceMap: true
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				assetsDirs: ['<%= yeoman.dist %>']
			}
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg,gif}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		htmlmin: {
			dist: {
				options: {
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeCommentsFromCDATA: true,
					removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>',
					src: ['*.html', 'views/{,*/}*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},

		// Replace Google CDN references
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'*.html',
						'*.json',
						'views/{,*/}*.html',
						'bower_components/**/*',
						'images/{,*/}*.<%= yeoman.imagesToCopy %>',
						'fonts/*'
					]
				},{
					expand: true,
					cwd: '.tmp/images',
					dest: '<%= yeoman.dist %>/images',
					src: ['generated/*']
				}, {
					expand: true,
					flatten: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>/fonts',
					src: ['bower_components/components-font-awesome/fonts/*.*']
				}]
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		// Re-name app after pulling and cloning
		replace: {
			name: {
				src: ['app/version.json', 'app/index.html', 'app/scripts/**/*.js', 'test/spec/controllers/main.js', 'bower.json', 'package.json'],
				overwrite: true,
				replacements: [{
					from: 'grunt-ng-template-mtc',
					to: function () {
						return newName;
					}
				}, {
					from: 'gruntNgTemplateMtcApp',
					to: function () {
						var name = newName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
						return name + 'App';
					}
				}]
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			server: [
				'copy:styles'
			],
			test: [
				'copy:styles'
			],
			dist: [
				'copy:styles',
				'imagemin',
				'svgmin'
			]
		},

		// Test settings
		karma: {
			options: {
				configFile: 'karma.conf.js',
				reportSlowerThan: 50
			},
			unit: {
				singleRun: true
			},
			debug: {
				singleRun: false
			},
			coverage: {
				singleRun: true,
				preprocessors: {
					'app/scripts/**/*.js': 'coverage'
				},
				reporters: ['coverage'],
				coverageReporter: {
					reporters: [{
						type: 'html',
						subdir: 'html'
					}, {
						type: 'text',
						subdir: 'text'
					}]
				}
			},
			'ci-coverage': {
				singleRun: true,
				preprocessors: {
					'app/scripts/**/*.js': 'coverage'
				},
				reporters: ['coverage'],
				coverageReporter: {
					reporters: [{
						type: 'text-summary',
						subdir: 'text-summary'
					}]
				}
			},
			'test-coverage': {
				singleRun: true,
				preprocessors: {
					'test/spec/**/*.js': 'coverage'
				},
				reporters: ['coverage'],
				coverageReporter: {
					reporters: [{
						type: 'text-summary',
						subdir: 'text-summary-test'
					}, {
						type: 'html',
						subdir: 'html-test'
					}]
				}
			},
			'ci-test-coverage': {
				singleRun: true,
				preprocessors: {
					'test/spec/**/*.js': 'coverage'
				},
				reporters: ['coverage'],
				coverageReporter: {
					reporters: [{
						type: 'text-summary',
						subdir: 'text-summary-test'
					}]
				}
			}
		},

		// Generate changelog from angular conventions
		// https://github.com/btford/grunt-conventional-changelog
		changelog: {
			options: {

			}
		}
	});


	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'shell:update',
			'wiredep',
			'less:development',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('server', function () {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run(['serve']);
	});

	grunt.registerTask('print-coverage', [
		'connect:test',
		'karma:ci-coverage'
	]);

	grunt.registerTask('print-test-coverage', [
		'connect:test',
		'karma:ci-test-coverage'
	]);

	grunt.registerTask('test', [
		'clean:coverage',
		'connect:test',
		'karma:unit',
		'karma:coverage',
		'karma:test-coverage'
	]);

	grunt.registerTask('coverage', [
		'clean:coverage',
		'connect:test',
		'karma:coverage',
		'connect:coverage'
	]);

	grunt.registerTask('coverage-test', [
		'clean:coverage',
		'connect:test',
		'karma:test-coverage',
		'connect:test-coverage'
	]);

	grunt.registerTask('test-ci', [
		'clean:server',
		'clean:coverage',
		'jshint:all',
		'jscs',
		'connect:test',
		'karma:unit',
		'concat:less',
		'less:development',
		'autoprefixer',
		'protractor:run',
		'karma:ci-coverage',
		'karma:ci-test-coverage'
	]);

	grunt.registerTask('debug', [
		'connect:test',
		'karma:debug'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'shell:install',
		'shell:update',
		'wiredep',
		'less:development',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'concat',
		'copy:dist',
		'cdnify',
		'cssmin',
		'uglify',
		'rev',
		'usemin',
		'htmlmin'
	]);

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);

	// Rename task
	grunt.registerTask('renameapp', function (name) {
		newName = name;

		if (!name) {
			grunt.fail.warn('Must supply a new name');
		}

		grunt.task.run(['replace:name']);
	});

	// To set version run
	// grunt bumpup:1.1.1 or some valid version number

	// For deploying to test grunt commands, and version control helper commands, uncomment these lines. deployopen opens the deployed project
	/*
	grunt.registerTask('deploy:test', ['default', 'sftp-deploy:test']);
	grunt.registerTask('deploy:dev', ['default', 'sftp-deploy:dev']);
	grunt.registerTask('deploy:devtest', ['default', 'sftp-deploy:dev', 'sftp-deploy:test']);
	grunt.registerTask('deploy:stage', ['default', 'sftp-deploy:stage']);
	grunt.registerTask('deploy:beta', ['default', 'sftp-deploy:beta']);
	*/
	grunt.registerTask('bump:pre', ['bumpup:prerelease', 'changelog']);
	grunt.registerTask('bump:bug', ['bumpup:patch', 'changelog']);
	grunt.registerTask('bump:minor', ['bumpup:minor', 'changelog']);
	grunt.registerTask('bump:major', ['bumpup:major', 'changelog']);
};
