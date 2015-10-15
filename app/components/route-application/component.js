import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['application', 'container-fluid'],

  twitch: Ember.inject.service(),
  chatroom: Ember.computed.alias('twitch.chatroom'),
  mentions: Ember.computed.alias('twitch.mentions')
});
