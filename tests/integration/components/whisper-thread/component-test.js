import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('whisper-thread', 'Integration | Component | whisper thread', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{whisper-thread}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#whisper-thread}}
      template block text
    {{/whisper-thread}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
