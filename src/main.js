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


      /**
       * Main entry point to loop through all stories and to process them.
       */
      var processStories = function processStories(node) {
        if (typeof node.querySelectorAll !== 'undefined') {

          var stories = node.querySelectorAll('header.preview');
          if (!stories.length) {
            return;
          }

          // Loop through every story.
          Array.prototype.forEach.call(stories, function (story) {
            highlightWorkflowStates(story);
            highlightImportantTags(story);
            detectMergeDeployTags(story);
            detectTimeIssues(story);
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
        var storyAccepted = story.parentElement.classList.contains('accepted');
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
       * Finds stories where logged time higher than estimate.
       */
      function detectTimeIssues(story) {
        var estimation = story.querySelector('.meta');
        var spentTime = story.querySelector('.everhour-stat');
        if (estimation !== null && spentTime !== null) {
          var pts = estimation.textContent;
          if (pts >= 0) {
            var time = spentTime.textContent.split(' ');
            var minutes = 0;
            var hours = 0;

            // If time has only 1 param, means that it has only minutes.
            // Otherwise - hours and minutes.
            if (time.length == 1) {
              minutes = parseInt(time[0]);
            }
            else {
              hours = parseInt(time[0]);
              minutes = parseInt(time[1]);
            }

            // Care only about huge overruns.
            var estimated = pts * 6 * 60 + 60;
            var current = hours * 60 + minutes;
            if (estimated < current) {
              if (story.querySelector('.time-overrun') === null) {
                story.insertAdjacentHTML('beforeend', '<span class="time-overrun">overrun</span>');
              }
            }
          }
        }
      }


      /**
       * Checks for merging / deployment workflow.
       */
      function detectMergeDeployTags(story) {
        // We care about merging only when story is accepted.
        var storyAccepted = story.querySelector('.state.button') === null;
        var storyHasBody = story.querySelector('.name') !== null;
        if (!storyAccepted || !storyHasBody) {
          return;
        }

        // Make sure that the story has the right section and we haven't
        // already processed it.
        var bodySection = story.querySelector('.name');
        var hasMissingTags = bodySection.querySelector('.missing-tags') !== null;
        if (hasMissingTags) {
          return;
        }

        var hasBranch = false;
        var hasToMergeTag = false;
        var hasMergedTag = false;
        var hasToDeployTag = false;
        var hasDeployedTag = false;

        // Loop through all labels of this story.
        var labels = story.querySelectorAll('a.label');
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
          bodySection.insertAdjacentHTML('beforeend', '<a class="std label ss missing-tags">notice: missing ' + warnings.join(', ') + ' tags</a>');
        }
      }
    }
  }, 10);
});
