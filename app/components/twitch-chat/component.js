import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['twitch-chat', 'row'],

  twitch: Ember.inject.service(),

  autoScroll: true,

  unreadMessages: false,

  lastReadIndex: null,

  chatInput: '',

  enableChatInput: false,

  enableViewerList: false,

  lastReadMarkerSet: false,

  actions: {
    markAsLast(message) {
      if (message.lastRead) {
        this.markAllAsRead();
      } else {
        this.markLastRead(message);
      }
    },

    jumpToLastRead() {
      this.scrollToLastReadMarker();
    },

    say() {
      let chatInput = this.get('chatInput');

      if (chatInput) {
        this.get('twitch').say(chatInput);
        this.set('chatInput', '');
      }
    }
  },

  didInsertElement() {
    // connect to twitch
    // this.get('twitch').connect();
    this.$('.chatbox').on('scroll', this.onScroll.bind(this));
  },

  // updates chat scroll position when new chat messages are received
  didRender() {
    if (this.get('autoScroll')) {
      this.scrollToBottom();
    }

    this.convertEmojis();
  },

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
        if (this.get('twitch').isEmote(word)) {
          // create emoji image tag
          word = `<img src="${this.get('twitch').getEmoteImageUrl(word)}" />`;
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
    this.set('unreadMessages', true);
    Ember.set(message, 'lastRead', true);
  },

  markAllAsRead() {
    this.get('messages').setEach('lastRead', false);
    this.set('unreadMessages', false);
    this.set('lastReadMarkerSet', false);
  },

  onScroll() {
    this.set('autoScroll', false);

    if (this.isScrolledToBottom()) {
      this.set('autoScroll', true);
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
  },

  scrollToLastReadMarker() {
    let msgs = this.get('messages');
    let lastRead = msgs.findBy('lastRead', true);
    let index = null;

    if (lastRead) {
      index = msgs.indexOf(lastRead);
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
