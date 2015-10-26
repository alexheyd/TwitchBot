import Ember from 'ember';

export default Ember.Route.extend({
  twitch  : Ember.inject.service(),
  settings: Ember.inject.service(),

  actions: {
    // openModal(modal) {
    //     let modalName = (typeof modal === 'string') ? modal : 'dialog';
    //     let renderOptions = {
    //         into: 'application',
    //         outlet: 'modal'
    //     };
    //
    //     if (modalName === 'dialog') {
    //         renderOptions.model = modal;
    //     }
    //
    //     return this.render(modalName, renderOptions);
    // },
    //
    // closeModal() {
    //     return this.disconnectOutlet({
    //         outlet: 'modal',
    //         parentView: 'application'
    //     });
    // }
  },

  activate() {
    this.get('settings').load().then(this.connectToTwitch.bind(this), this.goToSettings.bind(this));
  },

  connectToTwitch() {
    this.get('twitch').connect();
  },

  // goToDashboard() {
  //   this.transitionTo('dashboard');
  // },

  goToSettings() {
    this.transitionTo('settings');
  }
});
