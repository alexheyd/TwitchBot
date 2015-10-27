import Ember from 'ember';

// TODO: implement whisper thread ignore
export default Ember.Component.extend({
  classNames       : ['whisper-thread'],
  classNameBindings: ['recipient', 'minimized'],
  twitch           : Ember.inject.service(),
  threadReply      : '',
  minimized        : false,

  toggleIconClass: Ember.computed('minimized', function () {
    return this.get('minimized') ? 'fa-caret-square-o-up' : 'fa-caret-square-o-down';
  }),

  onThreadUpdate: Ember.observer('thread.[]', function () {
    if (!this.get('isVisible')) {
      this.set('isVisible', true);
    }

    if (this.get('minimized')) {
      this.set('minimized', false);
    }
  }),

  actions: {
    reply() {
      let reply = this.get('threadReply');

      if (reply) {
        this.get('twitch').whisper(this.get('recipient'), this.get('threadReply'));
        this.set('threadReply', '');
      }
    },

    closeThread() {
      this.set('isVisible', false);
    },

    toggleThread() {
      this.toggleProperty('minimized');
    }
  },

  didRender() {
    this.scrollToBottom();
  },

  scrollToBottom() {
    let threadBox = this.$('.thread-content')[0];
    threadBox.scrollTop = threadBox.scrollHeight;
  },
});
