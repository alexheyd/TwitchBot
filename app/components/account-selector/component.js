import Ember from 'ember';

export default Ember.Component.extend({
  tagName : '',
  settings: Ember.inject.service(),
  users   : Ember.computed.alias('settings.users'),

  actions: {
    selectStreamerAccount(accountName) {
      if (accountName) {
        let settings = this.get('settings');

        settings.setStreamerAcount(accountName);
        settings.save();
      }
    },

    selectBotAccount(accountName) {
      if (accountName) {
        let settings = this.get('settings');
        
        settings.setBotAcount(accountName);
        settings.save();
      }
    }
  },

  didInsertElement() {
    console.log('users: ', this.get('users'));
  }
});
