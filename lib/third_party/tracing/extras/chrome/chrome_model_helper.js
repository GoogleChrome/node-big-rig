/**
Copyright (c) 2014 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/base.js");
require("../../base/iteration_helpers.js");
require("./chrome_browser_helper.js");
require("./chrome_gpu_helper.js");
require("./chrome_renderer_helper.js");

'use strict';

/**
 * @fileoverview Utilities for accessing trace data about the Chrome browser.
 */
global.tr.exportTo('tr.e.audits', function() {
  function findChromeBrowserProcess(model) {
    var browserProcesses = [];
    model.getAllProcesses().forEach(function(process) {
      if (!tr.e.audits.ChromeBrowserHelper.isBrowserProcess(process))
        return;
      browserProcesses.push(process);
    }, this);
    if (browserProcesses.length === 0)
      return undefined;
    if (browserProcesses.length > 1)
      return undefined;
    return browserProcesses[0];
  }

  function findChromeRenderProcesses(model) {
    var rendererProcesses = [];
    model.getAllProcesses().forEach(function(process) {
      if (!tr.e.audits.ChromeRendererHelper.isRenderProcess(process))
        return;
      rendererProcesses.push(process);
    });
    return rendererProcesses;
  }

  function findChromeGpuProcess(model) {
    var gpuProcesses = model.getAllProcesses().filter(
      tr.e.audits.ChromeGpuHelper.isGpuProcess);
    if (gpuProcesses.length != 1)
      return undefined;
    return gpuProcesses[0];
  }

  /**
   * @constructor
   */
  function ChromeModelHelper(model) {
    this.model_ = model;

    // Find browserHelper.
    this.browserProcess_ = findChromeBrowserProcess(model);
    if (this.browserProcess_) {
      this.browserHelper_ = new tr.e.audits.ChromeBrowserHelper(
          this, this.browserProcess_);
    } else {
      this.browserHelper_ = undefined;
    }

    // Find gpuHelper.
    var gpuProcess = findChromeGpuProcess(model);
    if (gpuProcess) {
      this.gpuHelper_ = new tr.e.audits.ChromeGpuHelper(
          this, gpuProcess);
    } else {
      this.gpuHelper_ = undefined;
    }

    // Find rendererHelpers.
    var rendererProcesses_ = findChromeRenderProcesses(model);

    this.rendererHelpers_ = {};
    rendererProcesses_.forEach(function(renderProcess) {
      var rendererHelper = new tr.e.audits.ChromeRendererHelper(
        this, renderProcess);
      this.rendererHelpers_[rendererHelper.pid] = rendererHelper;
    }, this);
  }

  ChromeModelHelper.supportsModel = function(model) {
    if (findChromeBrowserProcess(model) !== undefined)
      return true;
    if (findChromeRenderProcesses(model).length)
      return true;
    return false;
  }

  ChromeModelHelper.prototype = {
    get pid() {
      throw new Error('woah');
    },

    get process() {
      throw new Error('woah');
    },

    get model() {
      return this.model_;
    },

    get browserProcess() {
      return this.browserProcess_;
    },

    get browserHelper() {
      return this.browserHelper_;
    },

    get gpuHelper() {
      return this.gpuHelper_;
    },

    get rendererHelpers() {
      return this.rendererHelpers_;
    }
  };

  return {
    ChromeModelHelper: ChromeModelHelper
  };
});
