# Cross Reference for Google Docs

Cross Reference is a free Google Docs add-on that allows users to label equations, figures and tables and then refer to them within the text body. The add-on takes care of numbering these elements, updating labels and references automatically. It also allows users to choose the text and style of their labels and references.

## Installation

Cross Reference is available free of charge in the Google Add-ons store, which can be accessed from within an open Google Document. From the *Add-ons* menu, go to *Get add-ons...* and search for 'Cross Reference'. Click on the blue *Free* button in the Cross Reference panel to install the add-on. Once installed, Cross Reference will appear in the *Add-ons* menu.

## Usage
### What does Cross Reference do?

At its core, Cross Reference does two things: 1) automatically numbers and styles labels for equations, figures and tables; 2) updates in-text references accordingly. This means that if you add elements, delete them, or change their order, you don't have to go through the text manually changing all references to those elements.

### What are labels and references?

#### Labels

An example of a label would be *Figure 1* written below a graph in a document. Labels are unique--there can only be a single figure 1, namely the first figure in a document.

Cross Reference scans the document for labels and numbers them sequentially based on their position in the document. So if there are three figures in a document, Cross Reference numbers them 1, 2, and 3 as it goes down through the document. If you moved the second figure in your document to the beginning, Cross Reference would detect this and relabel it *figure 1* instead of *figure 2*.

Cross Reference also applies the user's choice of text and style to labels. For example, you might choose to format figure labels as Figure 1, *Fig. 1* or FIGURE-1.

#### References

References are contained in the body of the text and they refer to labelled elements such as figures. There can be many references to the same element within the text. Cross Reference scans the document for references and updates them with the correct number for the element they refer to, as well as applying your chosen formatting.

### How do I create labels and references?

Cross Reference needs to be told that a piece of text is a label or a reference. This is done using Docs' hyperlink function. Instead of adding a web address, you will use special code to indicate a label or a reference, followed by an underscore, followed by the name of the element.

Names are left up to you, but it's best to use meaningful names, rather than numbers. For example, a graph showing the height distribution of a population could be called 'height'.

Names are joined to Cross Reference codes. Cross Reference uses two codes, one for labels and one for references. The code for an equation label is `#equat`; for a figure it's `#figur`; for a table, it's `#table`. (Notice that the code is not figure with an 'e' because label codes in Cross Reference are 5 letters long.) This code is followed by an underscore and then the name. For our figure called 'height', the complete label identifier would be `#figur_height`.

So to create a label for our graph of height distribution, we take the following steps:

1. Insert some text below the 'height' graph. Whatever text you use will be replaced, so you can just use the word 'height'.
2. Highlight this text, making sure not to highlight any spaces either side.
3. Add a hyperlink with Ctrl+K on Windows or ⌘+K on Mac (or go to the *Insert* menu and choose *Link*).
4. In the pop-up box, enter `#figur_height` as the link URL.

We have now created a label for our graph, which should appear as a link (blue and underlined).

We can now refer to our graph in the text. To do this, follow exactly the same steps, but use the reference code. This code is the first three letters of the label code. So for equations, the code is `#equ`; for figures, it's `#fig`; for tables it's `#tab`. A reference to the graph called 'height' would be a link with the URL `#fig_height`.

You should never create two labels with the same name, but you can create as many references as you want for the same element.

### Updating the document

Cross Reference works by scanning the document and replacing labels and references with the right text and styling. It does not automatically update the document. To update the document, go to *Add-ons*→*Cross Reference*→*Update document*. Cross Reference will update labels with the right text and with a number corresponding to their position in the text. It will then scan for references in the text and update them with the right text and the appropriate number.

**Labels and references are only paired if the correct code is used and the names match, so be careful of typos. Cross Reference will try to detect mistakes, such as references without corresponding labels, but it is not perfect.**

Following our example of a graph of height distribution (above), the word 'height' that we highlighted and turned into a label should now read 'figure 1', assuming it was the first figure in the document. The references should read the same. If we were to insert a new figure at the beginning of the document and then update the document in the Cross Reference menu, our height distribution graph would now be labelled 'figure 2' and its references would match this.
