// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    loggedIn: () => {
    },
    federatedLogin: 'https://uts.nlm.nih.gov/uts/login',
    publicUrl: 'https://cde-qa.nlm.nih.gov',
    socketIoUrl: 'https://cde-qa.nlm.nih.gov:3001',
    ssoServerReceiver: 'https://uts.nlm.nih.gov/uts/messenger'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
