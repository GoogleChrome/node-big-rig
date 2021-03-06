/**
Copyright (c) 2013 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../base/units/time_display_mode.js");
require("./event.js");
require("../base/guid.js");

'use strict';

/**
 * @fileoverview Provides the TimedEvent class.
 */
global.tr.exportTo('tr.model', function() {
  /**
   * A TimedEvent is the base type for any piece of data in the trace model with
   * a specific start and duration.
   *
   * @constructor
   */
  function TimedEvent(start) {
    tr.model.Event.call(this);
    this.start = start;
    this.duration = 0;
    this.cpuStart = undefined;
    this.cpuDuration = undefined;
  }

  TimedEvent.prototype = {
    __proto__: tr.model.Event.prototype,

    get end() {
      return this.start + this.duration;
    },

    addBoundsToRange: function(range) {
      range.addValue(this.start);
      range.addValue(this.end);
    },

    // bounds returns whether that TimedEvent happens within this timed event
    bounds: function(that, precisionUnit) {
      if (precisionUnit === undefined) {
        precisionUnit = tr.b.u.TimeDisplayModes.ms;
      }
      var startsBefore = precisionUnit.roundedLess(that.start, this.start);
      var endsAfter = precisionUnit.roundedLess(this.end, that.end);
      return !startsBefore && !endsAfter;
    }
  };

  return {
    TimedEvent: TimedEvent
  };
});
