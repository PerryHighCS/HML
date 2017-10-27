# HML
## An editor and interpreter for the Code.org Human Machine Language 

This is a tool for demonstration and testing of code written in the Code.org
Computer Science Principles Human Machine Language. This language is a very
low-level language, operating on the "bare-metal" of the "human machine". This
language is intended as an introduction to computer programming and algorithms
demonstrating the features required of a programming language (sequencing,
iteration, and selection) in a controlled environment; the canonical version
being an unplugged version using strips of paper for each of the instructions
that can be rearranged on a template.

## Cloning / Copying

This tool is designed to be served statically from a web server, it is being
served via GitHub pages at https://perryma.tk/HML

Simply cloning this repository to another GitHub pages site will give you
your very own copy.

## Usage

The interface is designed to be usable via web browser, with the possibility
of running on a SmartBoard style display. Instructions are added to the code
by dragging them from the tool palette and dropping them onto the program 
listing.

Instructions can be deleted by dragging them to the trash can. Double-clicking
on the trash can will delete all instructions.

Instructions can be copied by holding control while dragging and dropping 
them.

The Swap instruction can be added to the tool palette by adding ?swap to the
end of the url: https://perryma.tk/HML/?swap

As instructions are added to the program, the URL will update to include a
code parameter. This means that working programs (and programs in progress)
can be bookmarked in a web browser for easier demonstration.

Printing the page will only print the HML code.
