import Ember from 'ember';

export default Ember.Component.extend({
  classNames         : ['input-autocomplete'],
  twitch             : Ember.inject.service(),
  chatInput          : '',
  filteredCompletions: null,
  highlightIndex     : null,

  // TODO: figure out more Emberish way of highlighting completions
  onHighlightIndexChanged: Ember.observer('highlightIndex', function () {
    let $items = this.$('.completions li');
    let index  = this.get('highlightIndex');

    console.log('$items: ', $items);
    console.log('highlight index changed: ', index);

    $items.removeClass('highlighted');

    if (index !== null) {
      console.log('highlighted item: ', $items.eq(index));
      $items.eq(index).addClass('highlighted');
    }
  }),

  chatInputChanged: Ember.observer('chatInput', function () {
    let chatInput = this.get('chatInput');
    let messageParts = chatInput.split(' ');

    messageParts.forEach((messagePart) => {
      if (messagePart.indexOf('@') === 0) {
        this.filterCompletions(messagePart);
      } else {
        this.hideCompletions();
      }
    });
  }),

  actions: {
    say() {
      let chatInput = this.get('chatInput');
      let filteredCompletions = this.get('filteredCompletions');

      if (filteredCompletions) {
        let completion = this.$('.completions li').eq(this.get('highlightIndex')).text();
        let atIndex = chatInput.indexOf('@');
        let slice = chatInput.slice(0, atIndex + 1);

        this.set('chatInput', slice + completion + ' ');

        // TODO: fix hiding completions after autocompleting
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

  didRender() {
    let filtered = this.get('filteredCompletions');

    console.log('filtered: ', filtered);

    if (filtered) {
      this.$('.completions').addClass('active');
      this.set('highlightIndex', 0);
    }
  },

  filterCompletions(strFilter) {
    strFilter       = strFilter.replace('@', '');
    let completions = this.get('completions');

    completions = completions.filter(completion => {
      return (completion.indexOf(strFilter) > -1);
    });

    this.set('filteredCompletions', completions);
  },

  hideCompletions() {
    this.set('filterCompletions', null);
  },

  keyUp(event) {
    console.log('KEYUP_EVENT: ', event);
    let eventCode = event.keyCode;
    let index     = this.get('highlightIndex');
    let prevIndex = index - 1;
    let nextIndex = index + 1;
    let maxIndex  = this.get('completions').length - 1;

    console.log('eventCode: ', eventCode);

    if (eventCode === 38 || eventCode === 40) {

      console.log('ARROW_KEY');

      // up arrow
      if (eventCode === 38) {
        index = (prevIndex >= 0) ? prevIndex : 0;
      } else if (eventCode === 40) {
        index = (nextIndex <= maxIndex) ? nextIndex : maxIndex;
      }

      this.set('highlightIndex', index);
    }
  }
});
