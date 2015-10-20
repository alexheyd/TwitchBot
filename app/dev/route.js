import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate() {
    this.render('dev', {
      into: 'application',
      outlet: 'dev'
    });
  }
});
