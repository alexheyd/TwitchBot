import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['viewer-list'],

  twitch: Ember.inject.service(),

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
    setInterval(() => {
      this.updateViewerList();
    }, 60000);
  },

  updateViewerList() {
    this.get('twitch').getViewerList().then(response => {
      this.set('viewerCount', response.chatter_count);
      this.set('viewerList', response.chatters.viewers);
      this.set('viewers', response.chatters.viewers);
    });
  }
});
