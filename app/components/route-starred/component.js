import Ember from 'ember';

export default Ember.Component.extend({
  twitch: Ember.inject.service(),
  starredMessages: Ember.computed('twitch.starred.[]', function () {
    return this.get('twitch.starred');
  })
});
