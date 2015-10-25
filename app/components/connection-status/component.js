import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  twitch: Ember.inject.service(),
  clients: Ember.computed.alias('twitch.clients'),
  clientCount: Ember.computed.alias('twitch.clientCount'),
  clientColWidth: Ember.computed('clientCount', function () {
    let maxColWidth = 12;
    let clientCount = this.get('clientCount');

    return Math.floor(maxColWidth/clientCount);
  }),

  actions: {
    connect(client) {
      client.connect();
    },

    disconnect(client) {
      client.disconnect();
    }
  }
});
