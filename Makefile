install:
	npm install

test:
	./node_modules/.bin/mocha --bail

.PHONY: test
