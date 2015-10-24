import Ember from 'ember';

export default Ember.Service.extend({
  settings: Ember.inject.service(),
  twitch: Ember.inject.service(),

  fetchingEmotes: false,
  emotes: null,
  usableEmotes: null,
  usableEmoteCount: 0,

  init() {
    this.get('twitch.streamer').on('emotesets', this.onEmoteSets.bind(this));
  },

  onEmoteSets(sets) {
    let promises = [this.get('twitch').api('/chat/emoticon_images').then(this.processEmoteResponse.bind(this)), this.get('twitch').api(`/chat/emoticon_images?emotesets=${sets}`).then(this.processUsableEmoteResponse.bind(this))];

    this.set('fetchingEmotes', true);

    Ember.RSVP.all(promises).then(() => {
      this.set('fetchingEmotes', false);
    });
  },

  processEmoteResponse(response) {
    this.saveEmotes(response.emoticons);
  },

  processUsableEmoteResponse(response) {
    this.extractUsableEmotes(response.emoticon_sets);
  },

  extractUsableEmotes(emoteSets) {
    let fullSet = [];

    for (let id in emoteSets) {
      fullSet.push(emoteSets[id]);
    }

    let flatSet = [].concat.apply([], fullSet);
    this.set('usableEmoteCount', flatSet.length);
    this.saveUsableEmotes(flatSet);
  },

  extractEmotes(emotes) {
    let savedEmotes = {};

    emotes.forEach(emote => {
      if (typeof emote === 'object') {
        savedEmotes[emote.code] = {
          id: emote.id, imageUrl: `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`
        };
      } else if (Ember.isArray(emote)) {
        savedEmotes = this.extractEmotes(emote);
      }
    });

    return savedEmotes;
  },

  saveUsableEmotes(emotes) {
    let usableEmotes = this.extractEmotes(emotes);
    this.set('usableEmotes', usableEmotes);

    console.log('usable emotes: ', usableEmotes);
  },

  saveEmotes(emotes) {
    let allEmotes = this.extractEmotes(emotes);
    this.set('emotes', allEmotes);

    console.log('allEmotes: ', allEmotes);
  },

  removeUsableEmojiByCode(code) {
    delete this.usableEmotes[code];
    this.notifyPropertyChange('usableEmotes');
  },

  getEmote(code) {
    return this.get('emotes.' + code) || null;
  },

  isEmote(str) {
    let emotes = this.get('emotes');
    return (emotes && typeof emotes[str] !== 'undefined');
  }
});
