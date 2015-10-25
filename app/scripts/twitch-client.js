import Ember from 'ember';

// proxy to irc.client object with some properties for status tracking
export default Ember.Object.extend({
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
    let config = this.get('config');

    if (!config) {
      console.error('TwitchClient requires a config object.');
    } else {
      let channel = this.get('channel') || `#${config.identity.username}`;

      this.set('channel', channel);
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
    console.log(`${this.get('clientName')} connecting...`);
    this.set('connecting', true);
    this.set('connected', false);
  },

  onConnected() {
    console.log(`${this.get('clientName')} connected!!!`);
    this.set('connecting', false);
    this.set('connected', true);
  },

  onDisconnected() {
    console.log(`${this.get('clientName')} disconnected`);
    this.set('connected', false);
  },

  connect() {
    console.log(`${this.get('clientName')} initiating connection...`);
    return this.get('client').connect();
  },

  say(message) {
    return this.get('client').say(this.get('channel'), message);
  },

  on(event, handler) {
    if (!event || typeof event !== 'string' || !handler || typeof handler !== 'function') {
      return;
    }

    return this.get('client').on(event, handler);
  },

  ban(username) {
    return this.get('client').ban(this.get('channel'), username);
  },

  unban(username) {
    return this.get('client').unban(this.get('channel'), username);
  },

  timeout(username, duration) {
    duration = duration || this.get('viewerTimeoutDuration');
    return this.get('client').timeout(this.get('channel'), username, duration);
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
