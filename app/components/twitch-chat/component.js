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

  actions: {
    jumpToLastRead() {
      this.scrollToLastReadMessage();
      this.set('unreadMessages', false);
      this.set('lastReadIndex', null);
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
    this.get('twitch').connect();

    this.$('.chatbox').on('scroll', this.onScroll.bind(this));
  },

  // updates chat scroll position when new chat messages are received
  didRender() {
    this.markLastReadMessage();

    // if user scrolled up, show New Messages badge

    // if user is at the bottom of chat, auto scroll chat and set lastRead marker
    // (only if a certain condition is met... need to determine proper condition)
    // maybe if a lastRead marker exists, don't add new one. if not, add it to the last visible message

    if (this.get('autoScroll')) {
      this.scrollToBottom();
    } else {
      this.set('unreadMessages', true);
    }

    let msgs = this.get('messages');

    if (msgs.length) {
      let lastMsg = msgs[msgs.length - 1];

      if (lastMsg.processed) {
        return;
      }

      let words = lastMsg.content.split(' ');
      let newMsg = '';

      console.log('words: ', words);

      words.forEach(function (word) {
        if (this.get('twitch').isEmote(word)) {
          let imageUrl = this.get('twitch').getEmoteImageUrl(word);
          word = `<img src="${imageUrl}" />`;
        }

        newMsg += word + ' ';
      }.bind(this));

      Ember.set(msgs[msgs.length - 1], 'content', newMsg);
      Ember.set(msgs[msgs.length - 1], 'processed', true);
    }
  },

  markLastReadMessage() {
    let $chatbox = this.$('.chatbox');
    let $messages = $chatbox.find('.chat-msg');
    let index = this.get('messages').length - 1;

    if (!this.isScrolledToTop()) {
      if (!$chatbox.find('.last-msg').length && index > -1) {
        // $chatbox.find('.last-msg').removeClass('last-msg');

        console.log('index: ', index);

        $messages.eq(index).addClass('last-msg');
        this.set('lastReadIndex', index);
      }
    }
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

  scrollToLastReadMessage() {
    this.scrollTo(this.get('lastReadIndex'));
  },

  scrollTo(index) {
    let message = this.$('.chat-msg').eq(index)[0];
    let top = message.offsetTop;

    this.$('.chatbox')[0].scrollTop = top;
  }
});
