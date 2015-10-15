import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('dashboard');
  this.route('settings');
  this.route('giveaways');
  this.route('lists');
  this.route('loyalty');
});

export default Router;
