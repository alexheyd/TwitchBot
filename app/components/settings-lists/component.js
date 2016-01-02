import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'lists'],
  settings              : Ember.inject.service()
});
