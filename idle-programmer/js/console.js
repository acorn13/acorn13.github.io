$('.js-console-input').on('keydown', event => {
    if (event.which === 13) {
        var command = $('.js-console-input').val();
        $('.js-console-input').val('');
        runCommand(command, false);
    }
});

var commandHistory = [];
var mostRecentUserCommand = null;
function runCommand(command, fromSystem = false) {
    command = command.trim();
    if (!command) return;
    var commandEntry = {command};
    commandHistory.push(commandEntry);
    if (!fromSystem) {
        mostRecentUserCommand = commandEntry;
    }
    processCommand(commandEntry, fromSystem);
    renderHistory();
}
function processCommand(commandEntry, fromSystem) {
    // Only run the user's most recent command.
    if (!fromSystem && commandEntry !== mostRecentUserCommand) return;
    var steps = fromSystem ? 1000 : 10;
    try {
        if (!commandEntry.program) {
            commandEntry.program = parseProgram(commandEntry.command);
            commandEntry.scope = makeRootScope();
        }
        if (commandEntry.result && commandEntry.result instanceof ProcessNode) {
            commandEntry.result = runProgramSteps(commandEntry.result, steps, fromSystem);
        } else {
            commandEntry.result = runProgram(commandEntry.program, commandEntry.scope, steps, fromSystem);
        }
        if (commandEntry.result instanceof ProcessNode) {
            setTimeout(() => processCommand(commandEntry, fromSystem), 100);
        } else {
            if (!fromSystem) renderHistory();
        }
    } catch (e) {
        console.log(e);
        logError(e);
    }
}
function logInfo(info) {
    commandHistory.push({info});
    renderHistory();
}
logInfo._mjsCallable = true;
function logError(error) {
    commandHistory.push({error});
    renderHistory();
}
function renderHistory() {
    commandHistory = commandHistory.slice(Math.max(0, commandHistory.length - 100), commandHistory.length);
    $('.js-console-log').html(commandHistory.map(node => {
         if (node.hasOwnProperty('info')) {
            return `<div style="color: yellow;">${node.info}</div>`;
         }
         if (node.error) {
            return `<div style="color: red;">${node.error}</div>`;
         }
         var result = `<div>&gt; ${node.command}</div>`;
         if (typeof(node.result) !== 'undefined' && !(node.result instanceof ProcessNode)) result += `<div>${node.result}</div>`;
         return result;
     }).join(''));
    $('.js-console-log')[0].scrollTo(0, $('.js-console-log')[0].scrollHeight);
}

