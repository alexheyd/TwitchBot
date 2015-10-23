import Ember from 'ember';

export default Ember.Service.extend({
  twitch: Ember.inject.service(),
  settings: Ember.inject.service(),

  commandTrigger: Ember.computed.alias('settings.prefs.commandTrigger'),
  macroTrigger: '~', // TODO: put in settings
  bot: Ember.computed.alias('twitch.bot'),

  // list: {
  //
  //   /**
  //    * Built-in commands
  //    *
  //    * /list listName -- user joins listName
  //    * /unlist listName -- user leaves listName (if no listName, leaves all lists)
  //    * /random 50
  //    * /poll "question with spaces" "answer 1" "answer 2"
  //    * /vote answerNumber
  //    */
  //   hello(msg) {
  //     this.botSay('hello, ' + msg);
  //   },
  //
  //   poll() {
  //     let args = Array.prototype.slice.call(arguments);
  //     let question = args.shift();
  //     let answers = '';
  //
  //     args.forEach((answer, index) => {
  //       let count = index + 1;
  //       answers = `${answers} #${count}: ${answer} `;
  //     });
  //
  //     this.botSay('Poll: ' + question + ' ' + answers);
  //   }
  // },

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

  process(message, user) {
    // remove command trigger
    message = message.replace(this.get('commandTrigger'), '');

    // split on spaces except those within quotes
    let messageParts = message.match(/(?:[^\s"]+|"[^"]*")+/g);

    // remove double quotes
    messageParts = messageParts.map((item) => {
      return item.replace(/"/g, '');
    });

    // command name is the first message part, the rest are command params
    let commandName = messageParts.shift();

    // TODO: implement permissions

    let commandRules = this.getRules(commandName);
    let command = commandRules.command;


    if (command) {
      command.apply(this, messageParts);
    }
  },

  getRules(name) {
    return this.get(`rules.${name}`) || null;
  },

  getMacro(name) {
    return this.get(`macros.${name}`) || null;
  },

  // TODO: create execute method

  // TODO: DRY up process code

  processMacro(message) {
    message = message.replace(this.get('macroTrigger'), '');

    // split on spaces except those within quotes
    let messageParts = message.match(/(?:[^\s"]+|"[^"]*")+/g);

    // remove double quotes
    messageParts = messageParts.map((item) => {
      return item.replace(/"/g, '');
    });

    // command name is the first message part, the rest are command params
    let macroName = messageParts.shift();
    let macro = this.getMacro(macroName);

    if (macro) {
      macro.apply(this, messageParts);
    }
  }
});
