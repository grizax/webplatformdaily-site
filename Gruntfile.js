module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',

		// File concatenations
		concat: {
			// Adds the reset style sheet to the front of my main CSS file
			css: {
				files: {
					'styles/daily.css': [
						'styles/reset/cssreset-min.css', 
						'styles/daily.css'
					]
				}
			},
			// Merges the components into the main MD file
			md: {
				files: {
					'content/generated/main.md': [
						'content/main/head.md',
						'content/generated/latest.temp.md'
					]
				}
			}
		},

		// File deletions
		clean: {
			temp: ['content/generated/*.temp.md']
		},

		// Generating the CSS file(s)
		sass: {
			main: {
				options: {
					style: 'compressed'
				},
				files: {
					'styles/daily.css': 'styles/daily.sass'
				}
			}
		},
		csslint: {
			strict: {
				// I've disabled this for now; it generates lots of errors by default
				// src: ['styles/daily.css']
			}
		},

		// Generating the JavaScript file(s)
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true,
					Markdown: true
				}
			},
			files: 'js/daily.js'
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			main: {
				files: {
					'js/daily.min.js': ['js/daily.js']
				}
			}
		},

		// Generating the RSS feed XML file
		markdown: {
			rss: {
				files: {
					'feed/rss.xml': ['content/generated/latest.temp.md']
				},
				options: {
					template: 'templates/rss_template.xml',
					templateContext: {
						time: (new Date).toString()
					},
					preCompile: function (src) {
						return src
								.replace(/\[@(\w+)\]\(\)/g, '[@$1](http://twitter.com/$1)')
								.replace(/\/img\//g, 'http://webplatformdaily.org/img/');
					},
					postCompile: function (src) {
						var template = grunt.file.read('templates/rss_item_template.xml');

						return src.split('<h2>').slice(1).map(function (val) {
							var title = val.match(/(.+)<\/h2>/)[1],
								id = 'http://webplatformdaily.org/#' + escape(title.replace(/[ ,]/g, ''));

							return grunt.template.process(template, {
								data: {
									title: title,
									id: id,
									val: val
								}
							});
						}).join('');
					},
					markdownOptions: {
						gfm: true
					}	
				}
			}
		},

		// Local server with live-reload
		connect: {
			server: {
				options: {
					port: 9001,
					// hostname: '0.0.0.0' // set this when testing on onother device
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			css: {
				files: ['styles/*.sass'],
				tasks: ['css']
			},
			js: {
				files: ['js/daily.js'],
				tasks: ['js']
			},
			md: {
				files: ['content/dailies/*.md', 'content/main/*.md'],
				tasks: ['md']
			},
			files: ['*.html']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('css', ['sass', 'csslint', 'concat:css']);
	grunt.registerTask('js', ['jshint', 'uglify']);
	grunt.registerTask('md', ['merge', 'concat:md', 'clean:temp']);
	grunt.registerTask('daily', ['merge', 'validate', 'concat:md', 'markdown:rss', 'clean:temp']);
	grunt.registerTask('server', ['connect', 'watch']);

	grunt.loadTasks('tasks');

};