import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['twitch-chat'],

  twitch: Ember.inject.service(),

  actions: {
    timeout(message) {
      console.log('timeout: ', message.user['user-id']);
    }
  },

  didInsertElement() {
    this.get('twitch').connect();
  }
});
