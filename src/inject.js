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

/*function generateTasks(e) {

  var tasks = [
    'HTD confirmed locally',
    'Cross-browser testing passes',
    'Automated tests pass',
    'HTD confirmed on staging',
  ];

  for (task of tasks) {
    $('.edit .TaskEdit textarea').val(task);
    $('.edit .TaskEdit button.addTaskButton').trigger('click');
  }

}*/

function createFeatureTemplate() {
  return (function() {/*# Problem / Motivation
   Including a detailed problem statement as part of your user stories has several benefits:
   - They ensure that the business requirements are understood.
   - They provide detail to the development team to enable them to think through the work that may need to be done.
   # Acceptance Criteria
   Including acceptance criteria as part of your user stories has several benefits:
   - They get the team to think through how a feature or piece of functionality will work from the user’s perspective.
   - They remove ambiguity from requirements.
   - They form the tests that will confirm that a feature or piece of functionality is working and complete.
   # Proposed Solution / Technical Concept
   Providing a high level technical concept as part of your user stories has several benefits:
   - They get the team to think through how a feature or piece of functionality may be implemented at a technical level.
   - They ensure that any developer that picks up the story has a good starting point.
   - They provide relevant pointers, references, code snippets and promote knowledge transfer throughout the team.
   ---------------
   ### Sniff Test
   Is this story well defined?
   - **Independent** - Can the story stand alone by itself ?
   - **Negotiable** - Can this story be changed or removed without impact to everything else?
   - **Valuable** - Does this story have value to the end user?
   - **Estimable** - Can you estimate the size of the story?
   - **Small** -Is it small enough?
   - **Testable** - Can this story be tested and verified?
   Is this story ready to be worked on?
   - **[ ? ]** problem statement
   - **[ ? ]** acceptance criteria
   - **[ ? ]** technical concept
   - **[ ? ]** tags / labels
   - **[ ? ]** task list
   - **[ ? ]** estimate
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

  e.preventDefault();
}
