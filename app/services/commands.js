import Ember from 'ember';

export default Ember.Service.extend({
  twitch: Ember.inject.service(),
  settings: Ember.inject.service(),

  commandPrefix: Ember.computed.alias('settings.prefs.commandPrefix'),

  list: {
    hello(msg) {
      this.get('twitch.bot').say('ghostcryptology', 'hellooooo ' + msg);
    }
  },

  execute(command) {
    command = command.replace(this.get('commandPrefix'), '').split(' ');
    let cmd = command.shift();
    let handler = this.get('list.' + cmd);

    if (handler) {
      handler.apply(this, command);
    }
  }
});
