// Global singleton, keeps track of execution of HML Code
var runState = {
    currentLine: -1,
    nextLine: -1,
    numSteps: 0,
    numCards: 8,
    runTimer: null,
    rHand: 1,
    lHand: 0,
    suit: '',

    /**
     * Begin running the HML code
     */
    go: function () {
        // reset any current line indication
        $('.currentLine').removeClass('currentLine');
        $('.lastLine').removeClass('lastLine');

        runState.reset();

        // Initialize the timer
        runState.runTimer = setTimeout(runState.doNextLine, 5);
    },
    
    /**
     * Execute the next line of HML code
     */
    step: function() {
        // If execution is paused
        if (runState.nextLine >= 0) {
            // Run the next line
            runState.doNextLine(true);
        }
        else {
            // Otherwise start execution at the beginning.
            
            // reset any current line indication
            $('.currentLine').removeClass('currentLine');
            $('.lastLine').removeClass('lastLine');

            runState.reset();
            
            //runState.doNextLine(true);
        }
    },
    
    /**
     * Continue executing HML code where the program was stopped
     */
    cont: function() {
        // If execution was paused
        if (runState.nextLine >= 0) {
            // Restart the run timer to run the next line
            runState.runTimer = setTimeout(runState.doNextLine, 5);
        }
        else {
            // Otherwise start from the beginning
            runState.go();
        }
    },

    /**
     * Run the next HML instruction
     * @param {boolean} singleStep should we automatically to continue to the 
     *                             next line
     */
    doNextLine: function (singleStep) {
        // Get all lines of code
        let lines = $('#program tbody tr');

        
        // Remove the current line marker
        $('.currentLine').removeClass('currentLine');

        // Remember it as the new current line
        runState.currentLine = runState.nextLine;

        // Get the line of code
        let line = $(lines[runState.currentLine]);

        // If the next line number is a legal line number
        if (runState.nextLine >= 0 && runState.nextLine < lines.length) {
            numSteps++;
            $('.stepCount').text(numSteps);

            // Run the command
            if (doCommand(runState, line.find('.instruction')[0])) {
                if (!singleStep) {
                    // If the command was successful (and not a stop),
                    // prepare to run the next line

                    // Calculate the time between instructions based on
                    // the value of the Run Speed Slider, scaling the
                    // value logarithmically to a range of 2000ms - 10ms

                    // Get the slider value
                    let slider = $('#runSlider');
                    let time = 100 - slider.val();

                    // Get the scaling ranges
                    let minTime = Math.log(10);
                    let maxTime = Math.log(2000);
                    let minP = slider.attr('min');
                    let maxP = slider.attr('max');

                    // Calculate the scale factor
                    let scale = (maxTime - minTime) / (maxP - minP);

                    // Calculate the time interval
                    time = Math.ceil(Math.exp(minTime + scale * (time - minP)));

                    // Set the time to run the next instruction
                    runState.runTimer = setTimeout(runState.doNextLine, time);                
                }
               
                // Get the next line num and remember it as the new current line
                runState.currentLine = runState.nextLine;

                // Get the line of code
                line = $(lines[runState.currentLine]);

                // Mark it as the current line
                line.addClass('currentLine');
                line[0].scrollIntoView();
                
                } else {
                    // If the command was not successful, or was a stop,
                    // stop running
                     
                    // Mark the command as the current line
                    line.addClass('currentLine');
                    line[0].scrollIntoView();
                
                    stopIt(true);
                }
        } else {
            // If the next line is not a legal line, stop running
            stopIt(true);
        }
    },
    
    reset: function() {
        // Set the starting line
        runState.nextLine = 0;

        // Reinitialize the step count
        numSteps = 0;
        $('.stepCount').text(0);

        // reinitialize hands
        moveHand(0, 0);
        moveHand(1, 1);
                
        // Highlight the first line of code
        let firstLine = $('#program tbody tr')[0];
        $(firstLine).addClass('currentLine');
    }
};

$('#runStepBtn').on("click", null, "run", runStep);

/**
 * Run/Step/Continue button handler
 * @param {type} evt contains the command to execute in .data
 */
function runStep(evt) {
    if (evt.data === "run") {
        runIt();
    }
    else if (evt.data === "step") {
        stepIt();
    }
    else if (evt.data === "continue") {
        continueIt();
    }
}

/**
 * Prepare to run, updating the display
 */
function runIt() {
    // Hide the run button, show the stop button
    $('.runbtn').hide();
    $('.stopbtn').show();
    
    // Make the run/step button show 'run'
    $('#runTxt').show();    
    $('#stepTxt').hide();  
    $('#continueTxt').hide(); 
    $('#runStepBtn').off("click", null, runStep);
    $('#runStepBtn').on("click", null, "run", runStep);
    $('#stepItem').show();
    
    // Make the run/step button run the program
    $('#runStepBtn').off("click", null, runStep);
    $('#runStepBtn').on("click", null, "step", runStep);
    
    // Disable redealing while running
    $('.redealbtn').addClass('disabled');

    // Begin execution
    runState.go();
}

/**
 * Prepare to step, updating the display
 */
function stepIt() {
    // Make the run/step button show 'step'
    $('#runTxt').hide();    
    $('#stepTxt').show();
    $('#continueTxt').hide(); 
    $('#continueItem').show();
    $('#restartItem').show();
    $('#stepItem').hide();
    
    // Make the run/step button step the program
    $('#runStepBtn').off("click", null, runStep);
    $('#runStepBtn').on("click", null, "step", runStep);
    
    // Don't show the line where execution stopped
    $('.lastLine').removeClass('lastLine');
    
    // Execute a program step
    runState.step();
}

/**
 * Prepare to continue, updating the display
 */
function continueIt() {
    // Hide the run button, show the stop button
    $('.runbtn').hide();
    $('.stopbtn').show();
        
    // Make the run/step button show 'continue'
    $('#runTxt').hide();    
    $('#stepTxt').hide();
    $('#continueTxt').show(); 
    $('#stepItem').show();
    $('#restartItem').show();
    
    // Make the run/step button run the program
    $('#runStepBtn').off("click", null, runStep);
    $('#runStepBtn').on("click", null, "continue", runStep);
    
    // Disable redealing while running
    $('.redealbtn').addClass('disabled');


    // Don't show the line where execution stopped
    $('.lastLine').removeClass('lastLine');
    
    // Continue program execution
    runState.cont();
}

/**
 * Stop execution, updating the display
 * @param {boolean} done execution has finished
 */
function stopIt(done) {
    if (!done) {
        // Show continue on the run button
        $('#runTxt').hide();    
        $('#stepTxt').hide();
        $('#continueTxt').show(); 
        
        $('#stepItem').show();
        $('#continueItem').hide();
        $('#restartItem').show();
        
        // Make the run/step button continue the program
        $('#runStepBtn').off("click", null, runStep);
        $('#runStepBtn').on("click", null, "continue", runStep);      
    }
    else {
        // Show Run on the run button
        $('#runTxt').show();    
        $('#stepTxt').hide();
        $('#continueTxt').hide(); 
        
        $('#stepItem').show();
        $('#continueItem').hide();        
        $('#restartItem').hide();
        
        // Make the run/step button step the program
        $('#runStepBtn').off("click", null, runStep);
        $('#runStepBtn').on("click", null, "run", runStep);
        
        // Set the starting line
        runState.nextLine = -1;
    }
    
    // Display the last line executed
    $('.currentLine').addClass('lastLine');
    $('.currentLine').removeClass('currentLine');
        
    // Hide the stop button, show the run button
    $('.runbtn').show();
    $('.stopbtn').hide();
    
    // Reenable the redeal button
    $('.redealbtn').removeClass('disabled');

    // Stop any left over execution timer
    clearTimeout(runState.runTimer);
}

/**
 * Reset the HML execution
 */
function restartIt() {
    // Show Run on the run button
    $('#runTxt').show();    
    $('#stepTxt').hide();
    $('#continueTxt').hide(); 

    $('#stepItem').show();
    $('#continueItem').hide();
    $('#restartItem').hide();
    
    // Make the run/step button step the program
    $('#runStepBtn').off("click", null, runStep);
    $('#runStepBtn').on("click", null, "run", runStep);

    // Hide the stop button, show the run button
    $('.runbtn').show();
    $('.stopbtn').hide();
    
    // Reenable the redeal button
    $('.redealbtn').removeClass('disabled');
    
    // Stop any left over execution timer
    clearTimeout(runState.runTimer);

    // Don't show the last line executed
    $('.lastLine').removeClass('lastLine');
    $('.currentLine').removeClass('currentLine');
    
    runState.reset();
}

/**
 * Execute one HML instruction
 * 
 * @param {runState} state the current execution state
 * @param  {jQuery} inst the instruction to run
 * @returns {Boolean} true if successful, false if execution should 
 *                    stop
 */
function doCommand(state, inst) {
    inst = $(inst);

    if (inst.is('.stop')) {
        // If this is a stop instruction, quit
        return false;
    } else if (inst.is('.jump')) {
        return doJump(state, inst);
    } else if (inst.is('.jumpif')) {
        return doJumpIf(state, inst);
    } else if (inst.is('.shift')) {
        return doShift(state, inst);
    } else if (inst.is('.move')) {
        return doMove(state, inst);
    } else if (inst.is('.swap')) {
        return doSwap(state);
    } else {
        // If this is an unknown instruction, skip it
        state.nextLine++;
        return true;
    }
}

/**
 * Handle a jump instruction
 * @param {runState} state the current execution state
 * @param  {jQuery} inst the jump instruction to execute
 * @returns {Boolean} true if execution should continue, false
 *                    on error
 */
function doJump(state, inst) {
    // If this is a jump instruction, get the jump target line number
    let lineno = getJumpTarget(inst);

    // If the line number is invalid, quit
    if (lineno < 0) {
        return false;
    }

    // Move the instruction pointer to the next line to run
    state.nextLine = lineno - 1;

    // And allow execution to continue
    return true;
}

/**
 * Handle a jump-if instruction
 * @param {runState} state the current execution state
 * @param  {jQuery} inst the jump instruction to execute
 * @returns {Boolean} true if execution should continue, false
 *                    on error
 */
function doJumpIf(state, inst) {
    // If this is a jump-if instruction, get the jump target line
    let lineno = getJumpTarget(inst);

    // If the line number is invalid, quit
    if (lineno < 0) {
        return false;
    }

    // Assume we won't jump, what line should we go to?
    let nextLine = state.nextLine + 1;
    let shouldJump = false;

    // Determine what values to compare
    let values = getCardOrPosValues(inst, state);
    if (values === null) {
        return false;
    }

    // Determine the comparison to perform
    let comp = getComparison(inst);
    if (comp === null) {
        return false;
    }
    // Perform the comparison to determine if we should jump
    switch (comp) {
        case "=":
            shouldJump = values[0] === values[1];
            break;
        case "!=":
            shouldJump = values[0] !== values[1];
            break;
        case "<":
            shouldJump = values[0] < values[1];
            break;
        case ">":
            shouldJump = values[0] > values[1];
            break;
        case ">=":
            shouldJump = values[0] >= values[1];
            break;
        case "<=":
            shouldJump = values[0] <= values[1];
            break;
    }

    // If we should jump, calculate the new line
    if (shouldJump) {
        nextLine = lineno - 1;
    }

    // Move the instruction pointer to the next line to run
    state.nextLine = nextLine;

    // And allow execution to continue
    return true;
}

/**
 * Determine the target line number for a jump or jump-if
 *  instruction
 *  
 * @param {jQuery} inst the jump instruction
 * @returns {Number} the target line number of the jump, -1 if the
 *                   instruction has an invalid target
 */
function getJumpTarget(inst) {
    // Get the instructions target linenumber
    let lineno = inst.find('.linenum .dropdown-text').text();
    lineno = parseInt(lineno);

    // If the target is invalid
    if (isNaN(lineno)) {
        // Alert the user and quit
        alert("You need to set the line to jump TO!");
        return -1;
    }

    // Otherwise, return the valid jump target
    return lineno;
}

/**
 * Get the values to compare in an instruction
 * 
 * @param {jQuery} inst the jump instruction
 * @param {runState} state the current execution state
 * @returns {Number[]} the values in the conditional, null if invalid
 */
function getCardOrPosValues(inst, state) {
    let values = [];
    let invalid = false;

    // Find each value in the instruction
    inst.find('.value .dropdown-text').each(function () {
        if (!invalid) {
            // Get the text for this value
            let val = $(this).text().trim();

            // Determine the text for the value
            switch (val) {
                case ("Right Hand Card"):
                    // Use the value of the card the right hand is touching
                    val = $($('.cards .cardItem')[state.rHand]).attr('value');
                    values.push(parseInt(val));
                    break;
                case ("Left Hand Card"):
                    // Use the value of the card the left hand is touching
                    val = $($('.cards .cardItem')[state.lHand]).attr('value');
                    values.push(parseInt(val));
                    break;
                case ("Right Hand Position"):
                    // Use the value of the position of the right hand
                    values.push(state.rHand);
                    break;
                case ("Left Hand Position"):
                    // Use the value of the position of the left hand
                    values.push(state.lHand);
                    break;
                case ("Min Position"):
                    // Use the minimum position
                    values.push(0);
                    break;
                case ("Max Position"):
                    // Use the minimum position
                    values.push(state.numCards - 1);
                    break;
                default:
                    // Use a literal value
                    val = parseInt(val);

                    // If there is no literal value, there was an error
                    if (isNaN(val)) {
                        alert("You need to set a value to compare.");
                        invalid = true;
                    }

                    values.push(val);
            }
        }
    });

    // If any invalid value was found, ignore all values
    if (invalid) {
        return null;
    }

    // Otherwise, return the valid values
    return values;
}

/**
 * Get the comparison in an instruction
 * 
 * @param {jQuery} inst the jump-if instruction
 * @returns {String} the comparison character, null if invalid
 */
function getComparison(inst) {
    let comp = inst.find('.comparison .dropdown-text').text().trim();

    switch (comp) {
        case "=":
            return "=";
        case "<":
            return "<";
        case ">":
            return ">";
        case "\u2264":
            return "<=";
        case "\u2265":
            return ">=";
        case "\u2260":
            return "!=";
        default:
            alert("You need to set the comparison operator.");
            return null;
    }
}

/**
 * Handle a shift instruction
 * 
 * @param {runState} state the current execution state
 * @param  {jQuery} inst the shift instruction to execute
 * @returns {Boolean} true if the shift was successful, false if
 *                    execution should quit.
 */
function doShift(state, inst) {
    let hand = getHand(inst, "shift");
    if (hand === -1) {
        return false;
    }

    let dir = getDir(inst);
    if (dir === 0) {
        return false;
    }

    // Move the instruction pointer to the next line to run
    state.nextLine++;
    return shiftHand(hand, dir);
}

/**
 * Handle a move instruction
 * 
 * @param {runState} state the current execution state
 * @param {jQuery} inst the shift instruction to execute
 * @returns {Boolean} true if the shift was successful, false if
 *                    execution should quit.
 */
function doMove(state, inst) {
    let hand = getHand(inst, "move");
    if (hand === -1) {
        return false;
    }

    let pos = getPosition(inst, state);
    if (pos < 0) {
        return false;
    }

    // Move the instruction pointer to the next line to run
    state.nextLine++;
    return moveHand(hand, pos);
}

/**
 * Determine the hand an instruction refers to
 * 
 * @param {jQuery} inst the shift/move instruction
 * @param {String} command "shift" or "move" for error display
 * @returns {Number} 0 = left hand, 1 = right hand, -1 = error
 */
function getHand(inst, command) {
    // Get the hand text
    let hand = inst.find('.hand .dropdown-text').text().trim();

    // If a valid hand was set, return the appropriate value
    if (hand === "Right Hand") {
        return 1;
    } else if (hand === "Left Hand") {
        return 0;
    }

    // Otherwise, show an error and return an error code
    alert("You need to set which hand to " + command + ".");
    return -1;
}

/**
 * Determine the direction to shift the hand
 * 
 * @param {jQuery} inst the shift instruction
 * @returns {Number} -1 = left, 1 = right, 0 = error
 */
function getDir(inst) {
    // Get the direction text
    let dir = inst.find('.dir .dropdown-text').text().trim();

    // If a valid direction was set, return the appropriate value
    if (dir === "Right") {
        return 1;
    } else if (dir === "Left") {
        return -1;
    }

    // Otherwise, show an error and return an error code
    alert("You need to set a direction to to shift the hand.");
    return 0;
}


/**
 * Determine the location to move the hand to
 * 
 * @param {jQuery} inst the move instruction
 * @param {runState} state the current execution state
 * 
 * @returns {Number} -1 = error, 0..7, the new location
 */
function getPosition(inst, state) {
    // Get the direction text
    let pos = inst.find('.pos .dropdown-text').text().trim();
    let posNum = parseInt(pos);

    // If a valid direction was set, return the appropriate value
    if (pos === "Right Hand Position") {
        return state.rHand;
    } else if (pos === "Left Hand Position") {
        return state.lHand;
    } else if (pos === "Min Position") {
        return 0;
    } else if (pos === "Max Position") {
        return state.numCards - 1;
    } else if (!isNaN(posNum)) {
        return posNum;
    }

    // Otherwise, show an error and return an error code
    alert("You need to set which card position to move the hand to.");
    return -1;
}


/**
 * Handle a swap instruction
 * 
 * @param {runState} state the current execution state
 * @returns {Boolean} true if the swap was successful, false if
 *                    execution should quit.
 */
function doSwap(state) {
    // Don't swap if both hands are in the same position
    if (state.lHand === state.rHand) {
        state.nextLine++;
        return true;
    }

    // Get the card cell and its value for the left hand
    let lhTD = $($('.cards td')[state.lHand]);
    let lhItem = lhTD.find('.cardItem');

    // Get the card cell and its value for the right hand
    let rhTD = $($('.cards td')[state.rHand]);
    let rhItem = rhTD.find('.cardItem');

    // Put the cards in their new home
    lhTD.append(rhItem);
    rhTD.append(lhItem);

    state.nextLine++;
    return true;

}