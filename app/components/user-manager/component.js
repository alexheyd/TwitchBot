import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['user-manager'],
  settings  : Ember.inject.service(),
  users     : Ember.computed.alias('settings.prefs.users'),

  actions: {
    editUser(userIndex) {
      this.editUser(userIndex);
    },

    removeUser(user) {
      this.removeUser(user);
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
