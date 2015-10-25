import Ember from 'ember';

// proxy to irc.client object with some properties for status tracking
export default Ember.Object.extend({
  twitch: Ember.inject.service(),

  defaults: {
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

  client: null,
  connected: false,
  connecting: false,

  status: Ember.computed('connected', 'connecting', function () {
    let connected = this.get('connected');
    let connecting = this.get('connecting');

    let status = 'Disconnected';

    if (connected) {
      status = 'Connected';
    } else if (connecting) {
      status = 'Connecting';
    } else {
      status = 'Disconnected';
    }

    return status;
  }),

  iconClass: Ember.computed('status', function () {
    let iconClass = '';

    switch (this.get('status')) {
      case 'Disconnected':
        iconClass = 'fa-frown-o';
      break;

      case 'Connected':
        iconClass = 'fa-smile-o';
      break;

      case 'Connecting':
        iconClass = 'fa-meh-o';
      break;
    }

    return iconClass;
  }),

  init() {
    let config = Ember.$.extend({}, this.get('defaults'), this.get('config'));
    this.set('config', config);

    if (!config) {
      console.error('TwitchClient requires a config object.');
    } else {
      this.setupClient(config);
    }
  },

  setupClient(config) {
    this.set('client', new irc.client(config));
    this.set('clientName', config.identity.username);
    this.bindClientEvents();
  },

  bindClientEvents() {
    let client = this.get('client');

    client.on('connecting', this.onConnecting.bind(this));
    client.on('connected', this.onConnected.bind(this));
    client.on('disconnected', this.onDisconnected.bind(this));
    // client.on('chat', this.onChatReceived.bind(this));
    // client.on('action', this.onChatReceived.bind(this));
    // client.on('subscription', this.onNewSubcriber.bind(this));
    // client.on('join', this.onChannelJoin.bind(this));
    // client.on('mods', this.onModListReceived.bind(this));
    // client.on('notice', this.onTwitchNoticeReceived.bind(this));
  },

  onConnecting() {
    this.set('connecting', true);
    this.set('connected', false);
  },

  onConnected() {
    this.set('connecting', false);
    this.set('connected', true);
  },

  onDisconnected() {
    this.set('connected', false);
  },

  connect() {
    return this.get('client').connect();
  },

  disconnect() {
    return this.get('client').disconnect();
  },

  say(channel, message) {
    console.log(`${this.get('clientName')} SAY: ${message} on ${channel}`);
    return this.get('client').say(channel, message);
  },

  on(event, handler) {
    if (!event || typeof event !== 'string' || !handler || typeof handler !== 'function') {
      return;
    }

    return this.get('client').on(event, handler);
  },

  ban(channel, username) {
    return this.get('client').ban(channel, username);
  },

  unban(channel, username) {
    return this.get('client').unban(channel, username);
  },

  timeout(channel, username, duration) {
    duration = duration || this.get('viewerTimeoutDuration');
    return this.get('client').timeout(channel, username, duration);
  },

  join(channel) {
    console.log(`${this.get('clientName')} JOIN CHANNEL: ${channel}`);
    return this.get('client').join(channel);
  },

  part(channel) {
    console.log(`${this.get('clientName')} PART CHANNEL: ${channel}`);
    return this.get('client').part(channel);
  },

  api(url) {
    return new Ember.RSVP.Promise(resolve => {
      this.get('client').api({
        url: url
      }, (err, res, body) => {
        resolve(body);
      });
    });
  }
});
