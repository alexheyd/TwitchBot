import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  twitch: Ember.inject.service(),

  banned: false,

  linkText: 'Ban',

  actions: {
    ban(user) {
      this.get('banned') ? this.unban(user) : this.ban(user);
    }
  },

  userWasBanned: function () {
    this.set('linkText', this.get('banned') ? 'Unban' : 'Ban');
  }.observes('banned').on('init'),

  ban(user) {
    console.log('banning: ', user.username);
    // this.get('twitch').ban(user.username);
    this.set('banned', true);
  },

  unban(user) {
    console.log('unbanning: ', user.username);
    // this.get('twitch').unban(user.username);
    this.set('banned', false);
  }
});
