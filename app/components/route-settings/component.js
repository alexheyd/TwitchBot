import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  classNames: ['settings'],

  users: Ember.computed.alias('settings.prefs.users'),

  defaultChannel: Ember.computed.alias('settings.prefs.defaultChannel'),

  commandPrefix: Ember.computed.alias('settings.prefs.commandPrefix'),

  newUsername: null,

  newOauth: null,

  actions: {
    save() {
      this.save();
    },

    addUser() {
      this.addUser();
    },

    editUser(userIndex) {
      this.editUser(userIndex);
    },

    removeUser(user) {
      this.removeUser(user);
    }
  },

  save() {
    this.get('settings').save();
  },

  didInsertElement() {
    this.get('settings').load();
  },

  addUser() {
    let newUsername = this.get('newUsername');
    let newOauth = this.get('newOauth');
    let settings = this.get('settings');

    if (!newUsername || !newOauth) {
      return;
    }

    if (!settings.findUser(newUsername)) {
      settings.addUser({
        username: newUsername, oauth: newOauth
      });

      this.set('newUsername', '');
      this.set('newOauth', '');
      this.$('input.new-username').focus();

      this.save();
    }
  },

  editUser(user) {
    this.get('settings').editUser(user);
  },

  removeUser(user) {
    this.get('settings').removeUser(user);
    this.save();
  }
});
