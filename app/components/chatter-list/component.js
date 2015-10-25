import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['viewer-list'],

  twitch: Ember.inject.service(),

  updateViewerListInterval: 60000, // TODO: put in settings

  viewerCount: 0,

  searchTerm: '',

  viewerList: [],

  viewers: [],

  onSearchTermChanged: function () {
    let searchTerm = this.get('searchTerm');
    let viewers = this.get('viewerList');

    viewers = viewers.filter(viewer => {
      return (viewer.indexOf(searchTerm) > -1);
    });

    this.set('viewers', viewers);
  }.observes('searchTerm'),

  didInsertElement() {
    this.updateList();
  },

  updateList() {
    this.updateViewerList();
    Ember.run.later(this, this.updateList, this.get('updateViewerListInterval'));
  },

  updateViewerList() {
    this.get('twitch').getViewerList().then(response => {
      this.set('viewerCount', response.chatter_count);
      this.set('viewerList', response.chatters.viewers);
      this.set('viewers', response.chatters.viewers);
    });
  }
});
