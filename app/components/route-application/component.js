import Ember from 'ember';
import ENV from 'twitch-bot/config/environment';

export default Ember.Component.extend({
  classNames       : ['application', 'container-fluid'],
  classNameBindings: ['allConnected:connected'],
  notifications    : Ember.inject.service(),
  twitch           : Ember.inject.service(),
  chatroom         : Ember.computed.alias('twitch.chatroom'),
  mentions         : Ember.computed.alias('twitch.mentions'),
  notification     : Ember.computed.alias('notifications.item'),
  connected        : Ember.computed.alias('twitch.connected'),
  fetchingEmotes   : Ember.computed.alias('twitch.emotes.fetchingEmotes'),
  channelJoined    : Ember.computed.alias('twitch.channelJoined'),

  allConnected: Ember.computed('connected', 'channelJoined', 'fetchingEmotes', function() {
    return this.get('connected') && this.get('channelJoined') && !this.get('fetchingEmotes');
  }),

  twitchConnectionStatus: Ember.computed('connected', function() {
    return this.get('connected') ? 'Connected to Twitch API!' : 'Connecting to Twitch API...';
  }),

  channelJoinedStatus: Ember.computed('channelJoined', function() {
    let channel = this.get('twitch.channel');
    return this.get('channelJoined') ? `${channel} joined!` : `Joining ${channel}...`;
  }),

  emojiFetchStatus: Ember.computed('fetchingEmotes', function() {
    return this.get('fetchingEmotes') ? 'Fetching Chat Emojis...' : 'Chat Emojis Fetched!';
  }),

  emojisFetchedClass: Ember.computed('fetchingEmotes', function() {
    return this.get('fetchingEmotes') ? 'fa-spinner fa-pulse' : 'fa-check-square-o';
  }),

  channelJoinedClass: Ember.computed('channelJoined', function() {
    return this.get('channelJoined') ? 'fa-check-square-o' : 'fa-spinner fa-pulse';
  }),

  twitchConnectedClass: Ember.computed('connected', function() {
    return this.get('connected') ? 'fa-check-square-o' : 'fa-spinner fa-pulse';
  }),

  //************************************************************************
  // TODO: REMOVE DEV CODE
  didInsertElement() {
    if (ENV.APP.mockMessages) {
      this.get('twitch.streamer').on('join', this.onChannelJoin.bind(this));
    }
  },

  onChannelJoin() {
    let _say = msg => {
      this.get('twitch').say(msg || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
    };

    Ember.run.later(_say.bind(this), 1000);

    Ember.run.later(_say.bind(this, '@GhostCryptology hi'), 2000);
    // Ember.run.later(_say.bind(this), 2000);
    // Ember.run.later(_say.bind(this, '@GhostCryptology hello'), 3000);
  },
  // END DEV CODE
  //************************************************************************

  // onTwitchConnection: Ember.observer('twitch.connecting', function () {
  //   let connecting = this.get('twitch.connecting');
  //
  //   if (connecting) {
  //     this.get('notifications').info('Connecting to Twitch... Please wait...');
  //   } else {
  //     this.get('notifications').remove();
  //   }
  // }),

  // onFetchingEmotes: Ember.observer('twitch.emotes.fetchingEmotes', function () {
  //   let fetchingEmotes = this.get('twitch.emotes.fetchingEmotes');
  //
  //   if (fetchingEmotes) {
  //     this.get('notifications').info('Fetching Twitch Emojis... Please wait...');
  //   } else {
  //     //************************************************************************
  //     // TODO: REMOVE DEV CODE
  //     if (ENV.APP.mockMessages) {
  //       this.get('twitch').say('dvrsPUP');
  //     }
  //     // END DEV CODE
  //     //************************************************************************
  //
  //     this.get('notifications').remove();
  //   }
  // })
});
