 # Shared Client Code
 ## Not Allowed Libraries
 * angular
 * async
    * use `async/*`
 * lodash
    * use `lodash/*`
 * node
 * rxjs
    * use pipe() with `rxjs/operators`
 * webpack

 ## Other
 * no access to **server** or **modules**
 * to access **shared** use absolute paths, such as:
    * `import {} from 'shared/item';`
