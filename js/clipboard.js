/**
 * Copy all of the program instructions to the clipboard
 */
function copyInstructions() {
    let code = "";
    let line = 1;

    // Get each program instruction
    $('#program .instruction').each(function () {
        // Make a temporary copy of the instruction
        let c = $(this).clone();

        // Remove the dropdowns from the copy
        c.find('ul').remove();

        // Add the line number and instruction text to the output code
        code += line + '\t';
        code += (c.contents().text().trim().replace(/\s+/g, ' '));
        code += '\n';

        // increment the line number
        line++;
    });

    // Create a temporary text area to copy the code from
    var $temp = $("<textarea>");
    $("body").append($temp);

    // Add the code to the text area and select it
    $temp.val(code).select();

    // Copy the code to the clipboard
    document.execCommand("copy");

    // Remove the temporary text area
    $temp.remove();
}