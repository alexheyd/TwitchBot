import Ember from 'ember';

export default Ember.Component.extend({
  classNames               : ['viewer-list'],
  twitch                   : Ember.inject.service(),
  updateChatterListInterval: 60000, // TODO: put in settings
  viewerCount              : 0,
  searchTerm               : '',
  viewerList               : [],
  viewers                  : [],
  updateListTimer          : null,

  onChannelChange: Ember.observer('twitch.channel', function () {
    this.updateList();
  }),

  onSearchTermChanged: Ember.observer('searchTerm', function () {
    let searchTerm = this.get('searchTerm');
    let viewers    = this.get('viewerList');

    viewers = viewers.filter(viewer => {
      return (viewer.indexOf(searchTerm) > -1);
    });

    this.set('viewers', viewers);
  }),

  didInsertElement() {
    this.updateList();
  },

  updateList() {
    let timer = this.get('updateListTimer');

    if (timer) {
      Ember.run.cancel(timer);
    }

    this.updateChatterList();
    this.set('updateListTimer', Ember.run.later(this, this.updateList, this.get('updateChatterListInterval')));
  },

  updateChatterList() {
    this.get('twitch').getChatterList().then(response => {
      if (response) {
        console.log('chatter list: ', response);
        let allViewers = response.chatters.viewers.concat(response.chatters.moderators);

        this.set('viewerCount', response.chatter_count);
        this.set('viewerList', allViewers);
        this.set('viewers', allViewers);
      }
    });
  }
});
