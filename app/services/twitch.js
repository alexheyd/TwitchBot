import Ember from 'ember';

// devourssugar
// oauth:2cu4zj8g78ke14agoi52g5z2l1fn0j

export default Ember.Service.extend({
  settings: Ember.inject.service(),
  commands: Ember.inject.service(),

  channel: Ember.computed.alias('settings.prefs.defaultChannel'),
  viewerTimeoutDuration: Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  commandPrefix: Ember.computed.alias('settings.prefs.commandPrefix'),

  clients: {},
  clientConfig: {},
  connected: false,
  connecting: false,
  fetchingEmotes: false,
  chatroom: [],
  mentions: [],
  emotes: null,
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
    let _createClientConfig = function (user) {
      let config = Ember.$.extend({}, this.get('defaultOptions'));

      config.identity = {
        username: user.username, password: user.oauth
      };

      this.set('clientConfig.' + user.username, config);
    }.bind(this);

    this.get('settings').getUsers().forEach(_createClientConfig);
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

  onEmoteSets() {
    let _saveEmotes = function (response) {
      let emotes = response.emoticons;

      console.log('raw emotes: ', emotes);

      // TODO: notify app emotes are done

      this.saveEmotes(emotes);
    }.bind(this);

    this.set('fetchingEmotes', true);
    this.api('/chat/emoticon_images').then(_saveEmotes);
  },

  onConnecting() {
    this.set('connecting', true);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onChatReceived(channel, user, message, self) {
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
      this.processCommand(message);
    }

    // if message is addressed to me specifically
    if (this.hasMention(message)) {
      this.saveMention({ content: message, user: user });
    }

    user.url = this.getUserProfile(user.username);
    user.displayName = user['display-name'];

    this.captureChat({ content: this.escapeHtml(message), user: user });
  },

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  saveEmotes(emotes) {
    let savedEmotes = {};

    let _loopEmotes = function (e) {
      e.forEach(function (emote) {
        if (typeof emote === 'object') {
          savedEmotes[emote.code] = {
            id: emote.id, imageUrl: null
          };
        } else if (Ember.isArray(emote)) {
          _loopEmotes(emote);
        }
      }.bind(this));
    }.bind(this);

    _loopEmotes(emotes);

    this.set('fetchingEmotes', false);
    this.set('emotes', savedEmotes);
  },

  getEmoteImageUrl(code) {
    let id = this.getEmote(code).id;
    let imageUrl = `http://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`;

    this.saveEmoteImageUrl(code, imageUrl);

    return imageUrl;
  },

  saveEmoteImageUrl(code, url) {
    this.set('emotes.' + code + '.imageUrl', url);
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
    return message.indexOf(this.get('commandPrefix')) === 0;
  },

  processCommand(command) {
    this.get('commands').execute(command);
  },

  getUserProfile(username) {
    return 'http://www.twitch.tv/' + username;
  },

  getViewerList() {
    return this.api('http://tmi.twitch.tv/group/user/ghostcryptology/chatters').then(function (response) {
      return response.data;
    });
  },

/*******************************************************************************
### PROXY TO TMI.JS METHODS
*******************************************************************************/

  connect() {
    return new Ember.RSVP.Promise(function (resolve) {
      // if currently connecting or already connected, resolve promise
      if (this.get('connecting') || this.get('connected')) {
        resolve();
      } else {
        let clients = this.get('clients');
        let awaitingConnections = 0;

        let _onClientConnection = function () {
          awaitingConnections--;

          if (!awaitingConnections) {
            this.onConnected();
            resolve();
          }
        }.bind(this);

        this.set('connecting', true);

        for (let key in clients) {
          let client = clients[key];

          client.connect();
          awaitingConnections++;

          client.on('connected', _onClientConnection);
        }
      }
    }.bind(this));
  },

  say(message) {
    if (this.get('connected')) {
      this.get('streamer').say(this.get('channel'), message);
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
    return new Ember.RSVP.Promise(function (resolve) {
      this.get('streamer').api({
        url: url
      }, function (err, res, body) {
        resolve(body);
      });
    }.bind(this));
  }
});
