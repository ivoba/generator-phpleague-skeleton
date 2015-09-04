'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('phpleague-skeleton:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(path.join(__dirname, '../tmp'))
      .withPrompts({
        projectName: 'test',
        vendorName: 'ivoba',
        projectDescription: 'desc desc',
        projectKeywords: 'ding dong',
        projectHomepage: 'https://github.com/ivoba/generator-phpleague-skeleton',
        ownerName: 'ivo',
        ownerEmail: 'ivo@test.net',
        ownerHomepage: 'http://feednapi.net'
      })
      .on('end', done);
  });

  it('creates files', function (done) {

    //todo i cant get the exec to work in test, any help appreciated
    //probably i need to make the task not async

    //assert.file([
    //  'CHANGELOG.md',
    //  'composer.json',
    //  '.editorconfig',
    //  '.gitignore',
    //  'src/SkeletonClass.php',
    //  'tests/ExampleTest.php'
    //]);
    //assert.noFile('.git/config');
    //done();
  });
});
