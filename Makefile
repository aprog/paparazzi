install:
	npm install

test:
	# run common tests first, so privileged user will be loaded before any other tests
	./node_modules/.bin/mocha --bail test/common.js
	./node_modules/.bin/mocha --bail

.PHONY: test
