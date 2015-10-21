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
     * /poll "question with spaces" "answer 1" "answer 2"
     * /vote answerNumber
     */
    hello(msg) {
      this.botSay('hello, ' + msg);
    },

    poll() {
      let args = Array.prototype.slice.call(arguments);
      let question = args.shift();
      let answers = '';

      args.forEach((answer, index) => {
        let count = index + 1;
        answers = `${answers} #${count}: ${answer} `;
      });

      this.botSay('Poll: ' + question + ' ' + answers);
    }
  },

  botSay(msg) {
    this.get('bot').say(this.get('twitch.channel'), msg);
  },

  execute(command) {
    command = command.replace(this.get('commandPrefix'), '');

    // split on spaces except those within quotes
    let commandArray = command.match(/(?:[^\s"]+|"[^"]*")+/g);

    // remove double quotes
    commandArray = commandArray.map((item) => {
      return item.replace(/"/g, '');
    });

    let cmd = commandArray.shift();
    let handler = this.get('list.' + cmd);

    if (handler) {
      handler.apply(this, commandArray);
    }
  }
});
