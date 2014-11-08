REPORTER = spec
MOCHA_OPTS= --check-leaks
BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/mocha
COVERAGE_OPTS = #--lines 95 --statements 90 --branches 80 --functions 90

main: clean lint test-unit

cover:
	$(ISTANBUL) cover test/unittest/tests.js

test-unit:
	@NODE_ENV=test $(MOCHA) test/unittest \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

clean:
	rm -fr coverage

.PHONY: lint