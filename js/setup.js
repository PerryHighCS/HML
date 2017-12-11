// The html for a blank program line
var instRow = "<tr><td class='linenumcell'>" +
        "</td><td class='instructioncell' " +
        "ondrop='dropInstruction(event)' " +
        "ondragover='allowDropInstruction(event)'>" +
        "</td></tr>";

// The url symbols for 21 card values
var cardValString = 'xa234567890jqkbcdefghi';

window.onload = function () {
    // Hide the stop button, prepare to run code
    stopIt(true);

    let params = new URLSearchParams(window.location.search);

    if (params.has('title')) {
        $('#pgmTitle').attr('value', params.get('title'));
        document.title = params.get('title') + ": The Human Machine Language";
    }
    else {
        $('#pgmTitle').attr('value', "");
        document.title = "The Human Machine Language";
    }
    
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
        // Load the shuffle direction from the url
        if (params.has('shuffle')) {
            if (params.get('shuffle') > 0) {
                ascending();
                $('#ascRadio').prop('checked', true);
                $('#desRadio').prop('checked', false);
                $('#rndRadio').prop('checked', false);

            }
            else if (params.get('shuffle') < 0){
                descending();
                $('#ascRadio').prop('checked', false);
                $('#desRadio').prop('checked', true);
                $('#rndRadio').prop('checked', false);
            }
            else {
                random();
                $('#ascRadio').prop('checked', false);
                $('#desRadio').prop('checked', false);
                $('#rndRadio').prop('checked', true);
            }
        }
        else {
            random();
            $('#ascRadio').prop('checked', false);
            $('#desRadio').prop('checked', false);
            $('#rndRadio').prop('checked', true);
        }
    }
    
    // Load the execution speed from the url
    if (params.has('speed')) {
        let speed = params.get('speed') || 50;              // Provide a default speed if blank
        document.getElementById("runSlider").value = speed; // Set the speed slider to the provided speed
        setURLSpeed(speed);                                 // Post the speed back to the url
    }
    
    // Shrink fillins to fit their contents
    $('.palette .fillin').each(function() {
        let item = $(this);
        let text = item.children('option:selected').text();
        setDropdownWidth(item, text);
    });

    
    // Prepare the code display
    compactLines();
    setLineNumbers();
    fillPositionDropdowns();
    addDropdownHandlers();
};


/**
 * Add click handlers to all fillins that updates the url code
 */
function addDropdownHandlers() {
    // Find all dropdown items, set their change function
    $(".fillin").change(function () {
        // Set the dropdown's data to the chosen value
        $(this).attr('data', this.value);
        
        // Make sure the correct option is selected
        let children = $(this).children('option');
        for (let child of children) {
            $(child).attr('selected', (this.value === child.value));
        }
        
        // Resize the dropdown to fit the selected text        
        setDropdownWidth($(this), $(this).find("option:selected").text());
        // then update the URL
        setURLCode();
    });
}

/**
 * Calculate and set the width of a dropdown to fit its text
 * 
 * @param {type} dd - the dropdown to modify
 * @param {type} text - the text to fit
 */
function setDropdownWidth(dd, text) {
    $('#templateOption').text(text);
        
    dd.width($('#sizeTest').width() + 30);
}