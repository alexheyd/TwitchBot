import Ember from 'ember';

export default Ember.Service.extend({
  twitch       : Ember.inject.service(),
  timer        : null,
  timerInterval: 60000, // TODO: put chatter update interval in settings
  viewerCount  : 0,
  all          : null,
  mods         : null,
  chatters     : null,

  onChannelChange: Ember.observer('twitch.channel', function () {
    this.update();
  }),

  update() {
    let timer = Ember.run.later(this, this.update, this.get('timerInterval'));

    if (this.get('timer')) {
      Ember.run.cancel(this.get('timer'));
    }

    this.set('timer', timer);

    return this.fetchChatterList().then((response) => {
      if (response) {
        this.set('viewerCount', response.chatter_count);
        this.set('mods', response.chatters.moderators);
        this.set('chatters', response.chatters.viewers);
        this.set('all', response.chatters.viewers.concat(response.chatters.moderators));

        this.notifyPropertyChange('viewerCount');
        this.notifyPropertyChange('mods');
        this.notifyPropertyChange('chatters');
        this.notifyPropertyChange('all');
      }
    });
  },

  fetchChatterList() {
    let channel = this.get('twitch.channel').replace('#', '').toLowerCase();

    // TODO: store API urls elsewhere for fetchChatterList
    return this.get('twitch').api(`http://tmi.twitch.tv/group/user/${channel}/chatters`).then(response => {
      return response.data;
    });
  }
});
