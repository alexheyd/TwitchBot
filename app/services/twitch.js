import Ember from 'ember';

export default Ember.Service.extend({
  settings: Ember.inject.service(),

  commands: Ember.inject.service(),

  client: null,

  channel: null,

  connected: false,

  chatroom: [],

  mentions: [],

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
  },

  // TODO: finish emotes
  onEmoteSets(sets) {
    this.get('streamer').api({
      url: '/chat/emoticon_images?emotesets=' + sets
    }, function (err, res, body) {
      // console.log('emotesets: ', body);
      let emotes = body.emoticon_sets[0];

      console.log('emotes: ', emotes[0]);
    });
  },

  onConnecting() {
    this.set('connecting', true);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onChatReceived(channel, user, message, self) {
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

    this.captureChat({ content: message, user: user });
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
