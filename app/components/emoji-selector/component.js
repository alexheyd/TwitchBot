import Ember from 'ember';

export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  classNames: ['emoji-selector'],
  emojis: Ember.computed.alias('twitch.usableEmotes'),
  emojiSelectorVisible: false,

  emojiSelectorClass: Ember.computed('emojiSelectorVisible', function () {
    console.log('class change');
    return (this.get('emojiSelectorVisible')) ? 'visible' : '';
  }),

  actions: {
    useEmoji(code) {
      this.sendAction('useEmoji', code);
    },

    toggleEmojiSelector() {
      console.log('toggling emoji selector');
      this.toggleProperty('emojiSelectorVisible');
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
