import Ember from 'ember';

export default Ember.Service.extend({
  item: null,

  error(msg) {
    this.set('item', {
      type: 'error',
      content: msg
    });
  },

  info(msg) {
    this.set('item', {
      type: 'info',
      content: msg
    });
  },

  remove() {
    this.set('item', null);
  }
});
