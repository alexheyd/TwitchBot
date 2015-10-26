import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import loadQueryParams from 'twitch-bot/scripts/load-query-params';
import config from './config/environment';

var App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix   : config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver       : Resolver
});

loadInitializers(App, config.modulePrefix);
loadQueryParams();

export default App;
