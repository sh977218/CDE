module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "overrides": [
    {
      "files": [
        "modules/**/*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfigApp.json"
        ],
        tsconfigRootDir: __dirname,
        "sourceType": "module"
      },
      "extends": [
        "plugin:@angular-eslint/recommended"
      ],
      "rules": {
        "import/no-extraneous-dependencies": [
          "off",
          {
            "devDependencies": false,
            "optionalDependencies": false,
            "peerDependencies": false
          }
        ],
        "import/extensions": [
          "off",
          {
            "devDependencies": false,
            "optionalDependencies": false,
            "peerDependencies": false
          }
        ],
        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/no-throw-literal": "warn",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            "args": "none"
          }
        ],
        "@typescript-eslint/no-use-before-define": [
          "error",
          {
            "functions": false
          }
        ],
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-loop-func": "warn",
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/no-useless-constructor": "off",
        "@typescript-eslint/default-param-last": "off",
        "@typescript-eslint/naming-convention": "off"
      }
    },
    {
      "files": [
        "modules/**/*.html"
      ],
      "parserOptions": {
        "project": [
          "tsconfigApp.json"
        ],
        tsconfigRootDir: __dirname,
        "sourceType": "module"
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "import/no-extraneous-dependencies": [
          "off",
          {
            "devDependencies": false,
            "optionalDependencies": false,
            "peerDependencies": false
          }
        ],
        "import/extensions": [
          "off",
          {
            "devDependencies": false,
            "optionalDependencies": false,
            "peerDependencies": false
          }
        ],
        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/no-throw-literal": "warn",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            "args": "none"
          }
        ],
        "@typescript-eslint/no-use-before-define": [
          "error",
          {
            "functions": false
          }
        ],
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-loop-func": "warn",
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/no-useless-constructor": "off",
        "@typescript-eslint/default-param-last": "off",
        "@typescript-eslint/naming-convention": "off"
      }
    },
    {
      "files": [
        "e2e-playwright/*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfig.playwright.json"
        ],
        tsconfigRootDir: __dirname,
      },
      "extends": [
        "airbnb-typescript/base",
        "prettier"
      ]
    }
  ]
}
