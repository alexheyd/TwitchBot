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
        if (messagePart && messagePart.indexOf('@') === 0 && this.get('completions').indexOf(messagePart.substr(1)) === -1) {
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
    say() {
      let chatInput           = this.get('chatInput');
      let filteredCompletions = this.get('filteredCompletions');

      // TODO: implement text replacement via paste to maintain cursor position
      // if user selects autocompletion item
      if (filteredCompletions) {
        let filter        = this.get('filter');
        let filteredName  = filter.substr(1);
        let completion    = this.$('.completions li').eq(this.get('highlightIndex')).text();
        let caretPosition = this.getCaretPosition() + (completion.length - filteredName.length);

        this.saveCaretPosition(caretPosition);

        if (filteredName) {
          this.set('chatInput', chatInput.replace(filteredName, completion));
        } else {
          this.set('chatInput', chatInput.replace(filter, filter + completion));
        }

        this.hideCompletions();
      } else {
        if (chatInput) {
          this.sendAction('say', chatInput);
          this.set('chatInput', '');
        }
      }
    }
  },

  init() {
    this.set('filteredCompletions', this.get('completions'));
    this._super();
  },

  didInsertElement() {
    this.set('$completionList', this.$('ul.completions'));
    this.set('$input', this.$('input'));
  },

  setHighlightIndex(index) {
    this.set('highlightIndex', index);
    this.notifyPropertyChange('highlightIndex');
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

  keyDown(event) {
    let eventCode             = event.keyCode;
    let index                 = this.get('highlightIndex');
    let prevIndex             = index - 1;
    let nextIndex             = index + 1;
    let maxIndex              = this.get('completions').length - 1;
    let completionListVisible = this.get('completionListVisible');

    if (eventCode === 38 || eventCode === 40) {
      if (completionListVisible) {
        event.preventDefault();
      }

      // up arrow
      if (eventCode === 38) {
        index = (prevIndex >= 0) ? prevIndex : 0;
      // down arrow
      } else if (eventCode === 40) {
        index = (nextIndex <= maxIndex) ? nextIndex : maxIndex;
      }

      this.set('highlightIndex', index);

      if (completionListVisible) {
        return false;
      }
    }
  }
});
