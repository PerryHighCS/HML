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
    window.history.replaceState(null, document.title, url);
       
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
       window.history.replaceState(null, document.title, url);
      
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
        window.history.replaceState(null, document.title, url);
       
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
    window.history.replaceState(null, document.title, url);
    
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
    window.history.replaceState(null, document.title, url);
    
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
        code += jumpTargetCode(inst.find('.linenum').val());
    } else if (inst.is('.jumpif')) {
        let vals = inst.find('.value');

        code = 'I';
        code += jumpTargetCode(inst.find('.linenum').val());
        code += valCode($(vals[0]).val());
        code += compCode(inst.find('.comparison').val());
        code += valCode($(vals[1]).val());
    } else if (inst.is('.shift')) {
        code = 'S';
        code += handCode(inst.find('.hand').val());
        code += dirCode(inst.find('.dir').val());
    } else if (inst.is('.move')) {
        code = 'M';
        code += handCode(inst.find('.hand').val());
        code += posCode(inst.find('.pos').val());
    } else if (inst.is('.swap')) {
        code = 'W';
    }

    return code;
}

/**
 * Convert a hand fillin to its code version
 * 
 * @param {String} hand
 * @returns {String}
 */
function handCode(hand) {
    if (hand === 'Right Hand') {
        return 'r';
    } else if (hand === 'Left Hand') {
        return 'l';
    } else {
        return 'x';
    }
}

/**
 * Convert a direction fillin to its code version
 * 
 * @param {String} dir
 * @returns {String}
 */
function dirCode(dir) {
    if (dir === 'Right') {
        return 'r';
    } else if (dir === 'Left') {
        return 'l';
    } else {
        return 'x';
    }
}

/**
 * Convert a position fillin to its code version
 * @param {String} pos
 * @returns {Number|String}
 */
function posCode(pos) {
    if (pos === 'Right Hand Position') {
        return 'r';
    } else if (pos === 'Left Hand Position') {
        return 'l';
    } else if (pos === 'Min Position') {
        return 'i';
    } else if (pos === 'Max Position') {
        return 'a';
    } else {
        // Use a literal value
        pos = parseInt(pos);

        // If there is no literal value, there was an error
        if (isNaN(pos)) {
            return 'x';
        } else {
            return pos;
        }
    }
}

/**
 * Convert a jump target to a code version
 * 
 * @param {String} target
 * @returns {jumpTargetCode.lineno|String}
 */
function jumpTargetCode(target) {
    let lineno = parseInt(target);
    if (isNaN(lineno)) {
        return "x";
    } else {
        return lineno;
    }
}

/**
 * Convert a comparison value to its code version
 * 
 * @param {String} val
 * @returns {Number|String}
 */
function valCode(val) {
    switch (val) {
        case ("Right Hand Card"):
            return 'R';
        case ("Left Hand Card"):
            return 'L';
        case ("Right Hand Position"):
            return 'r';
        case ("Left Hand Position"):
            return 'l';
        case ("Min Position"):
            return 'i';
        case ("Max Position"):
            return 'a';
        default:
            // Use a literal value
            val = parseInt(val);

            // If there is no literal value, there was an error
            if (isNaN(val)) {
                return 'x';
            } else {
                return val;
            }
    }
}

/**
 * Convert a comparison operator to a letter code
 * 
 * @param {String} comp
 * @returns {String}
 */
function compCode(comp) {
    switch (comp) {
        case "=":
            return "e";
        case "<":
            return "l";
        case ">":
            return "g";
        case "<=":
            return "L";
        case ">=":
            return "G";
        case "!=":
            return "n";
        default:
            return "x";
    }
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
            target = jumpTarget(code.substr(end));
            end += target.length;

            addInstruction(buildJump(target));
            break;

        case 'I':
            // Jump-if instruction
            end++;

            target = jumpTarget(code.substr(end));
            end += target.length;

            let val1 = getValue(code.substr(end));
            end += val1.length;

            let comp = comparisonSymbol(code.charAt(end));
            end++;

            let val2 = getValue(code.substr(end));
            end += val2.length;

            addInstruction(buildJumpIf(target, val1, comp, val2));
            break;

        case 'S':
            // Shift instruction
            end++;

            hand = getHandCode(code.substr(end));
            end += hand.length;

            let dir = getDirectionCode(code.substr(end));
            end += dir.length;

            addInstruction(buildShift(hand, dir));
            break;

        case 'M':
            // Move instruction
            end++;

            hand = getHandCode(code.substr(end));
            end += hand.length;

            let pos = getPosCode(code.substr(end));
            end += pos.length;

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
 * Get a target line number at the beginning of compressed code
 * 
 * @param {String} code
 * @returns {String} the target line number for the jump or 'x' if 
 *                   not set
 */
function jumpTarget(code) {
    let target = parseInt(code);

    if (isNaN(target)) {
        return 'x';
    } else {
        return '' + target;
    }
}

/**
 * Get a comparison value from the beginning of compressed code
 * @param {String} code
 * @returns {String} the comparison value, 'x' if not set
 */
function getValue(code) {
    let c = code.charAt(0);

    switch (c) {
        case 'x':
        case 'R':
        case 'r':
        case 'L':
        case 'l':
        case 'i':
        case 'a':
            // A preset value code
            return c;

        default:
            // Use a literal value
            let val = parseInt(code);

            // If there is no literal value, there was an error
            if (isNaN(val)) {
                return 'x';
            } else {
                // If the value is a number, return it as a String
                return '' + val;
            }
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

    if (target !== 'x') {
        let t = inst.find('.linenum');
        t.val(target).attr('data', target);     
        setDropdownWidth(t, target);
    }

    let vals = inst.find('.value');

    if (val1 !== 'x') {
        let ev = expandValue(val1);
        $(vals[0]).val(ev).attr('data', ev);
        setDropdownWidth($(vals[0]), ev);
    }
    if (val2 !== 'x') {
        let ev = expandValue(val2);
        $(vals[1]).val(ev).attr('data', ev);
        setDropdownWidth($(vals[1]), ev);
    }

    if (comp !== 'x') {      
        let ev = expandValue(comp);
        let c = inst.find('.comparison');
        
        c.val(ev).attr('data', ev);
        c.find('option').each(function() {
            $(this).attr('selected', this.value === ev);
        });
        
        setDropdownWidth(c, ev);
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

    if (hand !== 'x') {
        let ev = expandHand(hand);
        let h = inst.find('.hand');
         
        h.val(ev).attr('data', ev);
        h.find('option').each(function() {
            $(this).attr('selected', this.value === ev);
        });
        
        setDropdownWidth(h, ev);
    }

    if (dir !== 'x') {
        let ev = expandDir(dir);
        let d = inst.find('.dir');
        
        d.val(ev).attr('data', ev);
        d.find('option').each(function() {
            $(this).attr('selected', this.value === ev);
        });
        
        setDropdownWidth(d, ev);
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

    if (hand !== 'x') {
        let ev = expandHand(hand);
        let h = inst.find('.hand');
        
        h.val(ev).attr('data', ev);
        h.find('option').each(function() {
            $(this).attr('selected', this.value === ev);
        });
        
        setDropdownWidth(h, ev);
    }

    if (pos !== 'x') {
        let ev = expandPos(pos);
        let p = inst.find('.pos');
        
        p.val(ev).attr('data', ev);
        p.find('option').each(function() {
            $(this).attr('selected', this.value === ev);
        });
        
        setDropdownWidth(p, ev);
    }

    return inst;
}

/**
 * Expand a compressed comparison value to a full string
 * 
 * @param {String} val
 * @returns {String}
 */
function expandValue(val) {
    switch (val) {
        case 'R':
            return "Right Hand Card";
        case 'r':
            return "Right Hand Position";
        case 'L':
            return "Left Hand Card";
        case 'l':
            return "Left Hand Position";
        case 'i':
            return "Min Position";
        case 'a':
            return "Max Position";
        default:
            return val;
    }
}

/**
 * Convert a comparison code to the unicode symbol
 *  
 * @param {String} comp
 * @returns {String}
 */
function comparisonSymbol(comp) {
    switch (comp) {
        case "e":
            return "=";
        case "l":
            return "<";
        case "g":
            return ">";
        case "L":
            return "<=";
        case "G":
            return ">=";
        case "n":
            return "!=";
        default:
            return "x";
    }
}

/**
 * Get the hand code from the beginning of compressed code
 * 
 * @param {String} code
 * @returns {String} the hand code or 'x' if not set
 */
function getHandCode(code) {
    let c = code.charAt(0);

    switch (c) {
        case 'x':
        case 'r':
        case 'l':
            return c;
        default:
            return 'x';
    }
}

/**
 * Get the direction code from the beginning of compressed code
 * 
 * @param {String} code
 * @returns {String} the direction code or 'x' if not set
 */
function getDirectionCode(code) {
    let c = code.charAt(0);

    switch (c) {
        case 'x':
        case 'r':
        case 'l':
            return c;
        default:
            return 'x';
    }
}

/**
 * Get the text for a hand symbol
 * 
 * @param {String} hand
 * @returns {String}
 */
function expandHand(hand) {
    switch (hand) {
        case 'r':
            return 'Right Hand';
        case 'l':
            return 'Left Hand';
        default:
            return hand;
    }
}

/**
 * Get a hand position from the beginning of compressed code
 * @param {String} code
 * @returns {String} the position code/value, 'x' if not set
 */
function getPosCode(code) {
    let c = code.charAt(0);

    switch (c) {
        case 'r':
        case 'l':
        case 'i':
        case 'a':
        case 'x':
            // A preset value code
            return c;

        default:
            // Use a literal value
            let val = parseInt(code);

            // If there is no literal value, there was an error
            if (isNaN(val)) {
                return 'x';
            } else {
                // If the value is a number, return it as a String
                return '' + val;
            }
    }
}

/**
 * Get the text for a direction symbol
 * 
 * @param {String} dir
 * @returns {String}
 */
function expandDir(dir) {
    switch (dir) {
        case 'r':
            return 'Right';
        case 'l':
            return 'Left';
        default:
            return dir;
    }
}

/**
 * Get the position text for a position symbol
 * 
 * @param {String} pos
 * @returns {String}
 */
function expandPos(pos) {
    switch (pos) {
        case 'r':
            return 'Right Hand Position';
        case 'l':
            return 'Left Hand Position';
        case 'i':
            return 'Min Position';
        case 'a':
            return 'Max Position';
        default:
            return pos;
    }
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