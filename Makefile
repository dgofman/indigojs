REPORTER = spec
MOCHA_OPTS= --check-leaks
BASE = .

ISTANBUL = ./node_modules/.bin/istanbul
JSHINT = ./node_modules/.bin/jshint
MOCHA = ./node_modules/.bin/mocha
_MOCHA = ./node_modules/mocha/bin/_mocha

main: clean lint killnode test-unit test-mocha

cover: clean killnode
	$(ISTANBUL) cover $(_MOCHA) \
		test/mocha \
		test/unittest \
		-- --reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-unit:
	@NODE_ENV=test $(MOCHA) \
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

components: killnode
	bower install indigojs-components
	node examples/components/index.js </dev/null &
	open "http://localhost:8888/uicomponents/index"

debug:
	clear & DEBUG=indigo:* & nodemon --debug .

killnode:
	killall -9 node || true

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

clean:
	rm -fr coverage

.PHONY: lint