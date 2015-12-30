import Ember from 'ember';

// ChatterAutoComplete = {
//   completions: {
//     '@': [],
//     '/w': []
//   }
// }

// TODO: refactor completions as mixin to support both chatter and whispers with different triggers
export default Ember.Component.extend({
  classNames           : ['input-autocomplete'],
  twitch               : Ember.inject.service(),
  highlightIndex       : 0,
  filteredCompletions  : null,
  $completionList      : null,
  $input               : null,
  completionListVisible: false,
  savedCaretPosition   : 0,
  chatInput            : '',
  filter               : '',

  onFilterChange: Ember.observer('filter', function () {
    // strip out the @
    let filter      = this.get('filter').substr(1);
    let completions = this.get('completions');

    if (filter) {
      completions = completions.filter(completion => {
        return (completion.indexOf(filter) > -1);
      });
    }

    this.set('filteredCompletions', completions);
  }),

  // TODO: figure out more Emberish way of highlighting completions
  onHighlightIndexChanged: Ember.observer('highlightIndex', function () {
    let $items = this.get('$completionList').children('li');
    let index  = this.get('highlightIndex');

    $items.removeClass('highlighted').eq(index).addClass('highlighted');
  }),

  chatInputChanged: Ember.observer('chatInput', function () {
    let chatInput = this.get('chatInput');

    // if chat input is empty, hide the completion list
    if (!chatInput) {
      this.hideCompletions();
    } else {
      // split the message on spaces to figure out if there's an autocomplete trigger
      let messageParts    = chatInput.split(' ');
      let triggerFound    = false;
      let usernameTrigger = '@';

      // check each word
      messageParts.forEach((messagePart) => {
        // if usernameTrigger is found, and isn't a completion
        if (messagePart && messagePart.indexOf(usernameTrigger) === 0 && !this.matchesAnyCompletion(messagePart)) {
          // filter completion list by that string
          this.set('filter', messagePart);
          triggerFound = true;
        }
      });

      if (!triggerFound) {
        this.hideCompletions();
      }
    }
  }),

  actions: {
    useEmoji(code) {
      this.insertChat(' ' + code + ' ');
      this.focus();
    }
  },

  init() {
    this.set('filteredCompletions', this.get('completions'));
    this._super();
  },

  didInsertElement() {
    this.set('$completionList', this.$('ul.completions'));
    this.set('$input', this.$('input'));

    console.log('input caret position 1: ', this.get('$input')[0].selectionStart);

    // this.set('input', this.get('$input')[0]);
    //
    // Ember.addObserver(this, 'input.selectionStart', () => {
    //   console.log('yay');
    //   let pos = this.get('input.selectionStart');
    //
    //   console.log('caret pos: ', pos);
    // });
  },

  didRender() {
    let filtered      = this.get('filteredCompletions');

    if (this.hasSavedCaretPosition()) {
      this.restoreCaretPosition();
    }

    if (filtered) {
      this.showCompletions();
    } else {
      this.hideCompletions();
    }
  },

  setHighlightIndex(index) {
    this.set('highlightIndex', index);
    this.notifyPropertyChange('highlightIndex');
  },

  matchesAnyCompletion(str) {
    return this.get('completions').indexOf(str.substr(1)) > -1;
  },

  sendChat(message) {
    this.sendAction('say', message);
    this.set('chatInput', '');
  },

  autocomplete() {
    let chatInput     = this.get('chatInput');
    let filter        = this.get('filter');
    let completion    = '@' + this.getHighlightedItem().text();
    // let completion    = this.getHighlightedItem().text();
    let caretPosition = this.getCaretPosition() + (completion.length - filter.length);
    let messageParts  = chatInput.split(' ');

    messageParts = messageParts.map((messagePart) => {
      return (messagePart === filter) ? completion : messagePart;
    });

    // console.log('completion: ', completion);

    // this.insertChat(completion);
    // this.replaceChat(filter, completion);

    this.saveCaretPosition(caretPosition);
    this.set('chatInput', messageParts.join(' '));
    this.hideCompletions();
  },

  insertChat(str) {
    let chatInput = this.get('chatInput');
    let caretPos  = this.getCaretPosition();
    let newStr    = chatInput.slice(0, caretPos) + str + chatInput.slice(caretPos);

    this.saveCaretPosition(caretPos + str.length);

    this.set('chatInput', newStr);
  },

  showCompletions() {
    this.$('.completions').addClass('active');
    this.setHighlightIndex(0);
    this.set('completionListVisible', true);
  },

  hideCompletions() {
    this.$('.completions').removeClass('active');
    this.set('filter', '');
    this.set('filteredCompletions', null);
    this.set('completionListVisible', false);
  },

  isValidCaretPosition(position) {
    return (position !== undefined && position <= this.get('chatInput').length && position >= 0);
  },

  getCaretPosition() {
    return this.get('$input')[0].selectionStart;
  },

  saveCaretPosition(position) {
    if (this.isValidCaretPosition(position)) {
      this.set('savedCaretPosition', position);
    }
  },

  hasSavedCaretPosition() {
    return this.get('savedCaretPosition');
  },

  restoreCaretPosition() {
    let position = this.get('savedCaretPosition');

    if (position !== null) {
      this.setCaret(position);
      this.set('savedCaretPosition', null);
    }
  },

  setCaret(pos) {
    this.get('$input')[0].setSelectionRange(pos, pos);
  },

  getHighlightedItem() {
    return this.get('$completionList').children('li').eq(this.get('highlightIndex'));
  },

  focus() {
    this.get('$input').focus();
  },

  keyDown(event) {
    let eventCode             = event.keyCode;
    let completionListVisible = this.get('completionListVisible');

    // console.log('eventCode: ', eventCode);

    // TODO: move inputMap elsewhere -- refactor into key input service?
    let inputMap = {
      9 : 'Tab',
      13: 'Enter',
      27: 'Escape',
      38: 'Up',
      40: 'Down'
    };

    let key     = inputMap[eventCode];
    let handler = this[`on${key}Pressed`];

    if (handler) {
      handler.bind(this)();

      if (completionListVisible) {
        event.preventDefault();
        return false;
      }
    }
  },

  onEscapePressed() {
    this.hideCompletions();
  },

  onEnterPressed() {
    let chatInput           = this.get('chatInput');
    let filteredCompletions = this.get('filteredCompletions');

    // if user selects autocompletion item
    if (filteredCompletions && chatInput) {
      this.autocomplete();
    } else if (chatInput) {
      this.sendChat(chatInput);
    }
  },

  onTabPressed() {
    let chatInput           = this.get('chatInput');
    let filteredCompletions = this.get('filteredCompletions');

    if (filteredCompletions && chatInput) {
      this.autocomplete();
    }
  },

  onUpPressed() {
    let index     = this.get('highlightIndex');
    let prevIndex = index - 1;
    index         = (prevIndex >= 0) ? prevIndex : 0;

    this.set('highlightIndex', index);
  },

  onDownPressed() {
    let index     = this.get('highlightIndex');
    let nextIndex = index + 1;
    let maxIndex  = this.get('completions').length - 1;
    index         = (nextIndex <= maxIndex) ? nextIndex : maxIndex;

    this.set('highlightIndex', index);
  }
});
