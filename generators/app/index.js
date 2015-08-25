'use strict';
var yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  yosay = require('yosay'),
  exec = require('child_process').exec,
  _ = require('underscore.string'),
  rmdir = require('rimraf'),
  path = require('path'),
  ini = require('ini'),
  fs = require('fs'),
  glob = require('glob'),
  htmlWiring = require("html-wiring");

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

module.exports = yeoman.generators.Base.extend({
    project: {
      name: '',
      description: '',
      keywords: 'php',
      homepage: ''
    },
    owner: {
      name: '',
      email: '',
      homepage: ''
    },
    prompting: function () {
      var done = this.async();

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the praiseworthy ' + chalk.red('PhpleagueSkeleton') + ' generator!'
      ));

      var prompts = [
        {
          name: 'projectName',
          message: 'What is the name of your project?',
          default: path.join(getUserHome().split(path.sep).pop(), '/', _.slugify(process.cwd().split(path.sep).pop()))
        },
        {
          name: 'projectDescription',
          message: 'Add a project description'
        },
        {
          name: 'projectKeywords',
          message: 'What are the project keywords?',
          default: this.project.keywords
        },
        {
          name: 'projectHomepage',
          message: 'What is the project homepage?'
        },
        {
          name: 'projectNamespace',
          message: 'What is the project namespace?',
          default: _.capitalize((path.join(getUserHome().split(path.sep).pop()))) + '\\\\' + _.camelize(_.capitalize((process.cwd().split(path.sep).pop())))
        },
        {
          name: 'ownerName',
          message: 'What is your name?',
          default: this.owner.name
        },
        {
          name: 'ownerEmail',
          message: 'What is your email?',
          default: this.owner.email
        },
        {
          name: 'ownerHomepage',
          message: 'What is your homepage?'
        }
      ];

      this.prompt(prompts, function (props) {
        this.props = props;
        // To access props later use this.props.someOption;

        done();
      }.bind(this));
    },
    initializing: {
      get_defaults: function () {
        this.ownerName = getUserHome().split(path.sep).pop();

        var gitconfigFile = getUserHome() + '/.gitconfig';
        if (fs.lstatSync(gitconfigFile)) {
          var gitconfig = ini.parse(fs.readFileSync(gitconfigFile, 'utf-8'))

          this.owner.name = gitconfig.user.name || getUserHome().split(path.sep).pop();
          this.owner.email = gitconfig.user.email || '';
        }
      }
    },
    writing: {
      replace: function () {
        var reProjectHomepage = new RegExp('https://github.com/thephpleague/:package_name', 'g'),
          reProjectName = new RegExp('league/:package_name', 'g'),
          rePackageName = new RegExp(':package_name', 'g'),
          reDescription = new RegExp(':package_description', 'g'),
          reAuthorName = new RegExp(':author_name', 'g'),
          reAuthorHomepage = new RegExp(':author_website', 'g'),
          reAuthorEmail = new RegExp(':author_email', 'g'),
          reNamespace = new RegExp('League\\\\\\\\Skeleton', 'g');
        
        this.log(this.props);
        var yeo = this;
        this.log('cloning skeleton repo');
        exec('git clone git@github.com:thephpleague/skeleton.git .', function (err, stdout, stderr) {
          yeo.log('cloned repo: ' + stdout);
          rmdir('.git', function (error) {
            yeo.log('removed .git folder');
            glob("**/*.*", function (er, files) {
              yeo.log(files);
              /*
              todo:
              - replace league keyword
              - replace League
              - replace :author_username
              - avoid thephpivo/testlib
              - replace  League\Skeleton in php files &readme
              - replace League Test Suite
              - replace **Note:** Replace ```ee``` ```:author_username``` ```qq``` ```ww``` ```ivo/testlib``` ```assa``` with their correct values in [README.md](README.md), [CHANGELOG.md](CHANGELOG.md), [CONTRIBUTING.md](CONTRIBUTING.md), [LICENSE.md](LICENSE.md) and [composer.json](composer.json) files, then delete this line.
               */
              files.forEach(function (file) {
                var fileContent = htmlWiring.readFileAsString(file);
                var newContent = fileContent.replace(reProjectHomepage, yeo.props.projectHomepage)
                  .replace(reProjectName, yeo.props.projectName)
                  .replace(rePackageName, yeo.props.projectName)
                  .replace(reDescription, yeo.props.projectDescription)
                  .replace(reNamespace, yeo.props.projectNamespace)
                  .replace(reAuthorName, yeo.props.ownerName)
                  .replace(reAuthorHomepage, yeo.props.ownerHomepage)
                  .replace(reAuthorEmail, yeo.props.ownerEmail);
                yeo.log('updating file: ' + file);
                htmlWiring.writeFileFromString(newContent, file);
              });
            });
          });
        });
      }
    }
  }
);
