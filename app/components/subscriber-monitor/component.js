import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  twitch: Ember.inject.service(),
  latestSubs: Ember.computed.alias('twitch.latestSubs'),
  subsCopy: Ember.computed('latestSubs', function () {
    return this.get('latestSubs').length > 1 ? 'subscribers' : 'subscriber';
  })
});
