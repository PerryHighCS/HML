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
    stopIt(true);

    let params = new URLSearchParams(window.location.search);

    // unlock the swap instruction if asked nicely
    if (params.has('swap')) {
        $('.instruction.swap').show();
    } else {
        $('.instruction.swap').hide();
    }

    // Load code from the url
    if (params.has('code')) {
        buildProgram(params.get('code'));   
    }

    // Load the dealt cards from the url if provided
    if (params.has('cards') && params.get('cards').length > 0) {
        deal(params.get('cards'));
    } else {
        deal();
    }
    
    // Load the execution speed from the url
    if (params.has('speed')) {
        let speed = params.get('speed') || 50;              // Provide a default speed if blank
        document.getElementById("runSlider").value = speed; // Set the speed slider to the provided speed
        setURLSpeed(speed);                                 // Post the speed back to the url
    }

    // Load the shuffle direction from the url
    if (params.has('shuffle')) {
        if (params.get('shuffle') > 0) {
            ascending();
        }
        else if (params.get('shuffle') < 0){
            descending();
        }
        else {
            random();
        }
    }
    else {
        random();
    }
    
    // Prepare the code display
    compactLines();
    setLineNumbers();
    fillPositionDropdowns();
    addDropdownHandlers();
};