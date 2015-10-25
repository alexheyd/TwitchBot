import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('subscriber-monitor', 'Integration | Component | subscriber monitor', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{subscriber-monitor}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#subscriber-monitor}}
      template block text
    {{/subscriber-monitor}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
