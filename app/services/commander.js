import Ember from 'ember';

export default Ember.Service.extend({
  twitch        : Ember.inject.service(),
  whispers      : Ember.inject.service(),
  settings      : Ember.inject.service(),
  commandTrigger: Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger  : Ember.computed.alias('settings.prefs.macroTrigger'),
  bot           : Ember.computed.alias('twitch.bot'),

  rules: {
    hello: {
      permissions: 'all', // all, followers, subs, mods, me
      handler(msg) {
        this.botSay('hello, ' + msg);
      }
    },

    slap: {
      permissions: 'all',
      handler(name) {
        this.botAction(`slaps ${name} across the face with a trout.`);
        this.botSay(`Know your role, ${name}.`);
      }
    },

    poll: {
      permissions: 'me',
      handler() {
        let args     = Array.prototype.slice.call(arguments);
        let question = args.shift();
        let answers  = '';

        args.forEach((answer, index) => {
          let count = index + 1;
          answers   = `${answers} #${count}: ${answer} `;
        });

        this.botSay('Poll: ' + question + ' ' + answers);
      }
    }
  },
  // macros make the streamer account say something predefined in chat
  macros: {
    hype(name) {
      this.get('twitch').say(`######## ${name} ######## SUB HYPPPPPPEEEEEE @@@`);
    }
  },

  botSay(msg) {
    this.get('twitch').botSay(msg);
  },

  botAction(msg) {
    this.get('twitch').botAction(msg);
  },

  processCommand(message, user) {
    let command = this.processMessage(message, this.get('commandTrigger'));
    this.execute(command.name, command.params, user);
  },

  processMacro(message) {
    let command = this.processMessage(message, this.get('macroTrigger'));
    this.executeMacro(command.name, command.params);
  },

  processMessage(message, trigger) {
    // strip command or macro trigger
    message = message.replace(trigger, '');

    // split on spaces except those within quotes, and strip out double quotes
    let messageParts = message.match(/(?:[^\s"]+|"[^"]*")+/g).map((item) => {
      return item.replace(/"/g, '');
    });

    // command name is the first message part, the rest are command params
    let commandName  = messageParts.shift();
    let commandRules = this.getRules(commandName) || {};

    // TODO: implement permissions
    commandRules.allowed = true;
    commandRules.name    = commandName;
    commandRules.params  = messageParts;

    return commandRules;
  },

  processWhisper(message) {
    let messageParts = message.replace('/w ', '').split(' ');
    let username     = messageParts.shift();
    let msg          = messageParts.join(' ');

    this.get('whispers').send(username, msg);
  },

  execute(commandName, params/*, user*/) {
    let command = this.getRules(commandName);

    if (command) {
      command.handler.apply(this, params);
    }
  },

  executeMacro(macroName, params) {
    let macro = this.getMacro(macroName);

    if (macro) {
      macro.apply(this, params);
    }
  },

  isMacroOrCommand(message) {
    return this.isMacro(message) || this.isCustomCommand(message);
  },

  isMacro(message) {
    return message.indexOf(this.get('macroTrigger')) === 0;
  },

  isWhisper(message) {
    return message.indexOf('/w') === 0;
  },

  isCustomCommand(message) {
    return message.indexOf(this.get('commandTrigger')) === 0;
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
