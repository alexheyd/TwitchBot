import Ember from 'ember';

export default Ember.Service.extend({
  storage: Ember.inject.service(),

  prefs: {
    users: [],
    defaultChannel: '',
    commandTrigger: '/',
    viewerTimeoutDuration: 300 // in seconds
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

  getUsers() {
    return this.get('prefs.users');
  },

  addUser(user) {
    if (this.isValidUser(user)) {
      this.getUsers().pushObject(user);
    }
  },

  removeUser(user) {
    this.getUsers().removeObject(user);
  },

  isValidUser(user) {
    return (typeof user === 'object' && user.username && user.oauth);
  },

  findUser(username) {
    return this.getUsers().findBy('username', username);
  }
});
