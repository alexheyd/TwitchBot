import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['chat-msg'],
  classNameBindings: ['message.lastRead'],

  click() {
    this.sendAction('markAsLast', this.get('message'));
  }
});
