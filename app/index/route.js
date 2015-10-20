import Ember from 'ember';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  afterModel() {
    this.get('settings').load().then(this.goToDashboard.bind(this), this.goToSettings.bind(this));
  },

  goToDashboard() {
    this.transitionTo('dashboard');
  },

  goToSettings() {
    this.transitionTo('settings');
  }
});
