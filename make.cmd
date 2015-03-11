@echo off

SET REPORTER=spec
SET MOCHA_OPTS=--check-leaks
SET BASE=.

SET ISTANBUL=node_modules\.bin\istanbul
SET JSHINT=node_modules\.bin\jshint
SET MOCHA=node_modules\.bin\mocha
SET _MOCHA=node_modules\mocha\bin\_mocha

if "%1"=="" goto :main else goto :eof

call:%~1

goto :eof

:main
	call :clean
	call :lint
	call :killnode
	call :test-unit
	call :test-mocha
goto :eof

:cover
	call :clean
	call :killnode
	cmd /c %ISTANBUL% cover "%_MOCHA%" -- test/mocha test/unittest -R spec
goto :eof

:test-unit
	SET NODE_ENV=test & %MOCHA% test\unittest --reporter %REPORTER% %MOCHA_OPTS%
goto :eof

:test-mocha
	call :killnode
	SET NODE_ENV=test & %MOCHA% test/mocha --reporter %REPORTER% %MOCHA_OPTS%
goto :eof

:account
	call :killnode
	start /WAIT /B node examples/account/index.js
	start "" "http://localhost:8585/account/us/login"
goto :eof

:helloworld
	call :killnode
	start /WAIT /B node examples/helloworld/index.js
	start "" "http://localhost:8686/helloworld/us/index"
goto :eof

:firststep
	call :killnode
	start /WAIT /B node examples/firststep/index.js
	start "" "http://localhost:8787/firststep/index"
goto :eof

:debug
	cls
	SET DEBUG=indigo:* & nodemon --debug .
goto :eof

:killnode
	taskkill /f /im node.exe
goto :eof

:lint
	cmd /c %JSHINT% . --config %BASE%/.jshintrc
goto :eof

:clean
	rmdir coverage /s /q
goto :eof