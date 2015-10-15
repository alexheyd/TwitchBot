import Ember from 'ember';

export default Ember.Service.extend({
  store: localStorage,

  getItem(key) {
    return this.get('store').getItem(key);
  },

  setItem(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    this.get('store').setItem(key, value);
  },

  removeItem(key) {
    this.get('store').removeItem(key);
  }
});
