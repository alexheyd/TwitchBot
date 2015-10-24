import Ember from 'ember';

export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  clients: Ember.computed.alias('twitch.clients'),
  status: Ember.computed('twitch.connected', 'twitch.connecting', function () {
    let connected = this.get('twitch.connected');
    let connecting = this.get('twitch.connecting');
    let status = 'Disconnected';

    if (connected) {
      status = 'Connected';
    } else if (connecting) {
      status = 'Connecting';
    } else {
      status = 'Disconnected';
    }

    return status;
  })
});
