import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  
  notificationActive: Ember.computed('notification', function () {
    if (this.get('notification')) {
      return new Ember.Handlebars.SafeString('active');
    }
  })
});
