import Ember from 'ember';

export default Ember.Service.extend({
  twitch           : Ember.inject.service(),
  timer            : null,
  interval         : 60000, // TODO: move follower update interval into settings
  lastUpdate       : null,
  count            : 0,
  newCount         : 0,
  lastKnownFollower: null,
  latest           : [],

  update() {
    let timer = this.get('timer');

    if (timer) {
      Ember.run.cancel(timer);
    }

    this.updateFollowerData();
    this.set('timer', Ember.run.later(this, this.update, this.get('interval')));
  },

  updateFollowerData() {
    let timestamp = moment().format('h:mm:ss a');

    this.set('lastUpdate', timestamp);

    return this.getFollowers().then(response => {
      let follows = response.follows;

      this.set('count', response._total);

      // save point of reference (last follower on session start)
      if (!this.get('lastKnownFollower')) {
        this.set('lastKnownFollower', follows[0]);
      } else {
        this.addNewFollowers(follows);
      }
    });
  },

  addNewFollowers(follows) {
    this.set('newCount', 0);

    let lastKnownFollower = this.get('lastKnownFollower').user.display_name;

    // add every follower until we find the lastKnownFollower
    follows.some(follow => {
      let name = follow.user.display_name;

      if (name !== lastKnownFollower) {
        this.get('latest').unshiftObject(follow);
        this.incrementProperty('newCount');
      } else {
        return true;
      }
    });

    // update lastKnownFollower
    this.set('lastKnownFollower', follows[0]);
  },

  getFollowers() {
    let streamerName = this.get('twitch.streamerName').toLowerCase();

    // TODO: store API urls elsewhere for getFollowers
    return this.get('twitch').api(`https://api.twitch.tv/kraken/channels/${streamerName}/follows/?limit=100`).then(response => {
      console.log('getFollowers() response: ', response);
      return response;
    });
  }
});
