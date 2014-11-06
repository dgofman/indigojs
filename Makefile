REPORTER = spec

BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/mocha
COVERAGE_OPTS = #--lines 95 --statements 90 --branches 80 --functions 90

main: lint unittest

cover:
	$(ISTANBUL) cover test/unittest/tests.js

unittest:
	@NODE_ENV=test $(MOCHA) test/unittest \
		--reporter $(REPORTER)

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

.PHONY: lint