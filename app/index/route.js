import Ember from 'ember';

export default Ember.Route.extend({
  twitch: Ember.inject.service(),

  afterModel() {
    this.transitionTo('dashboard');
  }
});
