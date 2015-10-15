import Ember from 'ember';

export default Ember.Service.extend({
  storage: Ember.inject.service(),

  prefs: {
    users: [],
    defaultChannel: '',
    commandPrefix: '/'
  },

  save() {
    this.get('storage').setItem('settings', this.get('prefs'));
  },

  load() {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let settings = this.get('storage').getItem('settings');

      if (settings) {
        this.set('prefs', JSON.parse(settings));
        resolve();
      } else {
        // save defaults
        this.save();
        reject();
      }
    }.bind(this));
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
