import Ember from 'ember';

export default Ember.Service.extend({
  settings        : Ember.inject.service(),
  twitch          : Ember.inject.service(),
  fetchingEmojis  : true,
  emojis          : null,
  usableEmojis    : null,
  usableEmojiCount: 0,

  init() {
    this.get('twitch.streamer').on('emotesets', this.onEmoteSets.bind(this));
  },

  onEmoteSets(sets) {
    let promises = [this.get('twitch').api('/chat/emoticon_images').then(this.processEmojiResponse.bind(this)), this.get('twitch').api(`/chat/emoticon_images?emotesets=${sets}`).then(this.processUsableEmojiResponse.bind(this))];

    // making it default to true
    // this.set('fetchingEmojis', true);

    Ember.RSVP.all(promises).then(() => {
      this.set('fetchingEmojis', false);
    });
  },

  processEmojiResponse(response) {
    this.saveEmotes(response.emoticons);
  },

  processUsableEmojiResponse(response) {
    this.extractUsableEmojis(response.emoticon_sets);
  },

  extractUsableEmojis(emoteSets) {
    let fullSet = [];

    for (let id in emoteSets) {
      fullSet.push(emoteSets[id]);
    }

    let flatSet = [].concat.apply([], fullSet);
    this.set('usableEmojiCount', flatSet.length);
    this.saveUsableEmojis(flatSet);
  },

  extractEmojis(emojis) {
    let savedEmojis = {};

    emojis.forEach(emoji => {
      if (typeof emoji === 'object') {
        savedEmojis[emoji.code] = {
          id: emoji.id, imageUrl: `http://static-cdn.jtvnw.net/emoticons/v1/${emoji.id}/1.0`
        };
      } else if (Ember.isArray(emoji)) {
        savedEmojis = this.extractEmojis(emoji);
      }
    });

    return savedEmojis;
  },

  saveUsableEmojis(emojis) {
    let usableEmojis = this.extractEmojis(emojis);
    this.set('usableEmojis', usableEmojis);
  },

  saveEmotes(emojis) {
    let allEmojis = this.extractEmojis(emojis);
    this.set('emojis', allEmojis);
  },

  removeUsableEmojiByCode(code) {
    delete this.usableEmojis[code];
    this.notifyPropertyChange('usableEmojis');
  },

  getEmoji(code) {
    return this.get('emojis.' + code) || null;
  },

  isEmoji(str) {
    let emojis = this.get('emojis');
    return (emojis && typeof emojis[str] !== 'undefined');
  }
});
