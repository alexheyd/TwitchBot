import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['whisper-message'],
  classNameBindings: ['whisper.sendTo:outgoing'],
  twitch: Ember.inject.service(),
  myName: Ember.computed.alias('twitch.streamerName')
});
