/* global runState, cardValString */

var dealDirection = 0; // Default to random

/**
 * Deal the cards
 * 
 * @param {String|Number} hand the symbols of the cards to deal, in
 *                        order, or the number of random cards to
 *                        deal
 */
function deal(hand) {
    // Clear off the board
    $("#cardboard").empty();

    // Create table rows for cards, index display, and hand display
    let cardRow = $("<tr class='cards'/>");
    let indexRow = $("<tr/>");
    let handRow = $("<tr class='handRow'/>");

    // Add the rows to the board
    $("#cardboard").append(indexRow);
    $("#cardboard").append(cardRow);
    $("#cardboard").append(handRow);

    let deck = buildDeck(hand, dealDirection);

    // Pick a random suit
    runState.suit = "hdcs".charAt(Math.floor(Math.random() * 4));
    runState.numCards = deck.length;
    runState.maxCard = 0;

    // Loop through the cards in the deck
    for (let i = 0; i < deck.length; i++) {
        // Get the value and the symbol of the card
        let value = deck[i];
        let card = cardValString.charAt(deck[i]);

        if (value > runState.maxCard) {
            runState.maxCard = value;
        }

        if (deck.length < 13) {
            let cell = $("<td ondrop='dropCard(event)'" +
                    "ondragover='allowDropInstruction(event)'>" +
                    "<img src='cards/card-" + runState.suit + card +
                    ".png' class='card cardItem' value='" + value +
                    "' draggable='true' " +
                    "ondragstart='dragCard(event)'></td>");
            // Add the card to the board
            cardRow.append(cell);
        } else {
            let cell = $("<td ondrop='dropCard(event)'" +
                    "ondragover='allowDropInstruction(event)'>" +
                    "<span class='cardNum cardItem' " +
                    "value='" + value + "' draggable='true' " +
                    "ondragstart='dragCard(event)'>" +
                    value + "</span></td>");

            // Add the card to the board
            cardRow.append(cell);
        }

        // Add the index and hand displays
        let index = $("<th class='cardIndex'>" + i + "</th>");
        index.attr('width', (100 / (deck.length)) + "%");
        indexRow.append(index);
        handRow.append("<td class='handCell'></td>");
    }

    restartIt();

    // Add the cards to the window URL
    setURLCards(deck);

    // Make sure that the position values are all present
    fillPositionDropdowns();
    addDropdownHandlers();
}

/**
 * Build a deck from a given hand (string of chars representing card
 * values), or a random deck
 * 
 * @param {String} hand
 * @param {Number} direction -descending, 0 random, +ascending 
 * @returns {Array|buildDeck.deck}
 */
function buildDeck(hand, direction) {
    let deck = [];
    if (!direction) {
        direction = 0;
    }

    hand = hand || runState.numCards;

    if (typeof (hand) === 'number') {

        let offset = 1;

        if (hand < 9) {
            offset = 2;
        }

        // set the deck to (hand + 1) unshuffled cards
        if (direction === undefined || direction > 0) {
            for (let i = 0; i < hand + 1; i++) {
                deck.push(i + offset);
            }
        }
        else {
            for (let i = hand; i >= 0; i--) {
                deck.push(i + offset);
            }        
        }

        // shuffle the deck if it should be shuffled
        for (let i = 0; (direction === 0) && i < deck.length; i++) {
            let newPos = Math.floor(Math.random() * deck.length);

            let card = deck[i];
            deck[i] = deck[newPos];
            deck[newPos] = card;
        }

        // remove the last card from the deck
        deck.pop();
    } else {
        hand = hand.toLowerCase();
        for (let i = 0; i < hand.length; i++) {
            let card = cardValString.indexOf(hand.charAt(i));

            deck.push(card);
        }
    }

    return deck;
}

/**
 * Move one of the hands to a given position
 * 
 * @param {Number} hand the hand to move (0 = left, 1 = right)
 * @param {Number} pos the position for the hand to move to on the 
 *      board
 */
function moveHand(hand, pos) {
    // Constrain the hand to the board
    pos = Math.max(0, pos);
    pos = Math.min(runState.numCards - 1, pos);

    // Identify the hand to move and record its new location
    if (hand === 0) {
        hand = "lefthand";
        runState.lHand = pos;
    } else {
        hand = "righthand";
        runState.rHand = pos;
    }

    // Create html code to display hand
    let code = $("<div class='glyphicon glyphicon-hand-up handpos " + hand + "'></div>");

    // remove the hand from its current location
    $('.' + hand).remove();
    // Show the hand in its new location
    $($('.handCell')[pos]).append(code);

    return true;
}

/**
 * Shift one of the hands to the right or left
 * 
 * @param {Number} hand the hand to move (0 = left, 1 = right)
 * @param {Number} dir the direction to move (-1 = left, 1 = right)
 */
function shiftHand(hand, dir) {
    // Identify the direction to move
    if (dir < 0) {
        dir = -1;
    } else {
        dir = 1;
    }

    // Calculate where to move to
    let pos = 0;

    // Determine which hand to move
    if (hand === 0) {
        hand = "lefthand";

        // Determine where to move it, constrained to the board
        pos = runState.lHand + dir;
        if (pos >= 0 && pos < runState.numCards) {
            runState.lHand = pos;
        } else {
            alert("You tried to move the left hand off of the table.");
            return false;
        }
    } else {
        hand = "righthand";

        // Determine where to move it, constrained to the board
        pos = runState.rHand + dir;
        if (pos >= 0 && pos < runState.numCards) {
            runState.rHand = pos;
        } else {
            alert("You tried to move the right hand off of the table.");
            return false;
        }
    }

    // Create html code to display hand
    let code = $("<div class='glyphicon glyphicon-hand-up handpos " + hand + "'></div>");

    // remove the hand from its current location
    $('.' + hand).remove();
    // Show the hand in its new location
    $($('.handCell')[pos]).append(code);
    return true;
}

function ascending() {
    dealDirection = 1;
    
    setURLDealDirection(dealDirection);
    
    deal();
}

function descending() {
    dealDirection = -1;
    setURLDealDirection(dealDirection);
    deal();
}

function random() {
    dealDirection = 0;
    setURLDealDirection(dealDirection);
    deal();
}