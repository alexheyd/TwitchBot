import Ember from 'ember';

export default Ember.Mixin.create(
    Ember.TargetActionSupport, {

    keyDown(event) {
      let eventCode             = event.keyCode;
      let completionListVisible = this.get('completionListVisible');

      console.log('eventCode: ', eventCode);

      // TODO: move inputMap elsewhere -- refactor into key input service?
      let inputMap = {
        9 : 'Tab',
        13: 'Enter',
        27: 'Esc',
        38: 'Up',
        40: 'Down',

        8: 'Backspace',
        9: 'Tab',
        13: 'Enter',
        16: 'Shift',
        17: 'Ctrl',
        18: 'Alt',
        19: 'PauseBreak',
        20: 'CapsLock',
        27: 'Esc',
        32: 'SpaceKey',
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        37: 'Left',
        38: 'Up',
        39: 'Right',
        40: 'Down',
        45: 'InsertKey',
        46: 'DeleteKey',
        91: 'CommandKey',
        93: 'RightClick',
        // 106: 'numpad *',
        // 107: 'numpad +',
        // 109: 'numpad -',
        // 110: 'numpad .',
        // 111: 'numpad /',
        144: 'NumLock',
        145: 'ScrollLock',
        // 186: ';',
        // 187: '=',
        // 188: ',',
        // 189: '-',
        // 190: '.',
        // 191: '/',
        // 192: '`',
        // 219: '[',
        // 220: '\\',
        // 221: ']',
        // 222: "'",
      };

      let key     = inputMap[eventCode];
      let handler = this[`on${key}`];

      if (handler) {
        handler.bind(this)();
      }
    }
});
