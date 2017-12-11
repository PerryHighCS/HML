/* global clipboard */

/**
 * Copy all of the program instructions to the clipboard
 */
function copyInstructions() {
    let title = $('#pgmTitle').prop('value');
    let code = title + "\r\n";
    let line = 1;
    
    // Get each program instruction
    $('#program .instruction').each(function () {
        // Make a temporary copy of the instruction
        let c = $(this).clone();

        // Remove the dropdowns from the copy
        let dd = c.find('select');
        dd.each(function () {
            let optionText = $(this).children(':selected').text();
            
            let span = $('<span>');
            span.text(optionText);
            
           $(this).replaceWith(span);
        });
        
        // Add the instruction text to the output code
        code += line + '\t';
        code += (c.contents().text().trim().replace(/\s+/g, ' '));
        code += '\r\n';

        // increment the line number
        line++;
    });

    let html = $('<table>');
    let serialized = "";
    line = 1;
    
    // Get each program instruction
    $('#program .instruction').each(function () {
        // add a row to the table
        let row = $('<tr>');
        html.append(row);
        
        // append the line number
        row.append(($('<th>').text(line)));
        
        // Make a temporary copy of the instruction
        let c = $(this).clone();

        // Remove the dropdowns from the copy
        let dd = c.find('select');
        dd.each(function () {
            let optionText = $(this).children(':selected').text();
            
            let span = $('<span>');
            span.text(optionText);
            
           $(this).replaceWith(span);
        });
        
        // Add the instruction text to the output code
        row.append($('<td>').text(c.contents().text().trim().replace(/\s+/g, ' ')));
        
        // Convert the program instruction into serialized code
        serialized += instToCode($(this));
        
        // increment the line number
        line++;
    });
    
    // Add a header row
    let row = $('<tr>');
    html.prepend(row);
    td = $('<th>').prop('colspan', 2);
    td.css('border-bottom', '1px solid black');
    
    // Add the program title to the header
    let h = $('<h1>');
    h.text(title);
    td.append(h);
    
    // Add a link to run the program to the header
    let p = $('<p>');
    let a = $('<a>');
    a.prop("href", window.location);
    a.text(serialized + "\u00a0\u27a4");
    td.append(p);
    row.append(td);
    p.append(a);

    // Copy the plain text and html to the clipboard
    var dt = new clipboard.DT();
    dt.setData("text/plain", code);
    dt.setData("text/html", html.prop('outerHTML'));    
    clipboard.write(dt);
}
