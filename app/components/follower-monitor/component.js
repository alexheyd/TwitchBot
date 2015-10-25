import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  twitch: Ember.inject.service(),
  followerCount: Ember.computed.alias('twitch.followerCount'),
  latestFollowers: Ember.computed.alias('twitch.latestFollowers'),
  lastFollowerUpdate: Ember.computed.alias('twitch.lastFollowerUpdate'),
  newFollowerCount: Ember.computed.alias('twitch.newFollowerCount'),
  followerCopy: Ember.computed('newFollowerCount', function () {
    return this.get('newFollowerCount') > 1 ? 'followers' : 'follower';
  })
});
