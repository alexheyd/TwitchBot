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

    viewers = viewers.filter(function (viewer) {
      return (viewer.indexOf(searchTerm) > -1);
    });

    this.set('viewers', viewers);
  }.observes('searchTerm'),

  didInsertElement() {
    this.get('twitch').getViewerList().then(function (response) {
      console.log('viewer list response: ', response);
      this.set('viewerCount', response.chatter_count);

      // response.chatters.viewers = ['dcryptzero', 'devourssugar', 'keezy', 'meatlon', 'shortdude', 'hustlas'];

      this.set('viewerList', response.chatters.viewers);
      this.set('viewers', response.chatters.viewers);
    }.bind(this));
  }
});
