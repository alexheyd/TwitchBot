import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.route('dashboard');
  this.route('giveaways');
  this.route('lists');
  this.route('loyalty');
  this.route('starred');

  this.route('settings', function() {
    this.route('accounts');
    this.route('chat');
    this.route('commands');
    this.route('macros');
    this.route('lists');
    this.route('loyalty');
    this.route('giveaways');
  });
});

export default Router;
