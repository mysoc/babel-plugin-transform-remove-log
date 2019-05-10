#### Babel configuration:
```
babel: {
  plugins: [
    ['transform-remove-log', {exclude: ['info', 'debug', 'trace']}] // exclude defines explicitly excluded log levels
  ]
}
```

#### Sample code:
```
const log = {
  trace(...args) {
    console.log(...args);
  },
  debug(...args) {
    console.log(...args);
  },
  info(...args) {
    console.log(...args);
  },
  error(...args) {
    console.log(...args);
  }
};

log.trace('this will not be printed');
log.error('this will be printed');
log['info']('this will not be printed');
```
