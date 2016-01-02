import Ember from 'ember';

export default Ember.Service.extend({
  item: null,

  onItemChanged: Ember.observer('item', function() {
    if (this.get('item')) {
      Ember.run.later(this, this.remove, 5000);
    }
  }),

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
