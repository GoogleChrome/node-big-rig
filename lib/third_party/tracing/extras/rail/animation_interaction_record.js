/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/statistics.js");
require("../chrome/chrome_process_helper.js");
require("./rail_interaction_record.js");

'use strict';

/**
 * @fileoverview The Animation phase of RAIL.
 */
global.tr.exportTo('tr.e.rail', function() {
  // The FPS comfort score is maximized at this value of average
  // frames-per-second.
  var MAX_COMFORT_FPS = 60;

  // The FPS comfort score is minimized at this value of average
  // frames-per-second.
  var MIN_COMFORT_FPS = 10;

  // The jank comfort score is maximized when frame timestamp discrepancy is
  // less than or equal to this:
  var MIN_DISCOMFORT_JANK = 0.05;

  // The jank comfort score is minimized when frame timestamp discrepancy is
  // greater than or equal to this:
  var MAX_DISCOMFORT_JANK = 0.3;

  function AnimationInteractionRecord(parentModel, start, duration) {
    tr.e.rail.RAILInteractionRecord.call(
        this, parentModel, 'Animation', 'rail_animate',
        start, duration);
    this.frameEvents_ = undefined;
  }

  AnimationInteractionRecord.prototype = {
    __proto__: tr.e.rail.RAILInteractionRecord.prototype,

    get frameEvents() {
      if (this.frameEvents_)
        return this.frameEvents_;

      this.frameEvents_ = new tr.model.EventSet();

      this.associatedEvents.forEach(function(event) {
        if (event.title === tr.e.audits.IMPL_RENDERING_STATS)
          this.frameEvents_.push(event);
      }, this);

      return this.frameEvents_;
    },

    get normalizedUserComfort() {
      // Combine jank comfort and fps comfort non-linearly.
      // weightedAverage2 weights lower scores exponentially more heavily than
      // higher scores.
      // http://goo.gl/W6MswA
      return tr.e.rail.weightedAverage2(
          this.normalizedJankComfort, this.normalizedFPSComfort);
    },

    get normalizedFPSComfort() {
      var durationSeconds = this.duration / 1000;
      var avgSpf = durationSeconds / this.frameEvents.length;
      var normalizedDiscomfort = tr.b.normalize(
          avgSpf, 1 / MAX_COMFORT_FPS, 1 / MIN_COMFORT_FPS);
      var normalizedComfort = 1 - normalizedDiscomfort;
      return tr.b.clamp(normalizedComfort, 0, 1);
    },

    get normalizedJankComfort() {
      var frameTimestamps = this.frameEvents.toArray().map(function(event) {
        return event.start;
      });
      var absolute = false;
      var discrepancy = tr.b.Statistics.timestampsDiscrepancy(
          frameTimestamps, absolute);
      var normalizedDiscomfort = tr.b.normalize(
          discrepancy, MIN_DISCOMFORT_JANK, MAX_DISCOMFORT_JANK);
      var normalizedComfort = 1 - normalizedDiscomfort;
      return tr.b.clamp(normalizedComfort, 0, 1);
    }
  };

  return {
    AnimationInteractionRecord: AnimationInteractionRecord
  };
});
