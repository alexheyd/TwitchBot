import Ember from 'ember';

export default Ember.Service.extend({
  storage: Ember.inject.service(),

  prefs: {
    users                : [],
    defaultChannel       : '',
    commandTrigger       : '/',
    macroTrigger         : '~',
    streamerName         : 'GhostCryptology',
    botName              : 'DevourBot',
    viewerTimeoutDuration: 300 // in seconds
  },

  users: Ember.computed('prefs.users', function () {
    return this.get('prefs.users');
  }),

  streamerName: Ember.computed('prefs.streamerName', function () {
    return this.get('prefs.streamerName');
  }),

  botName: Ember.computed('prefs.botName', function () {
    return this.get('prefs.botName');
  }),

  setStreamerAcount(name) {
    this.set('prefs.streamerName', name);
    this.designateUser(name, 'streamer');
  },

  setBotAcount(name) {
    this.set('prefs.botName', name);
    this.designateUser(name, 'bot');
  },

  /**
   * Designates a user as a streamer or bot account
   * @param  {String} name Account name
   * @param  {String} type Account type (streamer|bot)
   */
  designateUser(name, type) {
    let users = this.get('users');
    let user  = users.findBy('username', name);

    users.setEach(type, false);

    if (user) {
      Ember.set(user, type, true);
    }
  },

  save() {
    this.get('storage').setItem('settings', this.get('prefs'));
  },

  load() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (this.get('loaded')) {
        resolve();
      } else {
        let settings = this.get('storage').getItem('settings');

        if (settings) {
          this.set('prefs', JSON.parse(settings));
          this.set('loaded', true);
          resolve();
        } else {
          // save defaults
          this.save();
          this.set('loaded', true);
          reject();
        }
      }
    });
  },

  addUser(user) {
    if (this.isValidUser(user)) {
      this.get('users').pushObject(user);
    }
  },

  removeUser(user) {
    this.get('users').removeObject(user);
  },

  isValidUser(user) {
    return (typeof user === 'object' && user.username && user.oauth);
  },

  findUser(username) {
    return this.get('users').findBy('username', username);
  }
});
