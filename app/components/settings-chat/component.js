import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'chat'],
  settings              : Ember.inject.service(),
  defaultChannel        : Ember.computed.alias('settings.prefs.defaultChannel'),
  viewerTimeoutDuration : Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  followerUpdateInterval: Ember.computed.alias('settings.prefs.followerUpdateInterval'),
  chatlistUpdateInterval: Ember.computed.alias('settings.prefs.chatlistUpdateInterval')
});
