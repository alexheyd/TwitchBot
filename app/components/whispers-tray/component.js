import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['whispers-tray'],
  twitch: Ember.inject.service(),
  whisperThreads: Ember.computed.alias('twitch.whisperThreads')
});
