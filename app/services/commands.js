import Ember from 'ember';

export default Ember.Service.extend({
  twitch: Ember.inject.service(),
  settings: Ember.inject.service(),

  commandTrigger: Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger: Ember.computed.alias('settings.prefs.macroTrigger'),
  bot: Ember.computed.alias('twitch.bot'),

  rules: {
    hello: {
      permission: 'all', // all, followers, subs, mods, me
      command(msg) {
        this.botSay('hello, ' + msg);
      }
    },

    poll: {
      permission: 'me',
      command() {
        let args = Array.prototype.slice.call(arguments);
        let question = args.shift();
        let answers = '';

        args.forEach((answer, index) => {
          let count = index + 1;
          answers = `${answers} #${count}: ${answer} `;
        });

        this.botSay('Poll: ' + question + ' ' + answers);
      }
    }
  },

  macros: {
    hype(name) {
      this.get('twitch').say(`######## ${name} ######## SUB HYPPPPPPEEEEEE @@@`);
    }
  },

  botSay(msg) {
    this.get('bot').say(this.get('twitch.channel'), msg);
  },

  processCommand(message, user) {
    let command = this.processMessage(message, this.get('commandTrigger'));
    this.execute(command.name, command.params, user);
  },

  processMacro(message) {
    let command = this.processMessage(message, this.get('macroTrigger'));
    this.execute(command.name, command.params);
  },

  processMessage(message, trigger) {
    // remove command trigger
    message = message.replace(trigger, '');

    // split on spaces except those within quotes
    let messageParts = message.match(/(?:[^\s"]+|"[^"]*")+/g);

    // remove double quotes
    messageParts = messageParts.map((item) => {
      return item.replace(/"/g, '');
    });

    // command name is the first message part, the rest are command params
    let commandName = messageParts.shift();
    let commandRules = this.getRules(commandName);

    // TODO: implement permissions
    commandRules.allowed = true;
    commandRules.name = commandName;

    return commandRules;
  },

  execute(commandName, params, user) {
    let command = this.getRules(commandName);
    command.handler.apply(this, params);
  },

  isValidCommandRules(rules) {
    return (rules && rules.allowed && rules.handler && typeof rules.handler === 'function');
  },

  getRules(name) {
    return this.get(`rules.${name}`) || null;
  },

  getMacro(name) {
    return this.get(`macros.${name}`) || null;
  }
});
