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

  followerUpdateInterval: '60000', // TODO: add to settings
  followerUpdatePoll: null,
  lastFollowerUpdate: null,
  newFollowerCount: 0,

  clients: {},
  clientCount: 0,
  clientConfig: {},
  connected: false,
  chatroom: [],
  mentions: [],
  starred: [],
  latestSubs: [],
  lastKnownSub: '',
  latestFollowers: [],
  lastKnownFollower: '',
  followerCount: 0,

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
    let username = user.username;
    let channel = this.get('channel');
    let clientConfig = {
      channel: channel,
      config: {
        identity: {
          username: username, password: user.oauth
        },

        channels: [channel],
      }
    };

    this.set(`clients.${username}`, TwitchClient.create(clientConfig));

    // add observers for connecting and connected status
    Ember.addObserver(this, `clients.${username}.connected`, this.onClientConnectionChange.bind(this));
    Ember.addObserver(this, `clients.${username}.connecting`, this.onClientConnectionChange.bind(this));
  },

  onAllConnected: function () {
    if (this.get('connected')) {
      // starts a poll
      this.startFollowerUpdatePoll();
    }
  }.observes('connected').on('init'),

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
    streamerClient.on('subscription', this.onNewSubcriber.bind(this));
    // streamerClient.on('join', this.onChannelJoin.bind(this));
    // streamerClient.on('mods', this.onModListReceived.bind(this));
    // streamerClient.on('notice', this.onTwitchNoticeReceived.bind(this));
  },

  onNewSubcriber(username) {
    this.get('latestSubs').pushObject(username);
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
    return this.api(`http://tmi.twitch.tv/group/user/${this.get('streamerName').toLowerCase()}/chatters`).then(response => {
      return response.data;
    });
  },

  getFollowers() {
    return this.api(`https://api.twitch.tv/kraken/channels/${this.get('streamerName').toLowerCase()}/follows/?limit=100`).then(response => {
      console.log('getFollowers() response: ', response);
      return response;
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

  addLatestFollower(username) {
    this.get('latestFollowers').pushObject(username);
  },

  startFollowerUpdatePoll() {
    let updateData = () => {
      this.updateFollowerData().then(this.startFollowerUpdatePoll.bind(this));
    };

    let startTimer = () => {
      console.log('>>> Start Follower Update Poll Timer');
      this.set('followerUpdatePoll', Ember.run.later(updateData.bind(), this.get('followerUpdateInterval')));
    };

    if (!this.get('followerUpdatePoll')) {
      this.updateFollowerData().then(startTimer);
    } else {
      startTimer();
    }
  },

  updateFollowerData() {
    let timestamp = moment().format('h:mm:ss a');
    this.set('lastFollowerUpdate', timestamp);

    return this.getFollowers().then(response => {
      let follows = response.follows;

      this.set('followerCount', response._total);

      // save point of reference (last follower on session start)
      if (!this.get('lastKnownFollower')) {
        this.set('lastKnownFollower', follows[0]);
      } else {
        this.addNewFollowers(follows);
      }
    });
  },

  addNewFollowers(follows) {
    this.set('newFollowerCount', 0);

    let lastKnownFollower = this.get('lastKnownFollower').user.display_name;

    // add every follower until we find the lastKnownFollower
    follows.some(follow => {
      let name = follow.user.display_name;

      if (name !== lastKnownFollower) {
        this.get('latestFollowers').unshiftObject(follow);
        this.incrementProperty('newFollowerCount');
      } else {
        return true;
      }
    });

    // update lastKnownFollower
    this.set('lastKnownFollower', follows[0]);
  },

/*******************************************************************************
### PROXY TO TwitchClient METHODS
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
