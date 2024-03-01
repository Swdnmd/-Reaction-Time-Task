// Assuming A, B, X, and Y are not part of the random letter pairs to avoid overlap with normal trials
const letters = "CDEFGHIJKLMNOPQRSTUVWXYZ".split('');

function getRandomLetter(exclude = []) {
  let possibleLetters = letters.filter(letter => !exclude.includes(letter));
  return possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
}

function weightedRandomSelect() {
  var weightedStimuli = [
    { weight: 70, stimuli: { combo: 'AX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'j' } },
    { weight: 10, stimuli: { combo: 'AY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">A</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } },
    { weight: 10, stimuli: { combo: 'BX', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">X</p>', correct_response: 'f' } },
    { weight: 10, stimuli: { combo: 'BY', cue_stimulus: '<p style="font-size:80px; font-family: Helvetica;">B</p>', probe_stimulus: '<p style="font-size:80px; font-family: Helvetica;">Y</p>', correct_response: 'f' } }
  ];
  var totalWeight = weightedStimuli.reduce((total, item) => total + item.weight, 0);
  var random = Math.random() * totalWeight;
  var weightSum = 0;

  for (var i = 0; i < weightedStimuli.length; i++) {
    weightSum += weightedStimuli[i].weight;
    if (random <= weightSum) {
      return weightedStimuli[i].stimuli;
    }
  }
}

// Function to create a random trial
function createRandomTrial() {
  let cue = getRandomLetter(['A', 'B', 'X', 'Y']);
  let probe = getRandomLetter(['A', 'B', 'X', 'Y']);
  return {
    combo: cue + probe,
    cue_stimulus: `<p style="font-size:80px; font-family: Helvetica;">${cue}</p>`,
    probe_stimulus: `<p style="font-size:80px; font-family: Helvetica;">${probe}</p>`,
    correct_response: 'f' // Assuming 'f' is the default correct response for random pairs
  };
}

// Parameters to control the number of each type of trial
const numNormalTrials = 1; // Total normal trials
const numRandomTrials = 5; // Total random trials

// Generate trials
let trials = [];
for (let i = 0; i < numNormalTrials; i++) {
  trials.push(weightedRandomSelect());
}
for (let i = 0; i < numRandomTrials; i++) {
  trials.push(createRandomTrial());
}

// Shuffle trials to mix them
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(trials);

// (Continuation from the shuffleArray function)
shuffleArray(trials);

/* Create jsPsych timeline */
var timeline = [];

/* Welcome and instructions */
timeline.push({
  type: "html-keyboard-response",
  stimulus: "Welcome to the experiment. Press any key to begin."
});

timeline.push({
  type: "html-keyboard-response",
  stimulus: "<p>In this experiment, a pair of letters will appear in the center of the screen, one after the other.</p><p>If you see the sequence <strong>A-X</strong>, press the letter J on the keyboard as fast as you can.</p><p>For any other letter sequence, press the letter F.</p><p>Press any key to begin.</p>",
  post_trial_gap: 2000
});

// Adding trials to the timeline
trials.forEach(trial => {
  // Fixation
  timeline.push({
    type: "html-keyboard-response",
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 300
  });

  // Cue letter
  timeline.push({
    type: "html-keyboard-response",
    stimulus: trial.cue_stimulus,
    choices: jsPsych.NO_KEYS,
    trial_duration: 300
  });

  // Delay (empty screen)
  timeline.push({
    type: "html-keyboard-response",
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 4900
  });

  // Probe letter and response window
  timeline.push({
    type: "html-keyboard-response",
    stimulus: trial.probe_stimulus,
    choices: ['f', 'j'],
    trial_duration: 300
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus: '',
    choices: ['f', 'j'],
    trial_duration: 1000,
    data: { correct_response: trial.correct_response },
    on_finish: function(data) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, trial.correct_response);
    }
  });

  // End trial message
  timeline.push({
    type: "html-keyboard-response",
    stimulus: function() {
      var lastTrialData = jsPsych.data.getLastTrialData().values()[0];
      if(lastTrialData.response === null) {
        return "Response too slow, please respond faster in the next trial.";
      } else {
        return "The response window is closed, the next trial will begin.";
      }
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 900
  });
});
