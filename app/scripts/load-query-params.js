import Ember from 'ember';
import ENV from 'twitch-bot/config/environment';

export default function () {
  let queryParts  = window.location.search.replace('?', '').split('&');
  let queryParams = {};

  if (queryParts.length) {
    queryParts.forEach((queryPart) => {
      let query = queryPart.split(' =');
      let prop  = query[0];
      let value = query[1];

      // convert boolean string to a real boolean
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      }

      queryParams[prop] = value;
    });

    // overwrite environment config
    for (let param in queryParams) {
      if (ENV.APP[param] !== undefined) {
        ENV.APP[param] = queryParams[param];
      }
    }
  }
}
