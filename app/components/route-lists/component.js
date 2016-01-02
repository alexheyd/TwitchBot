import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['lists'],
  lists: [],
  newListName: '',

  actions: {
    createList() {
      let newName = this.get('newListName');

      if (newName && typeof newName === 'string' && !this.hasList(newName)) {
        this.addList({
          name: newName
        });

        this.set('newListName', '');
      }
    }
  },

  hasList(name) {
    let list = this.get('lists').findBy('name', name);
    return !!list;
  },

  addList(list) {
    if (list && typeof list === 'object') {
      this.get('lists').pushObject(list);
    }
  }
});
