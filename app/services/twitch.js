import Ember from 'ember';
import TwitchClient from 'twitch-bot/scripts/twitch-client';

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
  clientCount: 0,
  clientConfig: {},
  connected: false,
  chatroom: [],
  mentions: [],
  starred: [],

  streamer: Ember.computed('streamerName', function () {
    return this.get('clients.' + this.get('streamerName'));
  }),

  bot: Ember.computed('botName', function () {
    return this.get('clients.' + this.get('botName'));
  }),

  init() {
    this.createClients();
    this.bindTwitchEvents();
  },

  createClients() {
    let users = this.get('settings').get('users');

    this.set('clientCount', users.length);

    users.forEach(this.createClient.bind(this));
  },

  createClient(user) {
    let username = user.username
    let channel = this.get('channel');

    this.set(`clients.${username}`, TwitchClient.create({
      channel: channel,
      config: {
        identity: {
          username: username, password: user.oauth
        },

        channels: [channel],
      }
    }));

    // add observers for connecting and connected status
    Ember.addObserver(this, `clients.${username}.connected`, this.onClientConnectionChange.bind(this));
    Ember.addObserver(this, `clients.${username}.connecting`, this.onClientConnectionChange.bind(this));
  },

  onClientConnectionChange() {
    let allConnected = true;
    let stillConnecting = false;
    let clients = this.get('clients');

    for (let key in clients) {
      if (!clients[key].connected) {
        allConnected = false;
      }

      if (!clients[key].connecting) {
        stillConnecting = true;
      }
    }

    this.set('connected', allConnected);
    this.set('connecting', stillConnecting);
  },

  bindTwitchEvents() {
    let streamerClient = this.get('streamer');

    streamerClient.on('chat', this.onChatReceived.bind(this));
    streamerClient.on('action', this.onChatReceived.bind(this));
    // streamerClient.on('subscription', this.onNewSubcriber.bind(this));
    // streamerClient.on('join', this.onChannelJoin.bind(this));
    // streamerClient.on('mods', this.onModListReceived.bind(this));
    // streamerClient.on('notice', this.onTwitchNoticeReceived.bind(this));
    //
    // streamerClient.on('connecting', this.onConnecting.bind(this));
    // streamerClient.on('disconnected', this.onDisconnected.bind(this));
  },

  onChatReceived(channel, user, message/*, self*/) {
    if (!message) {
      return;
    }

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
    let msg = {
      content: this.escapeHtml(message),
      user: user,
      starred: false,
      index: this.get('chatroom').length
    };

    this.captureChat(msg);
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

  toggleStarMessage(message) {
    let starredMessages = this.get('starred');
    let starred = starredMessages.findBy('index', message.index);

    if (starred) {
      starredMessages.removeObject(starred);
    } else {
      starredMessages.pushObject(message);
    }
  },

/*******************************************************************************
### PROXY TO TMI.JS METHODS
*******************************************************************************/

  connect() {
    return new Ember.RSVP.Promise(resolve => {
      // if already connected, resolve promise
      if (this.get('connected')) {
        resolve();
      } else {
        // connect all clients
        let clients = this.get('clients');
        let allConnections = [];

        for (let key in clients) {
          allConnections.push(clients[key].connect());
        }

        Ember.RSVP.all(allConnections).then(resolve);
      }
    });
  },

  say(message) {
    return this.get('streamer').say(message);
  },

  on(event, handler) {
    if (!event || typeof event !== 'string' || !handler || typeof handler !== 'function') {
      return;
    }

    return this.get('streamer').on(event, handler);
  },

  ban(username) {
    return this.get('streamer').ban(username);
  },

  unban(username) {
    return this.get('streamer').unban(username);
  },

  timeout(username, duration) {
    duration = duration || this.get('viewerTimeoutDuration');
    return this.get('streamer').timeout(username, duration);
  },

  api(url) {
    return this.get('streamer').api(url);
  }
});
