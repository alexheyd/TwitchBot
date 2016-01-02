import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'commands'],
  settings              : Ember.inject.service(),
  commandTrigger        : Ember.computed.alias('settings.prefs.commandTrigger')
});
