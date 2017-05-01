function injectTemplateButton(node) {
  var storyControls = node.querySelectorAll('section.controls');
  if (!storyControls.length) {
    return;
  }

  Array.prototype.forEach.call(storyControls, function(storyControl) {

    if (storyControl.querySelectorAll('.story_template').length) {
      return;
    }

    storyControl.style.width = '332px';

    var templateBtn = document.createElement('button');
    templateBtn.className = 'left_endcap hoverable story_template';
    templateBtn.title = 'Apply description template to this story';
    templateBtn.innerHTML = '<img src="//i.imgur.com/qvQ83UA.png">';
    templateBtn.querySelector('img').style.marginLeft = '-2px';
    templateBtn.querySelector('img').style.marginTop = '1px';
    templateBtn.addEventListener('click', generateStory, true);

    var cloneStoryBtn = storyControl.querySelector('.clone_story');
    cloneStoryBtn.className += ' capped';
    cloneStoryBtn.insertAdjacentElement('beforebegin', templateBtn);
  });
}


function generateTasks(e) {

  var tasks = [
    '**===== CHECKLIST FOR ACCEPTANCE =====**',
    '- TDB',
    '**===== TESTING STEPS =====**',
    '- **Test 1:** TBD'
  ];

  $('.tasks textarea').focus(function() {
    if ($(this).is(':focus')) {
      setTimeout(function() {
        $('.tasks button').trigger('click');
      }, 0);
    }
  });

  var initialTasksCount = $('div[data-aid="TaskShow"]').length;
  var taskIndex = 0;

  var interval = setInterval(function() {

    var currentTasksCount = $('div[data-aid="TaskShow"]').length;

    if (initialTasksCount + taskIndex == currentTasksCount) {
      var $taskTextarea = $('.tasks textarea');

      var task = tasks[taskIndex];
      $taskTextarea.val(task).focus();

      if (taskIndex < tasks.length - 1) {
        taskIndex++;
      }
      else {
        clearInterval(interval);
        $taskTextarea.unbind('focus');
      }
    }

  }, 100);

}

function createFeatureTemplate() {
  return (function() {/*# Problem / Motivation
   Try to make the business goal of the story as clear as possible.
   # Acceptance Criteria
   - Criteria 1
   - Criteria 2
   */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
}

function createBugTemplate() {
  var context    = '### Context\n---\n\n*Include background details for this story here*\n\n',
    htr        = '### How To Replicate\n---\n\n1. *Start your replication process here*\n\n',
    outcomes   = '**Present outcome**\n\n**Expected outcome**\n\n',
    impDetails = '### Implementation Details\n---\n\n*Include technical details or considerations here*\n\n';

  return context + htr + outcomes + impDetails;
}

function createChoreTemplate() {
  var context    = '### Context\n---\n\n*Include background details for this story here*\n\n',
    questions    = '### Questions\n---\n\n*Add questions here*\n\n',
    impDetails = '### Implementation Details\n---\n\n*Include technical details or considerations here*\n\n';

  return context + questions + impDetails;
}

function createReleaseTemplate() {
  // Currently, we have no need for a description
  // tempalate on release stories
  return "";
}

function generateStory(e) {
  var nextSection = $('.story_template').parents('.model_details').eq(0).next().next(),
    textArea = nextSection.find('.editor.tracker_markup.description'),
    existingData = textArea.val(),
    ev = new jQuery.Event('keyup'), // jshint ignore:line
    markdown;

  ev.which = 13;
  ev.keyCode = 13;

  switch ($('input[name="story[story_type]"]').val()) {
    case 'feature':
      markdown = createFeatureTemplate();
      break;
    case 'bug':
      markdown = createBugTemplate();
      break;
    case 'chore':
      markdown = createChoreTemplate();
      break;
    case 'release':
      markdown = createReleaseTemplate();
      break;
    default:
      markdown = createFeatureTemplate();
  }

  origContent = '\n\n### Original Content\n---\n\n' + existingData,

    nextSection.find('.rendered_description').trigger('click');
  if (textArea.val()) {
    if (textArea.val() === markdown) {
      alert('The description for this story already matches the current template.');
    } else if (confirm('Existing description content will be placed at the bottom. Would you like to continue?')) {
      textArea.val(markdown + origContent);
    }
  } else {
    textArea.val(markdown);
  }

  nextSection.find('button[id^="story_description_done_"]').trigger('click');

  generateTasks();

  e.preventDefault();
}
