// The html for a blank program line
var instRow = "<tr><td class='linenumcell'>" +
        "</td><td class='instructioncell' " +
        "ondrop='dropInstruction(event)' " +
        "ondragover='allowDropInstruction(event)'>" +
        "</td></tr>";

// The html for the drop-down caret
var caret = '<span class="caret"></span>';

// The url symbols for 21 card values
var cardValString = 'xa234567890jqkbcdefghi';

window.onload = function () {
    // Hide the stop button, prepare to run code
    stopIt();

    let params = new URLSearchParams(window.location.search);

    // unlock the swap instruction if asked nicely
    if (params.has('swap')) {
        $('.instruction.swap').show();
    } else {
        $('.instruction.swap').hide();
    }

    if (params.has('code')) {
        buildProgram(params.get('code'));
    }

    if (params.has('cards') && params.get('cards').length > 0) {
        deal(params.get('cards'));
    } else {
        deal();
    }
    if (params.has('speed')) {
        document.getElementById("runSlider").value = params.get('speed');
    }

    // Prepare the code display
    compactLines();
    setLineNumbers();
    fillPositionDropdowns();
    addDropdownHandlers();
};