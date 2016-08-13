[![Indigo Logo](http://www.indigojs.com/img/smallogo.png)](http://indigojs.com/)


[![NPM version](https://badge.fury.io/js/indigojs.svg)](http://badge.fury.io/js/indigojs) [![Build Status](https://api.travis-ci.org/dgofman/indigojs.svg?branch=master)](https://travis-ci.org/dgofman/indigojs) [![Coverage Status](https://coveralls.io/repos/dgofman/indigojs/badge.svg?branch=master)](https://coveralls.io/r/dgofman/indigojs?branch=master) [![Dependency Status](https://david-dm.org/dgofman/indigojs.svg)](https://david-dm.org/dgofman/indigojs) [![devDependency Status](https://david-dm.org/dgofman/indigojs/dev-status.svg)](https://david-dm.org/dgofman/indigojs#info=devDependencies) [![indigojs API Documentation](https://www.omniref.com/js/npm/indigojs.png)](https://www.omniref.com/github/dgofman/indigojs)

[![NPM](https://nodei.co/npm/indigojs.png?downloads=true&downloadRank=true)](https://www.npmjs.com/package/indigojs)

### Getting started

###### 1. Download and install Install NodeJS

```
 http://nodejs.org/download/
```

###### 2. Create your project directory

```
 mkdir myapp
 cd myapp
```

###### 3. Download indigoJS framework

```
 npm install indigojs
```

###### 4. Check the project generator attributes.

```
 ./node_modules/indigojs/generator --help

 Windows OS

 .\node_modules\indigojs\generator --help
```

###### 5. Create a project using generator.

```
 ./node_modules/indigojs/generator -n myapp

 Windows OS

 .\node_modules\indigojs\generator -n myapp
```

###### 6. Download dependency modules

```
npm install --production
```

###### 7. Start your server

```
npm start
```

### Default structure of a project

```
./config
./locales
./locales/en
./routers
./controllers
./web
./web/default
./web/default/css
./web/default/js
./web/default/js/vendor
./web/default/js/views
./web/default/templates
./web/en
```

### Deployment

```
npm install

npm run-script jshint

grunt
```

### Plugins

- [Localization Tool](https://www.npmjs.com/package/indigo-locale)


### License

[MIT](http://opensource.org/licenses/mit-license.php)

### Please read our API's documentation.

http://www.indigojs.com/docs/index.html
