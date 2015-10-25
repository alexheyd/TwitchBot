import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['twitch-chat', 'row'],

  twitch: Ember.inject.service(),
  commander: Ember.inject.service(),

  autoScroll: true,
  newMessages: false,
  enableChatInput: false,
  enableChatterList: false,
  lastReadMarkerSet: false,
  chatInput: '',

  actions: {
    useEmoji(code) {
      this.insertChat(code);
    },

    markAsLast(message) {
      if (message.lastRead) {
        this.markAllAsRead();
      } else {
        this.markLastRead(message);
      }
    },

    scrollToLastRead() {
      this.scrollToLastReadMarker();
    },

    scrollToBottom() {
      this.scrollToBottom();
    },

    say() {
      let chatInput = this.get('chatInput');
      let commander = this.get('commander');

      if (chatInput) {
        if (commander.isMacro(chatInput)) {
          commander.processMacro(chatInput);
        } else if (commander.isCustomCommand(chatInput)) {
          commander.processCommand(chatInput);
        } else {
          this.get('twitch').say(chatInput);
        }

        this.set('chatInput', '');
      }
    }
  },

  insertChat(str) {
    if (str && typeof str === 'string') {
      this.set('chatInput', `${this.get('chatInput')} ${str} `);
    }
  },

  didInsertElement() {
    this.$('.chatbox').on('scroll', this.onScroll.bind(this));
  },

  // updates chat scroll position when new chat messages are received
  didRender() {
    // TODO: fix auto scroll
    if (this.get('autoScroll')) {
      this.scrollToBottom();
    }

    this.convertEmojis();
  },

  onMessageAdded: function () {
    this.set('newMessages', !this.isScrolledToBottom());
  }.observes('messages.[]'),

  convertEmojis() {
    let msgs = this.get('messages');

    if (msgs.length) {
      let lastMsg = msgs[msgs.length - 1];
      let words = lastMsg.content.split(' ');
      let newMessage = [];

      if (lastMsg.emojisConverted) {
        return;
      }

      // check each word in the message
      words.forEach(word => {
        if (this.get('twitch.emotes').isEmote(word)) {
          // create emoji image tag
          word = `<img src="${this.get('twitch.emotes').getEmote(word).imageUrl}" />`;
        }

        newMessage.push(word);
      });

      // update view with converted emojis
      Ember.set(lastMsg, 'content', newMessage.join(' '));

      // prevent same message from being reprocessed
      Ember.set(lastMsg, 'emojisConverted', true);
    }
  },

  markLastRead(message) {
    this.get('messages').setEach('lastRead', false);
    this.set('lastReadMarkerSet', true);
    Ember.set(message, 'lastRead', true);
  },

  markAllAsRead() {
    this.get('messages').setEach('lastRead', false);
    this.set('lastReadMarkerSet', false);
  },

  onScroll() {
    this.set('autoScroll', false);

    if (this.isScrolledToBottom()) {
      this.set('autoScroll', true);
      this.set('newMessages', false);
    }
  },

  isScrolledToTop() {
    return this.$('.chatbox')[0].scrollTop === 0;
  },

  isScrolledToBottom() {
    let $chatbox = this.$('.chatbox');
    let chatbox = $chatbox[0];

    return chatbox.scrollTop === (chatbox.scrollHeight - $chatbox.height());
  },

  scrollToBottom() {
    let chatbox = this.$('.chatbox')[0];
    chatbox.scrollTop = chatbox.scrollHeight;
    this.set('newMessages', false);
  },

  scrollToLastReadMarker() {
    let msgs = this.get('messages');
    let lastRead = msgs.findBy('lastRead', true);
    let index = null;

    if (lastRead) {
      index = msgs.indexOf(lastRead);
      // TODO: figure out if we want to unset last read message after jumping to it
      // Ember.set(lastRead, 'lastRead', false);
      // this.set('lastReadMarkerSet', false);
    }

    if (typeof index !== 'undefined' && index !== null) {
      this.scrollTo(index);
    }
  },

  scrollTo(index) {
    let message = this.$('.chat-msg').eq(index)[0];
    let top = message.offsetTop;

    this.$('.chatbox')[0].scrollTop = top;
  }
});
