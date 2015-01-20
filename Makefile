REPORTER = spec
MOCHA_OPTS= --check-leaks
BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/mocha
UMOCHA = ./node_modules/.bin/_mocha

main: clean lint killnode test-unit test-mocha

cover: clean killnode
	$(ISTANBUL) cover $(UMOCHA) \
		test/mocha \
		test/unittest

test-unit:
	@NODE_ENV=test $(UMOCHA) \
		test/unittest \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-mocha: killnode
	@NODE_ENV=test $(MOCHA) \
		test/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

account: killnode
	node examples/account/index.js </dev/null &
	open "http://localhost:8585/account/us/login"

helloworld: killnode
	node examples/helloworld/index.js </dev/null &
	open "http://localhost:8686/helloworld/us/index"

firststep: killnode
	node examples/firststep/index.js </dev/null &
	open "http://localhost:8787/firststep/index"

localetool: killnode
	node tools/localization/index.js </dev/null &
	open "http://localhost:8888/localization/index"

debug:
	clear & DEBUG=indigo:* & nodemon --debug .

killnode:
	killall -9 node || true

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

clean:
	rm -fr coverage

.PHONY: lint