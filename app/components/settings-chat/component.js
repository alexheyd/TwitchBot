import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'chat'],
  target                : Ember.computed.alias('targetObject'),
  settings              : Ember.inject.service(),
  defaultChannel        : Ember.computed.alias('settings.prefs.defaultChannel'),
  viewerTimeoutDuration : Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  followerUpdateInterval: Ember.computed.alias('settings.prefs.followerUpdateInterval'),
  chatlistUpdateInterval: Ember.computed.alias('settings.prefs.chatlistUpdateInterval'),

  actions: {
    save() {
      this.save();
    }
  },

  save() {
    this.get('settings').save();
  }
});
