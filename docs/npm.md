## Node.js and NPM

* Login to a registry user account

```sh
npm login

npm whoami

npm search @mateola    # list of packages in that scope
```

* Only Generate package-lock.json

```sh
npm install --package-lock-only
```

* Publish a scoped public Package

```sh
# Create the package.json file:
npm init --scope=@mateola

# Publish your package
npm publish --access public
```

* Unpublish your package

```sh
npm unpublish @mateola/cm-pgn@3.3.3 --force
```

#### Test your npm package locally (1 way)

```sh
npm link    # run this in your package folder
```
This command will link this local package to your globally installed packages.

Import the link in a test project
```sh
npm link {package-name}    # run this in your test project
```

#### Test your npm package locally (2nd way)

```sh
npm run build    # Build your Package

npm pack --pack-destination ~    # Pack your artifacts (run this in the same folder where package.json is located.)

"dependencies": {
  "@your-package": "file:~/<your-packed-file.tgz>"    # Point package.json to your file
}

npm install    # Install your package
```

Now you can test your package before publishing it

#### Compile Node.js to javascript

* Choose your Bundler: WebPack, Parcel, EsBuild, RooUpJs, Browserify, Vite, ...

```sh
npm install parcel-bundler --save-dev    # Install Parcel

"scripts": {
  "build": "parcel build src/index.js --dist-dir dist"    # Add Scripts to package.json
}

npm run build
```

* Similar option:

```sh
sudo npm i -g parcel

sudo npm uninstall -g parcel     # if you whant to uninstall the package:
``` 

* Config your bundler in package.json

```js
"source": "src/Pgn.js",
"main": "dist/cm-pgn.js",
```

* Bundle your package: `parcel build src/Pgn.js`

#### Update NPM

```js
sudo npm i -g npm@latest
```






#### Communicate with a program (Stockfish)

* `stdout, stdin, and stderr` are standard streams, which interconnect input and output communication channels between a program and its environment when the program executes




