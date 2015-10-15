import Ember from 'ember';

// devourssugar
// oauth:2cu4zj8g78ke14agoi52g5z2l1fn0j

export default Ember.Service.extend({
  settings: Ember.inject.service(),

  commands: Ember.inject.service(),

  client: null,

  channel: null,

  connected: false,

  chatroom: [],

  mentions: [],

  emotes: null,

  viewerTimeoutDuration: 300, // in seconds

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

  cachedEmotes: {},

  clientConfig: {},

  clients: {},

  streamerName: 'GhostCryptology',

  botName: 'DevourBot',

  commandPrefix: Ember.computed.alias('settings.prefs.commandPrefix'),

  streamer: Ember.computed('streamer', function () {
    return this.get('clients.' + this.get('streamerName'));
  }),

  bot: Ember.computed('streamer', function () {
    return this.get('clients.' + this.get('botName'));
  }),

  init() {
    this.createUserClientConfigs();
    this.createClients();

    this.set('channel', this.get('defaultOptions.channels')[0].replace('#', ''));

    this.bindTwitchEvents();
  },

  createUserClientConfigs() {
    this.get('settings').getUsers().forEach(function (user) {
      let username = user.username;
      let oauth = user.oauth;
      let config = Ember.$.extend({}, this.get('defaultOptions'));

      config.identity = {
        username: username, password: oauth
      };

      this.set('clientConfig.' + username, config);
    }.bind(this));
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
    streamerClient.on('connecting', this.onConnecting.bind(this));
    streamerClient.on('connected', this.onConnected.bind(this));
    streamerClient.on('emotesets', this.onEmoteSets.bind(this));

    // this.get('clients.DevoursSugar').on('emotesets', this.onEmoteSets.bind(this));
  },

  onEmoteSets(sets) {
    console.log('#### sets: ', sets);

    this.get('streamer').api({
      url: '/chat/emoticon_images'
    }, function (err, res, body) {
      console.log('body: ', body);

      let emotes = body.emoticons;
      // let allEmotes = [];
      //
      // for (let key in emotes) {
      //   allEmotes.push(emotes[key]);
      // }

      console.log('raw emotes: ', emotes);
      // allEmotes = [].concat.apply([], allEmotes);

      // console.log('flattened emotes: ', allEmotes);

      this.saveEmotes(emotes);
    }.bind(this));
  },

  onConnecting() {
    this.set('connecting', true);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onChatReceived(channel, user, message, self) {
    console.log('chat received. user: ', user);
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
    return typeof this.get('emotes')[str] !== 'undefined';
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
    console.log('processing command: ', command);
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
        this.set('connecting', true);

        let clients = this.get('clients');
        let awaitingConnections = 0;

        let _onClientConnection = function () {
          this.onConnected.bind(this);

          awaitingConnections--;

          if (!awaitingConnections) {
            resolve();
          }
        }.bind(this);

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
