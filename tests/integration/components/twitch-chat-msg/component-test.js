import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('twitch-chat-msg', 'Integration | Component | twitch chat msg', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{twitch-chat-msg}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#twitch-chat-msg}}
      template block text
    {{/twitch-chat-msg}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
