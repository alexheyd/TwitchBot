import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  twitch: Ember.inject.service(),
  settings: Ember.inject.service(),
  notifications: Ember.inject.service(),

  users: Ember.computed.alias('settings.users'),
  channel: Ember.computed.alias('twitch.channel'),

  actions: {
    joinChannel() {
      let channel = this.get('channel');

      if (channel.indexOf('#') !== 0) {
        this.get('notifications').error('Channel name must start be with a #');
      } else {
        console.log('joinChannel: ', channel);

        // TODO: implement joinChannel
      }
    }
  }
});
