import Ember from 'ember';

export default Ember.Service.extend({
  client: null,

  channel: null,

  connected: false,

  chatroom: [],

  mentions: [],

  timeoutDuration: 300, // in seconds

  options: {
    options: {
      debug: true
    },

    connection: {
      random: "chat",
      reconnect: true
    },

    identity: {
      username: "GhostCryptology",
      password: "oauth:4yyli0229djl1ssqndzr73zgecf47w"
    },

    channels: ["#GhostCryptology"]
  },

  init() {
    this.set('client', new irc.client(this.get('options')));
    this.set('channel', this.get('options.channels')[0].replace('#', ''));
    this.set('username', this.get('options.identity.username'));
    
    this.bindTwitchEvents();
  },

  bindTwitchEvents() {
    let client = this.get('client');

    client.on('chat', this.onChatReceived.bind(this));
    client.on('connecting', this.onConnecting.bind(this));
    client.on('connected', this.onConnected.bind(this));
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

    // if message is addressed to me specifically
    if (this.hasMention(message)) {
      this.saveMention({ content: message, user: user });
    }

    user.url = this.getUserProfile(user.username);

    this.captureChat({ content: message, user: user });
  },

  captureChat(message) {
    this.get('chatroom').pushObject(message);
  },

  saveMention(message) {
    this.get('mentions').pushObject(message);
  },

  hasMention(message) {
    return (message.toLowerCase().indexOf('@' + this.get('username').toLowerCase()) > -1);
  },

  getUserProfile(username) {
    return 'http://www.twitch.tv/' + username;
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
        let client = this.get('client');

        this.set('connecting', true);

        client.connect();

        client.on('connected', function () {
          this.onConnected.bind(this);
          resolve();
        }.bind(this));
      }
    }.bind(this));
  },

  say(message) {
    if (this.get('connected')) {
      this.get('client').say(this.get('channel'), message);
    }
  },

  on(event, handler) {
    if (!event || typeof event !== 'string' || !handler || typeof handler !== 'function') {
      return;
    }

    this.client.on(event, handler);
  },

  ban(username) {
    this.get('client').ban(this.get('channel'), username);
  },

  unban(username) {
    this.get('client').unban(this.get('channel'), username);
  },

  timeout(username, duration) {
    duration = duration || this.get('timeoutDuration');
    this.get('client').timeout(this.get('channel'), username, duration);
  }
});
