import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  twitch: Ember.inject.service(),

  actions: {
    timeout(user) {
      console.log('timeout: ', user.username);
      // this.get('twitch').timeout(user.username);
    }
  }
});
