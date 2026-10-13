'use strict';

// Map-backed stand-in for KeyableBean, like tools/replay/standins/ReplayFixtureBean: only getFieldValue.

class FixtureBean {
  constructor(fields, label) {
    this.fields = { ...fields };
    this.label = label;
  }

  getFieldValue(name) {
    return Object.prototype.hasOwnProperty.call(this.fields, name) ? this.fields[name] : null;
  }

  // The compliance log line concatenates the bean; the mock shows the policy reference in that slot.
  toString() {
    return this.label;
  }
}

module.exports = { FixtureBean };
