import Ember from 'ember';

export default Ember.Component.extend({
  tagName           : '',
  followers         : Ember.inject.service(),
  followerCount     : Ember.computed.alias('followers.count'),
  latestFollowers   : Ember.computed.alias('followers.latest'),
  lastFollowerUpdate: Ember.computed.alias('followers.lastUpdate'),
  newFollowerCount  : Ember.computed.alias('followers.newCount'),

  followerCopy: Ember.computed('newFollowerCount', function () {
    return this.get('newFollowerCount') > 1 ? 'followers' : 'follower';
  })
});
