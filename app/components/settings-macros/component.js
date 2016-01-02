import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'macros'],
  settings              : Ember.inject.service(),
  macroTrigger          : Ember.computed.alias('settings.prefs.macroTrigger')
});
