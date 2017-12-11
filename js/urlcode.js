/* global instRow, caret, cardValString */

/**
 * Update the page url to include the current program code
 */
function setURLCode() {
    let code = "";

    // Convert all of the program instructions into code
    $('#program .instruction').each(function () {
        code += instToCode($(this));
    });

    // Add the code to the url
    var url = new URL(window.location);
    url.searchParams.set('code', code);

    // Set the window url
    window.history.replaceState(null, document.title, url.toString());
       
    updateRunLink();
}

/**
 * Set the window url to include the current card deck
 * 
 * @param {Array|buildDeck.deck} deck the deck of cards to add to
 *         the url
 */
function setURLCards(deck) {
    let params = new URLSearchParams(window.location.search);
    
    // Only post the deck to the url if a cards param is currently there
    if (params.has('cards')) {
        let cards = '';
        deck = deck || makeDeckArray();

       // Build up a string of card symbols from the deck
       for (let i = 0; i < deck.length; i++) {
           cards += cardValString.charAt(deck[i]);
       }

       // Add the code to the url
       var url = new URL(window.location);
       url.searchParams.set('cards', cards);

       // Set the window url
       window.history.replaceState(null, document.title, url.toString());
      
       updateRunLink();
   }
}

/**
 * Set the window url to include the current run speed.
 * 
 * @param {int|speed} runSpeed current step speed
 */
function setURLSpeed(runSpeed) {
    var url = new URL(window.location);
    
    // Only post the speed to the url if a speed param is currently there
    if (url.searchParams.has('speed')) {
        runSpeed = runSpeed || 50;
        
        // Add the code to the url
        var url = new URL(window.location);
        url.searchParams.set('speed', runSpeed);
        
        // Set the window url
        window.history.replaceState(null, document.title, url.toString());
       
        updateRunLink();
    }
}


/**
 * Set the window url to include the deal direction.
 * 
 * @param {int} dealDir 0 - shuffled, -descending, +ascending
 */
function setURLDealDirection(dealDir) {
    // Add the code to the url
    var url = new URL(window.location);
    
    if (dealDir !== 0) {
        url.searchParams.set('shuffle', dealDir);
    }
    else {
        url.searchParams.delete('shuffle');
    }
    
    // Set the window url
    window.history.replaceState(null, document.title, url.toString());
    
    updateRunLink();
}

/**
 * Update the page url to include the program title
 * 
 * @param {String} title the program's title
 */
function setURLTitle(title) {
    // Add the code to the url
    var url = new URL(window.location);
    
    if (title.trim()) {        
        document.title = title + ": The Human Machine Language";
    }
    else {
        document.title = "The Human Machine Language";
        
    }
    
    url.searchParams.set('title', title);
    // Set the window url
    window.history.replaceState(null, document.title, url.toString());
    
    updateRunLink();
}

/**
 * Build an array of card values from the card board
 * 
 * @returns {Array|Number}
 */
function makeDeckArray() {
    let deck = [];

    // Get all of the cards on the board
    let cards = $('#cardboard .cards td .carditem');

    // Loop through each of the cards
    cards.each(function () {
        // Add the card value to the deck array
        deck.push(parseInt($(this).attr('value')));
    });

    // Return the array of card values
    return deck;
}

/**
 * Convert an instruction block into compressed code
 * 
 * @param {jQuery} inst the instruction block to convert to code
 * @returns {String} the compressed code version of the instruction
 */
function instToCode(inst) {
    let code = "";

    if (inst.is('.stop')) {
        code = 'X';
    } else if (inst.is('.jump')) {
        code = 'J';
        code += inst.find('.linenum').val();
    } else if (inst.is('.jumpif')) {
        let vals = inst.find('.value');
        code = 'I';
        code += inst.find('.linenum').val();
        code += $(vals[0]).val();
        code += inst.find('.comparison').val();
        code += $(vals[1]).val();
    } else if (inst.is('.shift')) {
        code = 'S';
        code += inst.find('.hand').val();
        code += inst.find('.dir').val();
    } else if (inst.is('.move')) {
        code = 'M';
        code += inst.find('.hand').val();
        code += inst.find('.pos').val();
    } else if (inst.is('.swap')) {
        code = 'W';
    }

    return code;
}

/**
 * Build a program from compressed url
 * 
 * @param {String} code the compressed code to turn into instructions
 */
function buildProgram(code) {
    while (code.length > 0) {
        code = parseInstruction(code);
    }
}

/**
 * Parse and remove the first instruction from program code
 * 
 * @param {String} code the compressed program code
 * @returns {String} the program code with the first instruction 
 *                   removed
 */
function parseInstruction(code) {
    let end = 0;
    let target = "";
    let hand = "";

    switch (code.charAt(0)) {
        case 'X':
            // Stop Instruction
            end++;
            addInstruction($('.palette .stop').clone());
            break;

        case 'J':
            // Jump Instruction
            end++;
            target = parseNumToken(code.substr(end));
            end += target.length;

            addInstruction(buildJump(target));
            break;

        case 'I':
            // Jump-if instruction
            end++;

            target = parseNumToken(code.substr(end));
            end += target.length;

            let val1 = parseNumToken(code.substr(end));
            end += val1.length;

            let comp = code.charAt(end);
            end++;

            let val2 = parseNumToken(code.substr(end));
            end += val2.length;

            addInstruction(buildJumpIf(target, val1, comp, val2));
            break;

        case 'S':
            // Shift instruction
            end++;

            hand = code.charAt(end);
            end++;

            let dir = code.charAt(end);
            end++;

            addInstruction(buildShift(hand, dir));
            break;

        case 'M':
            // Move instruction
            end++;

            hand = code.charAt(end);
            end++;

            let pos = code.charAt(end);
            end++;

            addInstruction(buildMove(hand, pos));
            break;

        case 'W':
            // Swap instruction
            end++;
            addInstruction($('.palette .swap').clone());
            break;

        default:
        // This was an invalid instruction, search for the next
        // valid instruction
        for (end++; end < code.length; end++) {
            if ('XJISMW'.includes(code.charAt(end))) {
                break;
            }
        }
    }

    // Return the code with this instruction cut off
    return code.substr(end);
}

/**
 * Add an instruction to the end of the program
 * 
 * @param {jQuery} inst the instruction block to add
 */
function addInstruction(inst) {
    let programBody = $('#program tbody');
    let newRow = $(instRow);

    newRow.find('.instructioncell').append(inst);

    programBody.append(newRow);
}

/**
 * Get a number from the token, or the next char
 * 
 * @param {String} code
 * @returns {String} the target line number for the jump or 'x' if 
 *                   not set
 */
function parseNumToken(code) {
    let target = parseInt(code);

    if (isNaN(target)) {
        return code.charAt(0);
    } else {
        return '' + target;
    }
}

/**
 * Build a jump instruction block given a target line
 * 
 * @param {String} target the jump target line, 'x' if not set
 * @returns {jQuery} the jump instruction block
 */
function buildJump(target) {
    let inst = $('.palette .jump').clone();

    if (target !== 'x') {
        let ln = inst.find('.linenum');
        ln.val(target).attr('data', target);
        
        setDropdownWidth(ln, target);
    }

    return inst;
}

/**
 * Build a jump-if instruction block
 * 
 * @param {String} target
 * @param {String} val1
 * @param {String} comp
 * @param {String} val2
 * @returns {jQuery} the jump-if instruction block
 */
function buildJumpIf(target, val1, comp, val2) {
    let inst = $('.palette .jumpif').clone();
    let text = "";
    
    if (target !== 'x') {
        setDropdown(inst.find('.linenum'), target);
    }

    let vals = inst.find('.value');

    if (val1 !== 'x') {
        setDropdown($(vals[0]), val1);
    }
    
    if (val2 !== 'x') {
        setDropdown($(vals[1]), val2);
    }

    if (comp !== 'x') {      
        let c = inst.find('.comparison');
     
        text = setDropdown(c, comp);        
        setDropdownWidth(c, text);
    }

    return inst;
}

/**
 * Build a shift instruction block
 * 
 * @param {String} hand the hand code
 * @param {String} dir the direction code
 * @returns {jQuery} the shift instruction block
 */
function buildShift(hand, dir) {
    let inst = $('.palette .shift').clone();
    let text = "";
    
    if (hand !== 'x') {
        let h = inst.find('.hand');
        
        text = setDropdown(h, hand);        
        setDropdownWidth(h, text);
    }

    if (dir !== 'x') {
        let d = inst.find('.dir');
        
        text = setDropdown(d, dir);
        setDropdownWidth(d, text);
    }

    return inst;
}

/**
 * Build a move instruction block
 * 
 * @param {String} hand the hand code
 * @param {String} pos the direction code
 * @returns {jQuery} the shift instruction block
 */
function buildMove(hand, pos) {
    let inst = $('.palette .move').clone();
    let text = "";
    
    if (hand !== 'x') {
        let h = inst.find('.hand');
        
        text = setDropdown(h, hand);        
        setDropdownWidth(h, text);
    }

    if (pos !== 'x') {
        let p = inst.find('.pos');
        
        text = setDropdown(p, pos);
        setDropdownWidth(p, text);
    }

    return inst;
}

/**
 * Update a dropdown list with a predetermined value and data
 * 
 * @param {type} d the dropdown to update
 * @param {type} val the value to set in the dropdown
 * @returns {String|jQuery} The text of the dropdown item selected
 */
function setDropdown(d, val) {
    let text = "";
    
    // Set the dropdown's value and data
    d.val(val)
     .attr('data', val);
    
    return d.find('option[value="' + val + '"]').text();
   
    return text;
}

/**
 * Update the printout run link
 */
function updateRunLink() {
    let params = new URLSearchParams(window.location.search);
    
    let a = $('<a>');
    a.text(params.has('code') ? params.get('code') : document.title);
    a.prop('href', window.location);
    let div = $('#runLink');
    div.empty();
    div.append(a);
    
    let span = $('<span>');
    span.addClass("glyphicon glyphicon-link");
    a.append(span);
}