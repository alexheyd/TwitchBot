import Ember from 'ember';

export default Ember.Component.extend({
  classNames    : ['chatter-list'],
  chatlist      : Ember.inject.service(),
  viewerCount   : Ember.computed.alias('chatlist.viewerCount'),
  viewerList    : Ember.computed.alias('chatlist.all'),
  viewers       : [],
  searchTerm    : '',
  chatlistActive: false,

  chatlistClass: Ember.computed('chatlistActive', function() {
    return this.get('chatlistActive') ? 'active' : '';
  }),

  onViewerListChanged: Ember.observer('viewerList', function () {
    this.set('viewers', this.get('viewerList'));
  }),

  onSearchTermChanged: Ember.observer('searchTerm', function () {
    let searchTerm = this.get('searchTerm');
    let viewers    = this.get('viewerList');

    viewers = viewers.filter(viewer => {
      return (viewer.indexOf(searchTerm) > -1);
    });

    this.set('viewers', viewers);
  }),

  actions: {
    toggleChatList() {
      this.toggleProperty('chatlistActive');
    }
  }
});
