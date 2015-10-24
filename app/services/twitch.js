import Ember from 'ember';

export default Ember.Service.extend({
  settings: Ember.inject.service(),
  commander: Ember.inject.service(),
  emotes: Ember.inject.service(),

  channel: Ember.computed.alias('settings.prefs.defaultChannel'),
  viewerTimeoutDuration: Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  commandTrigger: Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger: Ember.computed.alias('settings.prefs.macroTrigger'),
  streamerName: Ember.computed.alias('settings.prefs.streamerName'),
  botName: Ember.computed.alias('settings.prefs.botName'),

  clients: {},
  clientConfig: {},
  connected: false,
  connecting: false,
  chatroom: [],
  mentions: [],

  streamer: Ember.computed('streamerName', function () {
    return this.get('clients.' + this.get('streamerName'));
  }),

  bot: Ember.computed('botName', function () {
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

    channels: [''] // set during init
  },

  init() {
    this.get('defaultOptions.channels').pushObject(`#${this.get('channel')}`);
    this.createUserClientConfigs();
    this.createClients();
    this.bindTwitchEvents();
  },

  createUserClientConfigs() {
    this.get('settings').get('users').forEach(this.createClientConfig.bind(this));
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
    streamerClient.on('action', this.onChatReceived.bind(this));
  },

  onConnecting() {
    this.set('connecting', true);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onChatReceived(channel, user, message/*, self*/) {
    if (!message) return;

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

    let commander = this.get('commander');
    if (commander.isCustomCommand(message)) {
      commander.processCommand(message, user);
    }

    // if message is addressed to me specifically
    if (this.hasMention(message)) {
      this.saveMention({ content: message, user: user });
    }

    Ember.set(user, 'url', this.getUserProfile(user.username));
    Ember.set(user, 'displayName', user['display-name']);

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

  captureChat(message) {
    this.get('chatroom').pushObject(message);
  },

  saveMention(message) {
    this.get('mentions').pushObject(message);
  },

  hasMention(message) {
    return (message.toLowerCase().indexOf('@' + this.get('streamerName').toLowerCase()) > -1);
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
    return new Ember.RSVP.Promise(resolve => {
      this.get('streamer').api({
        url: url
      }, (err, res, body) => {
        resolve(body);
      });
    });
  }
});
