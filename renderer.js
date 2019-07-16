// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const nodeConsole = require('console');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const FloofState = require('./FloofState');
const FloofWorker = require('./FloofWorker');
const ipc = require('electron').ipcRenderer;
window.$ = window.jQuery = require('jquery');
/** @var {module.FloofState} ActiveState */
let ActiveState;
let ActiveWorker;

function changedTwitchUsername(e) {
    let username = $("#twitch-username").val();
    ActiveState.set('twitch', username);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}

function changedSourceImage(e) {
    let inputValue = $("#image-source").val();
    ActiveState.set('sourceImage', inputValue);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}

function changedSourceText(e) {
    let inputValue = $("#text-source").val();
    ActiveState.set('sourceText', inputValue);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}

function changedRestImage(e) {
    let inputValue = $("#anim-resting").val();
    ActiveState.set('restImage', inputValue);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}
function changedActiveImage(e) {
    let inputValue = $("#anim-active").val();
    ActiveState.set('activeImage', inputValue);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}
function changedAnimationTime(e) {
    let inputValue = $("#anim-time").val();
    ActiveState.set('timeActive', parseInt(inputValue, 10));
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}

function changedSpeechTemplate(e) {
    let inputValue = $("#speech-bubble").val();
    ActiveState.set('speechTemplate', inputValue);
    ActiveState.save('./active.json');
    FloofWorker.setFloofState(ActiveState);
}

$(document).ready(function () {
    ActiveState = FloofState.load('./active.json');
    let el;

    el = $("#twitch-username");
    el.val(ActiveState.get('twitch'));
    el.on('change', changedTwitchUsername);

    el = $("#image-source");
    el.val(ActiveState.get('sourceImage'));
    el.on('change', changedSourceImage);

    el = $("#text-source");
    el.val(ActiveState.get('sourceText'));
    el.on('change', changedSourceText);

    el = $("#anim-resting");
    el.val(ActiveState.get('restImage'));
    el.on('change', changedRestImage);

    el = $("#anim-active");
    el.val(ActiveState.get('activeImage'));
    el.on('change', changedActiveImage);

    el = $("#anim-time");
    el.val(ActiveState.get('timeActive'));
    el.on('change', changedAnimationTime);

    el = $("#speech-bubble");
    el.val(ActiveState.get('speechTemplate'));
    el.on('change', changedSpeechTemplate);

    ActiveWorker = new FloofWorker(ActiveState);
    ActiveWorker.begin();
});
