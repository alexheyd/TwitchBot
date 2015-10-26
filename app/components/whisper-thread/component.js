import Ember from 'ember';

// TODO: implement whisper thread minimize, restore, close, ignore
export default Ember.Component.extend({
  classNames: ['whisper-thread'],
  classNameBindings: ['recipient'],

  twitch: Ember.inject.service(),

  threadReply: '',

  didRender() {
    this.scrollToBottom();
  },

  actions: {
    reply() {
      let reply = this.get('threadReply');

      if (reply) {
        this.get('twitch').whisper(this.get('recipient'), this.get('threadReply'));
        this.set('threadReply', '');
      }
    }
  },

  scrollToBottom() {
    let threadBox = this.$('.thread-content')[0];
    threadBox.scrollTop = threadBox.scrollHeight;
  },
});
