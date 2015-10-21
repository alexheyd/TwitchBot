import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'img',
  attributeBindings: ['src'],

  didInsertElement() {
    this.$().on('error', this.onImgLoadError.bind(this));
  },

  onImgLoadError() {
    console.log('onImgLoadError');
    this.sendAction('image404', this.get('src'));
    // this.destroy();
  }
});
