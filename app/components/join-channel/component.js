import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  twitch: Ember.inject.service(),
  notifications: Ember.inject.service(),

  channel: Ember.computed.alias('twitch.channel'),

  channelName: '',

  actions: {
    joinChannel() {
      let channel = this.get('channelName');

      if (channel.indexOf('#') !== 0) {
        this.get('notifications').error('Channel name must start be with a #');
      } else {
        console.log('joinChannel: ', channel);
        // this.set('twitch.channel', channel);
        this.get('twitch').join(channel);

        // TODO: implement joinChannel
      }
    }
  },

  init() {
    this.set('channelName', this.get('channel'));
    this._super();
  }
});
