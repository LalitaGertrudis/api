# API Bun Template

boilerplate for api servers written in typescript and powered by bun

## bash commands

- **bun dev** - run server
- **bun linter:fix** - eslint fix
- **bun prettier:write** - code styling
- **bun test** - run tests

## code style

- import/export syntax
- destructure imports as posible
- import types syntax `import type {Foo} from 'bar'`

## workflow

- run `bun prettier:write && bun linter:fix` on code changes
- maintain file naming standardization

## development rules

- only use official and reliable documentation
- do not assume, confirm your code changes against official documentation
- never use `any` types for typescript
- keep code documented, do not verbose keep comments clear, concise and useful
- do not install old packages
