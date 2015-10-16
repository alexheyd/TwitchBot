import Ember from 'ember';

export default Ember.Component.extend({
  notifications: Ember.inject.service(),
  twitch: Ember.inject.service(),

  target: Ember.computed.alias('targetObject'),
  chatroom: Ember.computed.alias('twitch.chatroom'),
  mentions: Ember.computed.alias('twitch.mentions'),
  notification: Ember.computed.alias('notifications.item'),

  classNames: ['application', 'container-fluid'],

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
      this.get('notifications').remove();
    }

  }.observes('twitch.fetchingEmotes').on('didInsertElement')
});
