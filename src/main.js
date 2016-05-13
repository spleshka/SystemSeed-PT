chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(handleMutationEvents);
      });

      // Configuration of the observer.
      var config = {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
      };

      /**
       * Add observer handler.
       */
      observer.observe(document, config);
      var handleMutationEvents = function handleMutationEvents(mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, processStories);
        processStories(mutation.target);
      };


      var processStories = function processStories(node) {
        if (node.querySelectorAll !== 'undefined') {

          var stories = node.querySelectorAll('header.preview');
          if (!stories.length) {
            return;
          }

          // Loop through every story.
          Array.prototype.forEach.call(stories, function (story) {
            if (!story.classList.contains('ss-processed')) {
              highlightWorkflowStates(story);
              highlightImportantTags(story);
              detectMergeDeployTags(story);
            }
            story.classList.add('ss-processed');
          });
        }
      };

      /**
       * Highlights tags which contain workflow states.
       */
      function highlightWorkflowStates(story) {
        var labels = story.querySelectorAll('a.label');
        Array.prototype.forEach.call(labels, function(label) {
          if (label.textContent.match(/\b(?:on hold|questions|awaiting|^to)\b/)) {
            label.classList.add('ss', 'workflow-state');
          }
        });
      }

      /**
       * Highlights tags which contain important labels.
       * High/urgent priorities, blockers, etc.
       */
      function highlightImportantTags(story) {

        // We care about important tags as long as it is not accepted.
        var storyAccepted = story.querySelector('.state.button') === null;
        if (!storyAccepted) {
          var labels = story.querySelectorAll('a.label');
          Array.prototype.forEach.call(labels, function(label) {
            if (label.textContent.match(/\b(?:blocked|blocker|high priority|urgent priority)\b/)) {
              label.classList.add('ss', 'important');
            }
          });
        }
      }


      /**
       * Checks for merging / deployment workflow.
       */
      function detectMergeDeployTags(story) {
        // We care about merging only when story is accepted.
        var storyAccepted = story.querySelector('.state.button') === null;
        if (storyAccepted) {

          var labels = story.querySelectorAll('a.label');
          var hasBranch = false;
          var hasToMergeTag = false;
          var hasMergedTag = false;
          var hasToDeployTag = false;
          var hasDeployedTag = false;

          Array.prototype.forEach.call(labels, function (label) {

            // Check if the label is in format "b:branchname".
            var regexp = new RegExp('^b:', 'i');
            if (label.textContent.match(regexp)) {
              hasBranch = true;
            }

            // Check if the label is "to merge".
            regexp = new RegExp('^(to merge)', 'i');
            if (label.textContent.match(regexp)) {
              hasToMergeTag = true;
            }

            // Check if the label is "merged".
            regexp = new RegExp('^(merged)', 'i');
            if (label.textContent.match(regexp)) {
              hasMergedTag = true;
            }

            // Check if the label is "to deploy".
            regexp = new RegExp('^(to deploy)', 'i');
            if (label.textContent.match(regexp)) {
              hasToDeployTag = true;
            }

            // Check if the label is "deployed".
            regexp = new RegExp('^(deployed)', 'i');
            if (label.textContent.match(regexp)) {
              hasDeployedTag = true;
            }
          });

          var warnings = [];

          if (hasBranch) {
            if (!hasToMergeTag && !hasMergedTag) {
              warnings.push('merge');
            }

            if (!hasToDeployTag && !hasDeployedTag) {
              warnings.push('deploy');
            }
          }

          if (warnings.length) {
            var inner = story.querySelector('.name');
            inner.insertAdjacentHTML('beforeend', '<a class="std label ss missing-tags">notice: missing ' + warnings.join(', ') + ' tags</a>');
          }
        }
      }
    }
  }, 10);
});
