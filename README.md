<img src="/images/Panel_small.png" width="220px">

# Cross Reference for Google Docs

Cross Reference is a free Google Docs add-on that allows users to label equations, figures and tables and then refer to them within the text body. The add-on takes care of numbering these elements and updating labels and references to match. It also allows users to choose the text and style of their labels and references.

## Installation

Cross Reference is available free of charge in the Google Add-ons store, which can be accessed from within an open Google Document. From the *Add-ons* menu, go to *Get add-ons...* and search for 'Cross Reference'. Click on the blue *Free* button in the Cross Reference panel to install the add-on. Once installed, Cross Reference will appear in the *Add-ons* menu.

## Usage
### What does Cross Reference do?

At its core, Cross Reference does two things: 1) automatically numbers and styles labels for equations, figures and tables; 2) updates in-text references accordingly. This means that if you add elements, delete them, or change their order, you don't have to go through the text manually relabelling them and changing all references accordingly.

### What are labels and references?

#### Labels

An example of a label would be *Figure 1* written below a graph in a document. Labels are unique--there can only be a single figure 1, namely the first figure in a document.

Cross Reference scans the document for labels and numbers them sequentially based on their position in the document. So if there are three figures in a document, Cross Reference numbers them 1, 2, and 3 as it goes down through the document. If you moved the second figure in your document to the beginning, Cross Reference would detect this and relabel it *figure 1* instead of *figure 2*.

Cross Reference also applies your choice of text and style to labels. For example, you might choose to format figure labels as Figure 1, *Fig. 1* or FIGURE-1.

#### References

References are contained in the body of the text and they refer to labelled elements such as figures. There can be many references to the same element within the text. Cross Reference scans the document for references and updates them with the correct number for the element they refer to, as well as applying your chosen formatting.

| **Label** | **Reference** |
|------|------|
| <img src="/images/figur.png" width="400px"> | <img src="/images/fig.png" width="400px"> |

### How do I create labels and references?

Cross Reference needs to be told that a piece of text is a label or a reference. This is done using Docs' hyperlink function. Instead of adding a web address, you will use special code to indicate a label or a reference, followed by an underscore, followed by the name of the element.

Names are left up to you, but it's best to use meaningful names, rather than numbers. For example, a graph showing the height distribution of a population could be called 'height'.

Names are joined to Cross Reference codes. Cross Reference uses two codes, one for labels and one for references. The code for an equation label is `#equat`; for a figure it's `#figur`; for a table it's `#table`. (Notice that the code for a figure is not `#figure` with an 'e' because label codes in Cross Reference are 5 letters long.) This code is followed by an underscore and then the name. For our figure called 'height', the complete label identifier would be `#figur_height`.

So to create a label for our graph of height distribution, we take the following steps:

1. Insert some text below the 'height' graph. Whatever text you use will be replaced, so you can just use the word 'height'.
2. Highlight this text, making sure not to highlight any spaces either side.
3. Add a hyperlink with Ctrl+K on Windows or ⌘+K on Mac (or go to the *Insert* menu and choose *Link*).
4. In the pop-up box, enter `#figur_height` as the link URL.

We have now created a label for our graph, which should appear as a link (blue and underlined).

We can now refer to our graph in the text. To do this, follow exactly the same steps, but use the reference code. This code is the first three letters of the label code. So for equations, the code is `#equ`; for figures it's `#fig`; for tables it's `#tab`. A reference to the graph called 'height' would be a link with the URL `#fig_height`.

You should never create two labels with the same name, but you can create as many references as you want for the same element.

### Updating the document

Cross Reference works by scanning the document and replacing labels and references with the right text and styling. It does not automatically update the document. To update the document, go to *Add-ons*→*Cross Reference*→*Update document*. Cross Reference will update labels with the right text and with a number corresponding to their position in the text. It will then scan for references in the text and update them with the right text and the appropriate number.

>Labels and references are only paired if the correct code is used and the names match, so be careful of typos. Cross Reference will try to detect mistakes, such as references without corresponding labels, but it is not perfect.

Following our example of a graph of height distribution (see above), the word 'height' that we highlighted and turned into a label should now read 'Figure 1', assuming it was the first figure in the document. The references should read the same. If we were to insert a new figure at the beginning of the document and then update the document in the Cross Reference menu, our height distribution graph would now be labelled 'Figure 2' and its references would match this.

## Configuration

### The sidebar

Cross Reference allows users to customise the text and formatting of current labels and references, as well as add new pairs of labels and references. This is done from the sidebar, which is accessed by going to *Add-ons*→*Cross Reference*→*Configuration*.

The configuration screen provides text boxes and formatting buttons to change the characteristics of labels and references. It provides a preview box showing how the text will appear.

>You must enter a space after label or reference text in order for a space to appear between the text and the number. If you enter lower case text for labels or references, Cross Reference will look to the preceding text in the document to determine whether to capitalise. If you enter capitalised text, labels and references will be capitalised at all times.

#### Documents and defaults

When the document is updated or the sidebar opened, Cross Reference saves the current settings for the document. Any changes you make in the sidebar are reflected in the document settings when you save and apply them.

You can also save settings for use in other documents using the 'save defaults' button. Every new document you open will use these settings. Changing defaults will not affect documents that already have document settings associated with them. To restore defaults in a document that already has settings, use the 'restore defaults' option in the sidebar.

#### The custom screen

On the right hand side of the box at the top of the sidebar, next to the name of the current label/reference, is a plus sign that is used to access the custom screen. Here, you can enter the details of a new label/reference pair. There are a few restrictions on what can be added:

1. The label code must be 5 letters and the first three letters of it must not already be used in an existing pair. Cross Reference will let you know if these rules are violated and will not let you save invalid settings.
2. The reference code cannot be customised. It is simply the first three letters of the label code.
3. Label and reference codes cannot be changed after the pair is created. Everything else, except the name, can be changed later on. To change label and reference codes you have to make a new pair.

You can delete custom pairs using the red cross next to their name in the sidebar top menu. You can't delete equation, figure or table, however.

Custom pairs are automatically saved in the user settings and will be available in new documents. However, if you delete a pair and it is used by an existing document, it will still be available and function in that existing document.

## List of figures (experimental!)

Cross Reference can create a list of figures akin to Docs' own table of contents. This feature is found under *Add-ons*→*Cross Reference*→*List* of figures It inserts the list at the cursor or updates the existing list. The list of figures uses the label text of a normal label and numbers figures in the same way.

>**Technical**: The list of figures feature is pretty slow. This is because Docs does not provide a way to access page numbers. The only way to obtain the page numbers for figures is to export the whole document as a PDF, then to process it using the JavaScript library PDF.js. Since PDFs are complex documents, this takes a long time. Your documents are **not** exported to an external server; they are by the JavaScript contained in the dialogue that pops up when the feature is used.

Since this feature is relatively slow, it is recommended to generate lists of figures only when necessary (e.g. before printing) and not to update them every time a figure is added.

There are a couple of things that can cause the list of figures to be inaccurate. The main one is reformatting. If, for example, you resize the text in the list of figures, you may well end up pushing content below downwards. This could push figures onto a new page somewhere. One way to avoid this is to insert lists of figures on their own page (i.e. followed by a page break). This will allow some room for reformatting.
