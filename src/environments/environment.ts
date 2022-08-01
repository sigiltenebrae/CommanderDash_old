// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  decks_url: 'http://192.168.1.19:3000/decks',
  deck_themes_url: 'http://192.168.1.19:3000/deckthemesname/',
  themes_url: 'http://192.168.1.19:3000/themes',
  users_url: 'http://192.168.1.19:3000/users',
  login_url: 'http://192.168.1.19:3000/login',
  edhrec_commander_url: 'http://192.168.1.19:2525/commander',
  edhrec_top_week_url: 'http://192.168.1.19:2525/top/week'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
