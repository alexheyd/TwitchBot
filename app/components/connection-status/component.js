import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['connection-status'],
  twitch: Ember.inject.service(),
  clients: Ember.computed.alias('twitch.clients'),
  clientCount: Ember.computed.alias('twitch.clientCount')
});
