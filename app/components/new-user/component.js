import Ember from 'ember';

export default Ember.Component.extend({
  settings      : Ember.inject.service(),
  notifications : Ember.inject.service(),
  classNames    : ['add-user'],
  newUsername   : null,
  newOauth      : null,

  actions: {
    addUser() {
      this.addUser();
    }
  },

  addUser() {
    let newUsername = this.get('newUsername');
    let newOauth    = this.get('newOauth');
    let settings    = this.get('settings');

    if (!newUsername || !newOauth) {
      this.get('notifications').error('Both username and oauth tokens are required to add a new account.');
      return;
    }

    if (!settings.findUser(newUsername)) {
      settings.addUser({
        username: newUsername, oauth: newOauth
      });

      this.set('newUsername', '');
      this.set('newOauth', '');
      this.$('input.new-username').focus();
      this.get('settings').save();
    }
  }
});
