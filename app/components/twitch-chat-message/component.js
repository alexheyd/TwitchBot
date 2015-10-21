import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['chat-msg'],
  classNameBindings: ['message.lastRead'],
  banned: false,

  actions: {
    markAsLast(message) {
      this.sendAction('markAsLast', message);
    },

    toggleStarMessage() {
      this.toggleProperty('message.starred');
    },

    timeoutUser(user) {
      console.log('timeout: ', user.username);
      // this.get('twitch').timeout(user.username);
    },

    toggleUserBan(user) {
      console.log('ban: ', user.username);

      if (this.get('banned')) {
        // this.get('twitch').unban(user.username);
      } else {
        // this.get('twitch').ban(user.username);
      }

      this.toggleProperty('banned');
    }
  },

  markAsReadIconClass: Ember.computed('message.lastRead', function () {
    return this.get('message.lastRead') ? 'fa-sticky-note' : 'fa-sticky-note-o';
  }),

  starIconClass: Ember.computed('message.starred', function () {
    return this.get('message.starred') ? 'fa-star' : 'fa-star-o';
  }),

  banIconClass: Ember.computed('banned', function () {
    return this.get('banned') ? 'fa-unlock' : 'fa-lock';
  })
});
