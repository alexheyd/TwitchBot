import Ember from 'ember';

// TODO: bind document click to close emoji selector if not clicked in component
export default Ember.Component.extend({
  twitch              : Ember.inject.service(),
  classNames          : ['emoji-selector'],
  emojis              : Ember.computed.alias('twitch.emotes.usableEmotes'),
  emojiSelectorVisible: false,

  iconClass: Ember.computed('emojiSelectorVisible', function () {
    return this.get('emojiSelectorVisible') ? 'selected' : '';
  }),

  emojiSelectorClass: Ember.computed('emojiSelectorVisible', function () {
    return (this.get('emojiSelectorVisible')) ? 'visible' : '';
  }),

  actions: {
    useEmoji(code) {
      this.sendAction('useEmoji', code);
      this.send('toggleEmojiSelector');
      // TODO: focus chat input box
    },

    toggleEmojiSelector() {
      this.toggleProperty('emojiSelectorVisible');
    },

    image404(imgSrc) {
      let emojiCode = this.$(`img[src="${imgSrc}"]`).parent('li').data('emoji-code');
      this.get('twitch.emotes').removeUsableEmojiByCode(emojiCode);
    }
  }
});
