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
        if (typeof node.querySelectorAll == 'undefined') {
          return;
        }

        // Loop through every collapsed story.
        var collapsedStories = node.querySelectorAll('header.preview');
        if (collapsedStories.length) {
          Array.prototype.forEach.call(collapsedStories, function (story) {
            var storySelector = story.parentNode;
            highlightPlannerTags(storySelector);
            highlightImportantTags(storySelector);
            highlightGoalsTags(storySelector);
          });
        }

        // Inject a button to add SystemSeed template for every story.
        injectTemplateButton(node);
      };


      /**
       * Highlights tags which contain workflow states.
       */
      function highlightPlannerTags(story) {
        var labels = story.querySelectorAll('a.label');
        Array.prototype.forEach.call(labels, function(label) {
          if (label.textContent.match(/\b(?:planner|needs-estimate)\b/)) {
            label.classList.add('ss', 'blue');
          }
        });
      }


      /**
       * Highlights tags which contain important labels.
       * High/urgent priorities, blockers, etc.
       */
      function highlightImportantTags(story) {

        // We care about important tags as long as it is not accepted.
        var storyAccepted = story.classList.contains('accepted');
        if (!storyAccepted) {
          var labels = story.querySelectorAll('a.label');
          Array.prototype.forEach.call(labels, function(label) {
            if (label.textContent.match(/\b(?:blocked|needs|needs-|urgent\b/)) {
              label.classList.add('ss', 'red');
            }
          });
        }
      }
      
            /**
       * Highlights tags which contain goal-based labels.
       * productivity, analytics, etc.
       */
      function highlightGoalTags(story) {

        // We care about important tags as long as it is not accepted.
        var storyAccepted = story.classList.contains('accepted');
        if (!storyAccepted) {
          var labels = story.querySelectorAll('a.label');
          Array.prototype.forEach.call(labels, function(label) {
            if (label.textContent.match(/\b(goal-b/)) {
              label.classList.add('ss', 'gray');
            }


      }
    }
  }, 10);
});
