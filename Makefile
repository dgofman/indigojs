BASE = .

JSHINT = ./node_modules/.bin/jshint

lint:
	$(JSHINT) . --config $(BASE)/.jshintrc

.PHONY: lint