import Ember from 'ember';

export default Ember.Service.extend({
  twitch: Ember.inject.service(),
  settings: Ember.inject.service(),

  commandPrefix: Ember.computed.alias('settings.prefs.commandPrefix'),
  bot: Ember.computed.alias('twitch.bot'),

  list: {

    /**
     * Built-in commands
     *
     * /list listName -- user joins listName
     * /unlist listName -- user leaves listName (if no listName, leaves all lists)
     * /random 50
     * /poll "question with spaces":"answer 1":"answer 2"
     *
     */
    hello(msg) {
      this.botSay('hello, ' + msg);
    }
  },

  botSay(msg) {
    this.get('bot').say(this.get('twitch.channel'), msg);
  },

  execute(command) {
    // TODO: allow quotes to group a string (for poll questions)
    command = command.replace(this.get('commandPrefix'), '').split(' ');
    let cmd = command.shift();
    let handler = this.get('list.' + cmd);

    if (handler) {
      handler.apply(this, command);
    }
  }
});
