# LN Operator

Remote control web-application designed to help operate Lightning Network nodes.

The operator application is a client that is designed to work with a backing
gateway, such as a gateway in
[balanceofsatoshis](https://github.com/alexbosworth/balanceofsatoshis) that can
be run with `bos gateway`

## Build Your Own

First run `npm install` to install required dependencies.

Then start the auto-rebuilding scripts:

```shell
# Watch for changes to scripts
npm run update-dependencies

# Watch for changes to view templates
npm run start
```
