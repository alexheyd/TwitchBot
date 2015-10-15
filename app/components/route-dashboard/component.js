import Ember from 'ember';
import FakeMessages from 'twitch-bot/mocks/messages';

export default Ember.Component.extend({
  classNames: ['container-fluid', 'dashboard'],
  twitch: Ember.inject.service(),
  // chatroom: FakeMessages,
  chatroom: Ember.computed.alias('twitch.chatroom'),
  mentions: Ember.computed.alias('twitch.mentions')
});
