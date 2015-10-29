import Ember from 'ember';

export default Ember.Service.extend({
  settings     : Ember.inject.service(),
  client       : null,
  streamerName : Ember.computed.alias('settings.prefs.streamerName'),
  channel      : Ember.computed.alias('settings.prefs.defaultChannel'),
  threads      : {},

  init() {
    this.createClient();
    this.bindClientEvents();
  },

  createClient() {
    let streamerName = this.get('streamerName');
    let oauth        = this.get('settings.prefs.users').findBy('username', streamerName).oauth;
    let client  = new irc.client({
      options: {
        debug: true
      },

      connection: {
        random   : 'group',
        reconnect: true
      },

      identity: {
        username: streamerName,
        password: oauth
      },

      channels: [this.get('channel')] // TODO: make group channel dynamic
    });

    // client.on('whisper', (username, message) => {
    //   console.log(`GROUP CLIENT WHISPER from ${username}: ${message}`);
    //   this.saveWhisper(username, message);
    // });
    //
    // client.on('connected', () => {
    //   console.log('### GROUP CLIENT CONNECTED');
    // });

    this.set('client', client);
  },

  bindClientEvents() {
    this.get('client').on('whisper', this.saveWhisper.bind(this));
  },

  saveWhisper(username, message, sendTo) {
    console.log('saveWhisper: ', username, message, sendTo);

    let whisper = {
      username: username,
      message : message,
      sendTo  : (sendTo === undefined) ? false : sendTo
    };

    let existingThread = this.get('threads')[username] || null;

    if (existingThread) {
      existingThread.pushObject(whisper);
    } else {
      this.get('threads')[username] = [whisper];
    }

    this.notifyPropertyChange('threads');
  },

  connect() {
    this.get('client').connect();
  },

  send(username, message) {
    this.saveWhisper(username, message, true);
    this.get('client').whisper(username, message);
  }
});
