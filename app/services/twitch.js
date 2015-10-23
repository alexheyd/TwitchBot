import Ember from 'ember';

// devourssugar
// oauth:2cu4zj8g78ke14agoi52g5z2l1fn0j

export default Ember.Service.extend({
  settings: Ember.inject.service(),
  commands: Ember.inject.service(),

  channel: Ember.computed.alias('settings.prefs.defaultChannel'),
  viewerTimeoutDuration: Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  commandTrigger: Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger: '~', // TODO: put this in settings -- maybe change name of "macros"

  clients: {},
  clientConfig: {},
  connected: false,
  connecting: false,
  fetchingEmotes: false,
  chatroom: [],
  mentions: [],
  emotes: null,
  usableEmotes: null,
  usableEmoteCount: 0,
  streamerName: 'GhostCryptology',
  botName: 'DevourBot',

  streamer: Ember.computed('streamer', function () {
    return this.get('clients.' + this.get('streamerName'));
  }),

  bot: Ember.computed('streamer', function () {
    return this.get('clients.' + this.get('botName'));
  }),

  defaultOptions: {
    options: {
      debug: true
    },

    connection: {
      random: 'chat',
      reconnect: true
    },

    identity: {
      username: null,
      password: null
    },

    channels: ['#GhostCryptology']
  },

  init() {
    this.createUserClientConfigs();
    this.createClients();
    this.bindTwitchEvents();
  },

  createUserClientConfigs() {
    this.get('settings').getUsers().forEach(this.createClientConfig.bind(this));
  },

  createClientConfig(user) {
    let config = Ember.$.extend({}, this.get('defaultOptions'));

    config.identity = {
      username: user.username, password: user.oauth
    };

    this.set('clientConfig.' + user.username, config);
  },

  createClients() {
    let clientConfig = this.get('clientConfig');

    for (let key in clientConfig) {
      this.set('clients.' + key, new irc.client(clientConfig[key]));
    }
  },

  bindTwitchEvents() {
    let streamerClient = this.get('streamer');

    streamerClient.on('chat', this.onChatReceived.bind(this));
    streamerClient.on('emotesets', this.onEmoteSets.bind(this));
  },

  onEmoteSets(sets) {
    let promises = [this.api('/chat/emoticon_images').then(this.processEmoteResponse.bind(this)), this.api(`/chat/emoticon_images?emotesets=${sets}`).then(this.processUsableEmoteResponse.bind(this))];

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

  onConnecting() {
    this.set('connecting', true);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onChatReceived(channel, user, message/*, self*/) {
    console.log('chat received from user: ', user);
    /*
      ## USER OBJECT ##
      color: null
      display-name: "dcryptzero"
      emotes: null
      emotes-raw: null
      message-type: "chat"
      subscriber: false
      turbo: false
      user-id: "68700821"
      user-type: null
      username: "dcryptzero"
     */

    if (this.isCustomCommand(message)) {
      this.processCommand(message, user);
    }

    // if message is addressed to me specifically
    if (this.hasMention(message)) {
      this.saveMention({ content: message, user: user });
    }

    user.url = this.getUserProfile(user.username);
    user.displayName = user['display-name'];

    // NOTE: this is basically the chat message "model"
    // TODO: abstract the chat message "model"
    this.captureChat({ content: this.escapeHtml(message), user: user, starred: false });
  },

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
  },

  captureChat(message) {
    this.get('chatroom').pushObject(message);
  },

  saveMention(message) {
    this.get('mentions').pushObject(message);
  },

  hasMention(message) {
    return (message.toLowerCase().indexOf('@' + this.get('streamerName').toLowerCase()) > -1);
  },

  isCustomCommand(message) {
    return message.indexOf(this.get('commandTrigger')) === 0;
  },

  processCommand(command, user) {
    this.get('commands').process(command, user);
  },

  getUserProfile(username) {
    return 'http://www.twitch.tv/' + username;
  },

  getViewerList() {
    return this.api('http://tmi.twitch.tv/group/user/ghostcryptology/chatters').then(response => {
      return response.data;
    });
  },

/*******************************************************************************
### PROXY TO TMI.JS METHODS
*******************************************************************************/

  connect() {
    return new Ember.RSVP.Promise(resolve => {
      // if currently connecting or already connected, resolve promise
      if (this.get('connecting') || this.get('connected')) {
        resolve();
      } else {
        let clients = this.get('clients');
        let awaitingConnections = 0;

        let _onClientConnection = () => {
          awaitingConnections--;

          if (!awaitingConnections) {
            this.onConnected();
            resolve();
          }
        };

        this.set('connecting', true);

        for (let key in clients) {
          let client = clients[key];

          client.connect();
          awaitingConnections++;

          client.on('connected', _onClientConnection);
        }
      }
    });
  },

  isMacro(str) {
    return str.indexOf(this.get('macroTrigger')) === 0;
  },

  say(message) {
    if (this.get('connected')) {
      if (this.isMacro(message)) {
        this.get('commands').processMacro(message);
      } else {
        this.get('streamer').say(this.get('channel'), message);
      }
    }
  },

  on(event, handler) {
    if (!event || typeof event !== 'string' || !handler || typeof handler !== 'function') {
      return;
    }

    this.get('streamer').on(event, handler);
  },

  ban(username) {
    this.get('streamer').ban(this.get('channel'), username);
  },

  unban(username) {
    this.get('streamer').unban(this.get('channel'), username);
  },

  timeout(username, duration) {
    duration = duration || this.get('viewerTimeoutDuration');
    this.get('streamer').timeout(this.get('channel'), username, duration);
  },

  api(url) {
    return new Ember.RSVP.Promise(resolve => {
      this.get('streamer').api({
        url: url
      }, (err, res, body) => {
        resolve(body);
      });
    });
  }
});
