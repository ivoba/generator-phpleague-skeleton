'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var exec = require('child_process').exec;
var _ = require('underscore.string');
var rmdir = require('rimraf');
var path = require('path');
var ini = require('ini');
var fs = require('fs');
var htmlWiring = require("html-wiring");

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
                default: path.join(getUserHome().split(path.sep).pop(), '\\', _.slugify(process.cwd().split(path.sep).pop()), '\\')
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
    initializing: function () {
        this.underscoreString = _;

        this.ownerName = getUserHome().split(path.sep).pop();

        var gitconfigFile = getUserHome() + '/.gitconfig';
        if (fs.lstatSync(gitconfigFile)) {
            var gitconfig = ini.parse(fs.readFileSync(gitconfigFile, 'utf-8'))

            this.owner.name = gitconfig.user.name || getUserHome().split(path.sep).pop();
            this.owner.email = gitconfig.user.email || '';
        }
    },

    default: {
        //git_clone: function () {
        //    var yeo = this;
        //    this.log('cloning skeleton repo');
        //    exec('git clone git@github.com:thephpleague/skeleton.git .', function (err, stdout, stderr) {
        //        yeo.log('cloned repo: ' + stdout);
        //        rmdir('.git', function (error) {
        //            yeo.log('removed .git folder');
        //        });
        //
        //    });
        //}
    },
    writing: {
        replace_namespace: function(){
            this.log(this.props);
            var file = htmlWiring.readFileAsString('composer.json');
            var reProjectHomepage = new RegExp('https://github.com/thephpleague/:package_name', 'g');
            var reProjectName = new RegExp('league/:package_name', 'g');
            var reDescription = new RegExp(':package_description', 'g');
            var reAuthorName = new RegExp(':author_name', 'g');
            var reAuthorHomepage = new RegExp(':author_website', 'g');
            var reAuthorEmail = new RegExp(':author_email', 'g');
            var reNamespace = new RegExp('League\\\\\\\\Skeleton\\\\\\\\', 'g');
//todo
//            var reKeywords = new RegExp('"league",
//            ":package_name"', 'g');


            var newContent = file.replace(reProjectHomepage, this.props.projectHomepage)
                                 .replace(reProjectName, this.props.projectName)
                                 .replace(reDescription, this.props.projectDescription)
                                 .replace(reNamespace, this.props.projectNamespace)
                                 .replace(reAuthorName, this.props.ownerName)
                                 .replace(reAuthorHomepage, this.props.ownerHomepage)
                                 .replace(reAuthorEmail, this.props.ownerEmail);
            htmlWiring.writeFileFromString(newContent, 'composer.json');
        }
        //app: function () {
        //  this.fs.copy(
        //    this.templatePath('_package.json'),
        //    this.destinationPath('package.json')
        //  );
        //  this.fs.copy(
        //    this.templatePath('_bower.json'),
        //    this.destinationPath('bower.json')
        //  );
        //},
        //
        //projectfiles: function () {
        //  this.fs.copy(
        //    this.templatePath('editorconfig'),
        //    this.destinationPath('.editorconfig')
        //  );
        //  this.fs.copy(
        //    this.templatePath('jshintrc'),
        //    this.destinationPath('.jshintrc')
        //  );
        //}
    }

    //install: function () {
    //this.installDependencies();
    //}
});
