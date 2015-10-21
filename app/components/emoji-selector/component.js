import Ember from 'ember';

// TODO: prevent broken images from displaying
export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  classNames: ['emoji-selector'],
  emojis: Ember.computed.alias('twitch.usableEmotes'),
  emojiSelectorVisible: false,

  emojiSelectorClass: Ember.computed('emojiSelectorVisible', function () {
    return (this.get('emojiSelectorVisible')) ? 'visible' : '';
  }),

  actions: {
    useEmoji(code) {
      this.sendAction('useEmoji', code);
      this.send('toggleEmojiSelector');
    },

    toggleEmojiSelector() {
      this.toggleProperty('emojiSelectorVisible');
    }
  }
});
