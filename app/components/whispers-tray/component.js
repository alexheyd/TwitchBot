import Ember from 'ember';

export default Ember.Component.extend({
  classNames : ['whispers-tray'],
  whispers   : Ember.inject.service(),
  threads    : Ember.computed.alias('whispers.threads')
});
