import Ember from 'ember';

export default Ember.Component.extend({
  classNames            : ['settings', 'giveaways'],
  settings              : Ember.inject.service()
});
