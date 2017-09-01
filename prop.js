const STATIC_IP = 'localhost';
const PORT = '8080';
const WS_ADDRESS = 'ws://' + STATIC_IP + ':' + PORT + '/prop';
const SPEECH_RATE_MULTIPLIER = 1.15;
const LANG = 'en';
const BREAK = '<br>';

synth = window.speechSynthesis;

// Get all the voices available to this browser (but NB this probably works
// best in Chrome)
function getBrowserVoices() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  voices = speechSynthesis.getVoices();

  // Define each option in the dropdown menu for voices
  voices.forEach(function (voice) {

    // Skip languages we don't want
    if (voice.lang.indexOf(LANG) === -1) {
      return;
    }

    dropdownItem = document.createElement('option');
    dropdownItem.textContent = voice.name;

    dropdownItem.setAttribute('name', voice.name);
    document.getElementById('dropdown').appendChild(dropdownItem);
  });
}

getBrowserVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = getBrowserVoices;
}

// Establish a websocket connection with the proposer's server
function newWS() {
  ws = new WebSocket(WS_ADDRESS);

  ws.onopen = function(evt) {
    console.log('Connected to websocket.');
  }

  ws.onmessage = function(evt) {

    // Get and log the message from the proposer
    var prompt = evt.data;
    transcript.innerHTML += prompt + BREAK;
    console.log('msg: ' + prompt);


    var msg = new SpeechSynthesisUtterance();
    msg.text = prompt;

    // Set the voice and rate of speech
    speaker = document.getElementById("dropdown").value;
    console.log('speaker: ' + speaker);
    voices.forEach(function (voice) {
      if(voice.name === document.getElementById("dropdown").value) {
        msg.voice = voice;
        msg.rate = SPEECH_RATE_MULTIPLIER;
      }
    });

    msg.onend = function(e) {
      console.log('done speaking');
    };

    // Hack to make sure Chrome speaks every message
    setTimeout(
      function(){
        synth.speak(msg);
      }, 1);
  }
}
newWS();