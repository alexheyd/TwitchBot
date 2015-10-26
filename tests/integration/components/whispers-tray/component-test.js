import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('whispers-tray', 'Integration | Component | whispers tray', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{whispers-tray}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#whispers-tray}}
      template block text
    {{/whispers-tray}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
