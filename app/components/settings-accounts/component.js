import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['settings', 'accounts'],

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', this.onAfterRender.bind(this));
  },

  onAfterRender() {
    this.$('select').chosen({disable_search_threshold: 10});
  }
});
