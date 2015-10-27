import Ember from 'ember';

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

    if (!chatInput) {
      this.hideCompletions();
    } else {
      let messageParts = chatInput.split(' ');
      let triggerFound = false;

      messageParts.forEach((messagePart) => {
        if (messagePart && messagePart.indexOf('@') === 0 && !this.matchesAnyCompletion(messagePart)) {
          this.set('filter', messagePart);
          triggerFound = true;
        }
      });

      if (!triggerFound) {
        this.hideCompletions();
      }
    }
  }),

  init() {
    this.set('filteredCompletions', this.get('completions'));
    this._super();
  },

  didInsertElement() {
    this.set('$completionList', this.$('ul.completions'));
    this.set('$input', this.$('input'));
  },

  didRender() {
    let filtered = this.get('filteredCompletions');

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
    let caretPosition = this.getCaretPosition() + (completion.length - filter.length);
    let messageParts  = chatInput.split(' ');

    messageParts = messageParts.map((messagePart) => {
      return (messagePart === filter) ? completion : messagePart;
    });

    this.saveCaretPosition(caretPosition);
    this.set('chatInput', messageParts.join(' '));
    this.hideCompletions();
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
      this.get('$input')[0].setSelectionRange(position, position);
      this.set('savedCaretPosition', null);
    }
  },

  getHighlightedItem() {
    return this.get('$completionList').children('li').eq(this.get('highlightIndex'));
  },

  keyDown(event) {
    let eventCode             = event.keyCode;
    let completionListVisible = this.get('completionListVisible');

    // TODO: move inputMap elsewhere -- refactor into key input service?
    let inputMap = {
      13: 'Enter',
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

  onEnterPressed() {
    let chatInput           = this.get('chatInput');
    let filteredCompletions = this.get('filteredCompletions');

    // if user selects autocompletion item
    if (filteredCompletions) {
      this.autocomplete();
    } else if (chatInput) {
      this.sendChat(chatInput);
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
