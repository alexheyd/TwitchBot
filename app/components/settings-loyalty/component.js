import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'loyalty'],
  settings              : Ember.inject.service()
});
