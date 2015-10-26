import Ember from 'ember';

export default Ember.Component.extend({
  classNames           : ['settings'],
  settings             : Ember.inject.service(),
  users                : Ember.computed.alias('settings.prefs.users'),
  defaultChannel       : Ember.computed.alias('settings.prefs.defaultChannel'),
  commandTrigger       : Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger         : Ember.computed.alias('settings.prefs.macroTrigger'),
  viewerTimeoutDuration: Ember.computed.alias('settings.prefs.viewerTimeoutDuration'),
  newUsername          : null,
  newOauth             : null,
  mainAccount          : null,

  actions: {
    save() {
      this.save();
    }
  },

  save() {
    this.get('settings').save();
  },

  didInsertElement() {
    this.get('settings').load();
  }
});
