# Server(Node and Express)
## Allowed
* async
* lodash
* node
* rxjs

## Not Allowed Libraries
* angular
* webpack

## Other
* no access to **modules**
* to access **server** or **shared** use absolute paths, such as:
   * `import {} from 'server/cde/mongo-cde';`
   * `import {} from 'shared/item';`
