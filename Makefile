REPORTER = spec
MOCHA_OPTS= --check-leaks
BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/mocha
UMOCHA = ./node_modules/.bin/_mocha

main: clean lint test-unit test-mocha

cover: clean
	$(ISTANBUL) cover $(UMOCHA) \
		test/unittest/tests.js \
		test/mocha/tests.js

test-unit:
	@NODE_ENV=test $(UMOCHA) test/unittest \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-mocha:
	@NODE_ENV=test $(MOCHA) test/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

clean:
	rm -fr coverage

.PHONY: lint