# Tests Task

## Run the project

To run the project use node 16 and run the following commands:

```bash
npm i
npm run dev
```

you can now interact with the app on <http://localhost:8080>

## Testing

to run the tests use

```sh
npm i
npm run test

```

## Authentication

the most basic possible authentication was put in place. It only check if the header "authorization" is set to "dummy" and only the employee delete route is protected.

An UI to test the route by both being "authenticated" or "anonymous" is present on the test page (last section)
