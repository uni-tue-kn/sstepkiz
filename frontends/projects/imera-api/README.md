# Imera-Api
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.4.

## Configuration
For the API to work properly the contexts: 
- Feedback 
- TestImport
- Example 
- Time 
- Layout 
must exist in the Imera database and the Context Id's must be adjusted in [imera-api.service](https://git.bs-wit.de/jop/sstep-kiz/-/blob/master/frontends/projects/imera-api/src/lib/services/imera-api.service.ts). Feedback has the contextType Feedback. Import files of the contexts are in [](https://git.bs-wit.de/jop/sstep-kiz/-/tree/master/docs/context). TestImport does not have an import file as it is only a empty context.


## Code scaffolding

Run `ng generate component component-name --project imera-api` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project imera-api`.
> Note: Don't forget to add `--project imera-api` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build imera-api` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build imera-api`, go to the dist folder `cd dist/imera-api` and run `npm publish`.

## Running unit tests

Run `ng test imera-api` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
