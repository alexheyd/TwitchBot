import Ember from 'ember';

export default Ember.Component.extend({
  notifications: Ember.inject.service(),
  twitch: Ember.inject.service(),

  target: Ember.computed.alias('targetObject'),
  chatroom: Ember.computed.alias('twitch.chatroom'),
  mentions: Ember.computed.alias('twitch.mentions'),
  notification: Ember.computed.alias('notifications.item'),

  classNames: ['application', 'container-fluid'],

  //************************************************************************
  // TODO: REMOVE DEV CODE
  didInsertElement() {
    this.get('twitch').on('join', this.onChannelJoin.bind(this));
  },

  onChannelJoin() {
    let _say = msg => {
      this.get('twitch').say(msg || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
    };

    _say();

    Ember.run.later(_say.bind(this, '@GhostCryptology hi'), 1000);
    Ember.run.later(_say.bind(this), 2000);
    Ember.run.later(_say.bind(this, '@GhostCryptology hello'), 3000);
  },
  // END DEV CODE
  //************************************************************************

  onTwitchConnection: function () {
    let connecting = this.get('twitch.connecting');

    if (connecting) {
      this.get('notifications').info('Connecting to Twitch... Please wait...');
    } else {
      this.get('notifications').remove();
    }
  }.observes('twitch.connecting').on('didInsertElement'),

  onFetchingEmotes: function () {
    let fetchingEmotes = this.get('twitch.fetchingEmotes');

    if (fetchingEmotes) {
      this.get('notifications').info('Fetching Twitch Emojis... Please wait...');
    } else {
      //************************************************************************
      // TODO: REMOVE DEV CODE
      this.get('twitch').say('dvrsPUP');
      // END DEV CODE
      //************************************************************************

      this.get('notifications').remove();
    }

  }.observes('twitch.fetchingEmotes').on('didInsertElement')
});
