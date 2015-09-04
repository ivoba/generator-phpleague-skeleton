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
        '' + chalk.red('PhpleagueSkeleton') + ' generator to ease php package creation!'
      ));

      var prompts = [
        {
          name: 'projectName',
          message: 'What is the name of your package?',
          default: _.slugify(process.cwd().split(path.sep).pop())
        },
        {
          name: 'vendorName',
          message: 'What is the vendor name (f.e. github name)?',
          default: path.join(getUserHome().split(path.sep).pop())
        },
        {
          name: 'organizationName',
          message: 'What is the organization name? (defaults to vendor name)',
          default: function(answers) {
            return answers.vendorName;
          }
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
          message: 'What is the project homepage?',
          default: function(answers) {
            return 'https://www.github.com/' + answers.organizationName + '/' + answers.projectName;
          }
        },
        {
          name: 'ownerName',
          message: 'What is the author name?',
          default: this.owner.name
        },
        {
          name: 'ownerEmail',
          message: 'What is author email?',
          default: this.owner.email
        },
        {
          name: 'ownerHomepage',
          message: 'What is author homepage?'
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
          reOrganizationName = new RegExp('thephpleague', 'g'),
          reVendorName = new RegExp('league', 'g'),
          reVendorNameCapitalized = new RegExp('League', 'g'),
          reSkeleton = new RegExp('Skeleton', 'g'),
          reSkeletonLower = new RegExp('skeleton', 'g'),
          rePackageName = new RegExp(':package_name', 'g'),
          reDescription = new RegExp(':package_description', 'g'),
          reAuthorName = new RegExp(':author_name', 'g'),
          reAuthorUserName = new RegExp(':author_username', 'g'),
          reAuthorHomepage = new RegExp(':author_website', 'g'),
          reAuthorEmail = new RegExp(':author_email', 'g');

        if (this.props.organizationName == '') {
          this.props.organizationName = this.props.vendorName;
        }
        var yeo = this;
        this.log('cloning skeleton repo');
        //todo possibly its better to do the cloning in sync mode
        // we cant use remote() here as the .gitattributes strips out tests & other files from the archive
        exec('git clone git@github.com:thephpleague/skeleton.git .', function (err, stdout, stderr) {
          yeo.log('cloned repo: ' + stdout);
          rmdir('.git', function (error) {
            yeo.log('removed .git folder');
            glob("**/*.*", function (er, files) {
              files.forEach(function (file) {
                var fileContent = htmlWiring.readFileAsString(file);
                var newContent = fileContent.replace(reProjectHomepage, yeo.props.projectHomepage)
                  .replace(/\*\*Note:(.*)\n/, "")
                  .replace(reOrganizationName, yeo.props.organizationName)
                  .replace(reVendorName, yeo.props.vendorName)
                  .replace(reVendorNameCapitalized, _.capitalize(yeo.props.vendorName))
                  .replace(rePackageName, yeo.props.projectName)
                  .replace(reSkeleton, _.capitalize(yeo.props.projectName))
                  .replace(reSkeletonLower, yeo.props.projectName)
                  .replace(reDescription, yeo.props.projectDescription)
                  .replace(reAuthorUserName, yeo.props.vendorName)
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
