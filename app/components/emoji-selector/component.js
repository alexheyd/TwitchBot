import Ember from 'ember';

export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  classNames: ['emoji-selector'],
  emojis: Ember.computed.alias('twitch.usableEmotes'),
  actions: {
    useEmoji(code) {
      console.log('emoji code: ', code);
    }
  },

  didInsertElement() {
    console.log('didInsertElement emojis: ', this.get('emojis'));
  },

  emojisUpdated: function () {
    let emojis = this.get('emojis');

    console.log('EMOJIS UPDATED: ', emojis);
  }.observes('twitch.usableEmotes.[]').on('init')
});
