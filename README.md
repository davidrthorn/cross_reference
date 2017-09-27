# Cross Reference for Google Docs

Cross Reference is a free add-on for Google Docs that allows users to label elements such as tables and figures, and then updates in-text references to those elements with the right number, text and formatting. Users can customise the text and the style of the text for labels and references.

*Version 2 of Cross Reference will allow users to create their own label/reference pairings, which they can use to reference equations, sections, chapters and so on.*

## Installation

Cross Reference is available free of charge in the Google Add-ons store, which can be accessed from within an open Google Document. From the *Add-ons* menu, go to *Get add-ons...* and search for 'Cross Reference'. Click on the blue *Free* button in the Cross Reference panel. Once installed, Cross Reference will appear under the *Add-ons* menu.

## Usage
### What it does

At its core, Cross Reference does two things: 1) it formats labels applied to figures and tables; 2) it updates in-text references to those figures and table so that they refer to the right thing.

**Labels:** An example of label in Cross Reference would be *Figure 1* written below a graph in a document. Labels are unique, since there can only be a single figure 1.

**References:** References are contained in the body of the text and they refer to labelled elements such as figures. There can be many references to the same figure within the text.

Cross Reference detects labels and references in a document. It numbers labels sequentially based on their position in the text. So if there are three figures in a document, Cross Reference labels them 1, 2, and 3 as it goes down through the document. It then looks for references in the text and changes them to match their labels.

For example, suppose that you moved the second figure in your document to the beginning. Cross Reference would detect this and renumber it as figure 1. It would then find all references to that figure in the text and change them to refer to that figure as figure 1, not figure 2.

Cross Reference also applies the user's choice of text and style to labels and references. For example, users might choose to label figure 1 as Figure 1 or as *Fig. 1*.

### Creating labels and references

Cross Reference needs to be told that a piece of text is a label or a reference. This is done using Docs' hyperlink function. Instead of adding a web address, you will use special code to indicate a label or a reference along with the name of the figure or table. Cross Reference uses two codes, one for labels and one for references. The user chooses the names. It's best to use meaningful names, rather than numbers. For example, a graph showing the heights of a group of people could be called 'heights'.

The code for a figure label is `#figur`; for a table, it's `#table`. (Notice that the code is not figure with an 'e' because label codes in Cross Reference are 5 letters long.) This code is followed by an underscore and then the name. For our figure called 'heights', the complete label identifier would be `#figur_heights`.

To create a label for our graph of people's heights, we take the following steps:

1. Insert some text below the heights graph. Whatever text you use will be replaced, so you can just use the word 'heights'.
2. Highlight this text, making sure not to highlight any spaces either side.
3. Add a hyperlink with Ctrl+K on Windows or ⌘+K on Mac (or go to the *Insert* menu and choose *Link*).
4. In the pop-up box, enter `#figur_heights` as the link url.

We have now created a label for our graph, which should appear as a link (blue and underlined).

We can now refer to our graph in the text. To do this, follow exactly the same steps, but use the reference code. This code is the first three letters of the label code. So for figures, the code is `#fig` and for tables it's `#tab`. A reference to the graph called 'heights' would be a link with the url `#fig_heights`.

### Updating the document

Cross Reference works by scanning the document and replacing labels and references with the right text and styling. It does not automatically update the document. To update the document, go to *Add-ons*→*Cross Reference*→*Update document*. Cross Reference will update labels with the right text and with a number corresponding to their position in the text. It will then scan for references in the text and update them with the right text and the appropriate number.

**Labels and references are only paired if the correct code is used and the names match, so be careful of typos. Cross Reference will try to detect mistakes, such as references without corresponding labels, but it is not perfect.**

Following our example of a graph of heights (above), the word 'heights' that we highlighted and turned into a label should now read 'figure 1', assuming it was the first figure in the document. The references should read the same. If we were to insert a new figure at the beginning of the document and then update the document in the Cross Reference menu, our heights graph would now be labelled 'figure 2' and its references would match this.
