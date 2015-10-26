import Ember from 'ember';

export default Ember.Component.extend({
  twitch           : Ember.inject.service(),
  classNames       : ['chat-msg'],
  classNameBindings: ['message.lastRead', 'messageType'],
  banned           : false,
  messageType      : Ember.computed.alias('message.user.message-type'),

  messageStyle: Ember.computed('messageType', function () {
    return this.get('messageType') === 'action' ? `color: ${this.get('message.user.color')}` : '';
  }),

  actions: {
    markAsLast(message) {
      this.sendAction('markAsLast', message || this.get('message'));
    },

    toggleStarMessage() {
      this.toggleProperty('message.starred');
      this.get('twitch').toggleStarMessage(this.get('message'));
    },

    timeoutUser(user) {
      console.log('timeout: ', user.username);
      // TODO: enable timeout through chat message
      // this.get('twitch').timeout(user.username);
    },

    toggleUserBan(user) {
      console.log('ban: ', user.username);

      // TODO: implement confirm dialog
      // this.get('dialog').confirm('Are you sure?', {
      //   labels: {
      //     yes: 'OK', no: 'Cancel'
      //   },
      //
      //   actions: {
      //     yes: 'yesAction', no: 'noAction'
      //   }
      // }).then(this.ban.bind(this), this.cancelBan.bind(this));

      // TODO: enable ban/unban through chat message
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
  }),

  doubleClick() {
    this.send('markAsLast');
  }
});
