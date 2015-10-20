import Ember from 'ember';

export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  classNames: ['emoji-selector'],
  emojis: Ember.computed.alias('twitch.usableEmojis'),
  actions: {
    useEmoji(code) {
      console.log('emoji code: ', code);
    }
  }
});
