export default {
  name: 'startup',
  initialize: function(container, app) {
    app.deferReadiness();
    let settings = container.lookup('service:settings');
    settings.load().then(app.advanceReadiness.bind(app));
  }
};
