REPORTER = spec
MOCHA_OPTS= --check-leaks
BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/_mocha

main: clean lint test-unit

cover: clean
	$(ISTANBUL) cover $(MOCHA) test/unittest/tests.js

test-unit:
	@NODE_ENV=test $(MOCHA) test/unittest \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

clean:
	rm -fr coverage

.PHONY: lint