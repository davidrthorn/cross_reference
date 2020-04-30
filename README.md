<img src="/images/Panel_small.png" width="220px">

Cross Reference is an open source cross referencing add-on for Google Docs that automatically numbers elements such as figures and updates and formats in-text references to them. [Install]https://chrome.google.com/webstore/detail/cross-reference/hknkaiempgninehdhkgekoeoilkapgob?hl=en-GB).

## Short instructions

Create a label for a figure by writing the word 'figure' in the caption and then adding a hyperlink
to that word with the url `#figur_YOURCHOSENNAME`. Refer to this figure in your text by writing 'figure' again and
adding a hyperlink with `#fig_YOURCHOSENNAME`. Update the document via 'Add-ons->Cross Reference->Update document'.

## More detailed instructions

Cross Reference is built around two concepts: labels and references.

A label is always unique and is associated with a single figure (or table etc.); this is usually represented by text such as _figure 1_ in the figure caption.

A reference is usually in the text, and refers to a labelled figure (or table etc.). There can be many references to a single labelled entity.

To refer to, say, a figure you must create a label for it, usually in the caption. Cross Reference uses
hyperlinks to create labels. These have the following syntax: `#figur_population`. `#figur` is the built-in prefix used by Cross Reference; `population` in this case is your chosen name for the figure. Notice that the prefix uses `figur` rather than `figure` with an `e` -- all prefixes in Cross Reference are composed of a hash and a five-letter code, and separated from the name with an underscore.

To create this label, you simply need to create some dummy text and add the link. You don't need to add any numbering, as
this is taken care of by Cross Reference.
So in the caption you could add the word 'figure', highlight that word, goto 'Tools->Insert link' and add `#figur_population` as
the URL. (The dummy text will replaced by the add-on, so don't highlight text that you want to keep, such as other parts
of the caption.)

You now have a label that can be referred to. Creating references is similar to creating labels. First, create some dummy
text, such as the word 'figure' -- so you might write something like "for an example of this phenomenon, see figure". Again,
you don't need any numbering, as the add-on will take care of this. Now you need to apply another hyperlink, in this case to the word 'figure'. Reference syntax, however, is slightly
different; in our case, it will be `#fig_population`. This must be identical to the label hyperlink, except that the code is now `fig` not `figur` (reference codes always use the first three letters of the code used for labels.)

If you now goto the 'Add-ons->Cross Reference->Update document', your text should be replaced with a numbered label and
a reference with the same number.

Because Cross Reference replaces your dummy text, you can use a short word or even one letter, and you can also use the `Ctrl+K` shortcut to add the link. These two additions to the process should make things quicker.

## Not working?

Aside from bugs, the biggest source of user error is using label syntax for references or vice-versa. Labels and references
use a different code. If your references have nothing to refer to, make sure you created a label under you figure, not a
reference.

# This didn't work / I don't get it / how do I change the style of labels or references?

The wiki covers the use of Cross Reference in more depth, including customising labels and references. Please feel free to raise issues or ask questions!

[WIKI](https://github.com/davidrthorn/cross_reference/wiki/Cross-Reference-for-Google-Docs)
