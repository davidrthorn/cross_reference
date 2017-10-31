
//***** Set up add-on menu *****

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDocument')
    .addItem('Configure', 'showSidebar')
    .addItem('Create list of figures (beta)', 'createLof')
    .addToUi();
}

function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('sidebar').evaluate();
  var sb = ui.setTitle('Cross Reference');
  DocumentApp.getUi().showSidebar(ui);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}


//***** Code for labels and references *****

// Scan text element and return indices for references and labels

function findCrossLinks(type,text) {
  var textlength = text.getText().length;
  var indices = text.getTextAttributeIndices();
  var points = [];
  
  var starts =[];
  var ends = [];
  
  for (var i in indices) {
    points[i] = indices[i]
  }
  
  points.push(textlength);
  
  for (var i in points) {

    var index = points[i];

    if (index === textlength) {
      var ref = 'null';
    } else {
      var ref = String(text.getLinkUrl(index));
    }
    
    if (index > 0) {
      var ref_minus = String(text.getLinkUrl(index - 1));
    } else {
      var ref_minus = 'null';
    }

    var locations = crossCat(type,ref,ref_minus,starts,ends,index);
  }
  if (locations[0].length > locations[1].length) {
    var position = doc.newPosition(text.getParent().asParagraph(), 0);
    doc.setCursor(position);
    DocumentApp.getUi().alert('There was a problem scanning the paragraph starting \'' + 
                             text.getText().substr(0,30) + '...\'' +
                             '\n\nThe most likely explanation is that a reference or label changes formatting half way through,' +
                             '\nfor example becoming italicised mid-word. Please try using Docs\' clear formatting command' +
                             '\non the labels and references in this paragraph and running again. If this doesn\'t work, try' +
                             '\nremoving and reapplying the reference or label.')
    return
  }
  return locations
}

// Record the start and end points of references/labels within the paragraph
  
function crossCat(type,ref,ref_minus,starts,ends,index) {
  if (type === 1) {
    var position = 6
  } else {
    var position = 4
  }

  if (ref_minus != '#' && ref.charAt(0) === '#' && ref.charAt(position) === '_') {
      starts.push(index);
    } else if (ref.charAt(0) != '#' && ref_minus.charAt(0) === '#' && ref_minus.charAt(position) === '_') {
      ends.push(index - 1);
    }
  if (starts.length > ends.length) {
  }
  return [starts,ends]
}


// Determine this label number and advance counter accordingly

function labelCount(code,counter) {
  if (counter[code]) {
    var number = counter[code];
  } else {
    var number = 1
  }
  counter[code] = number + 1;
  
  return number
}

// Generate the text that will be used to replace the reference/label, including the number

function determineReplaceText(text,start,code,number,props) {
  
  var text_format = props[code][0]
  
  var first_letter = text_format.charAt(0)
  
  var captest = smartCapitals(text,start);

  if (first_letter === first_letter.toUpperCase() || captest) {
    var replacement = first_letter.toUpperCase() + text_format.substr(1,text_format.length) + number
  } else {
    var replacement = text_format + number
  }

  return replacement
}

// Style the text of the reference/label

function determineAttributes(text,start,code,props,error) {
  var current = text.getAttributes(start);
  var replacements = {};
  
  for (var i in current) {
    replacements[i] = current[i];
  }

  replacements['BOLD'] = props[code][1];
  replacements['ITALIC'] = props[code][2];
  replacements['UNDERLINE'] = props[code][3];
  
  return replacements;
}


// Replace the existing cross link with the new one

function replaceCrossLink(text,start,end,code,number,attributes,props) {
  
  var reptext = determineReplaceText(text,start,code,number,props);

  text.deleteText(start, end);
  text.insertText(start, reptext);  
  text.setAttributes(start, start + reptext.length - 1, attributes);
  text.setForegroundColor(start, start + reptext.length - 1, null)
}


// Determine the capitalisation of references/labels based on the text around them. Not applicable when references or labels are styled to always be capitalised.

function smartCapitals(origtext,start) {
  
  var text = origtext.getText();
  
  var backone = text.charAt(start - 1);
  var backtwo = text.charAt(start - 2);
  var backthree = text.charAt(start - 3);
  var backfour = text.charAt(start - 4);
  var backfive = text.charAt(start - 5);
  var backsix = text.charAt(start - 5);
  
  var cap_punc = ['.','!','?',':','”']
  
  if (backone === '\r') {
        return true
      }
 
  if (backone) {
    
    if(backone === '(') {
      if (cap_punc.indexOf(backthree) != -1 && backfive != '.') {
        return true
      } else if (backthree === '”' && backsix != '.') {
        return false
      }
      return false
     }

    if (cap_punc.indexOf(backtwo) === -1) {
      return false
    } else {
      
      if (backtwo === '”') {
        if (backthree === "’") {
          return false
        }
        if (cap_punc.indexOf(backthree) != -1 && backfive === '.') {
          return false
        }
        return true
      }
      
      if (backfour === '.') {
        return false
      }
  
      return true
      }
    } else {
    return true
  }
}


// Above functions feed into the main paragraph sweep and replace...

// Sweep paragraphs and update

function sweepParagraphs(paragraphs,type,pairings,counter,props) {

  for (var i in paragraphs) {
    
    var paragraph = paragraphs[i]
    
    for (var j = 0;j < paragraph.getNumChildren();j++) {
      if (paragraph.getChild(j).getType() == "TEXT") {
        var text = paragraph.getChild(j).asText();

        var locations = findCrossLinks(type,text);
        if (!locations) {
          return 'format'
        }
        
        var starts = locations[0];
        var ends = locations[1];

        // Zoom into individual label and process
        if (starts) {
          for (var i = starts.length - 1; i >= 0; i--) {         
            var start = starts[i];
            var end = ends[i];
            var url = text.getLinkUrl(start);
            var code = url.substr(1,3);
                     
            if (type === 1) {
              var lab_code = url.substr(1,5);
              var number = labelCount(code,counter);
              var name = url.substr(7,url.length);
              
              // Error handling for labels
              
              if (Object.keys(props).indexOf(lab_code) === -1) {
                  text.setForegroundColor(start, end, '#FF0000');
                  var position = doc.newPosition(paragraph.getChild(j), start);
                  doc.setCursor(position);
                
                  return lab_code
                } else if (Object.keys(pairings).indexOf(code + 'N' + name) != -1) {
                  text.setForegroundColor(start, end, '#FF0000');
                  var position = doc.newPosition(paragraph.getChild(j), start);
                  doc.setCursor(position);
                  
                  return url
                }
              
              pairings[code + 'N' + name] = number;
              
              var attributes = determineAttributes(text,start,lab_code,props);
              replaceCrossLink(text,start,end,lab_code,number,attributes,props);
            } else {
              var name = url.substr(5,url.length);
              var number = pairings[code + 'N' + name];
              
              // Error handling for references
              if (number === undefined) {
                text.setForegroundColor(start, end, '#FF0000');
                var position = doc.newPosition(paragraph.getChild(j), start);
                doc.setCursor(position);
                
                return 'missrefs'
              }
              
              var attributes = determineAttributes(text,start,code,props);
              replaceCrossLink(text,start,end,code,number,attributes,props);
            }
          }
        }
      } 
    }
  }
  return pairings
}

// ********* Update Document *********

// This function sweeps the main text for labels, then for references, and then sweeps the footnotes for references

function updateDocument() {
  doc = DocumentApp.getActiveDocument();
  var paragraphs = doc.getBody().getParagraphs();
  var footnotes = doc.getFootnotes();
  var docProps = PropertiesService.getDocumentProperties().getProperties();
  var userProps = PropertiesService.getUserProperties().getProperties();
  
  // counter for label numbering
  var counter = {};
  
  // storage for the numbers assigned to each name
  var pairings = {};
  
  
  // Retrieve stored configuration and process
  
  var labprops = retrieveStoredLabs(docProps,userProps);
  var refprops = retrieveStoredRefs(docProps,userProps);
  
  var final_pairings = sweepParagraphs(paragraphs,1,pairings,counter,labprops);
  
  // Error handling from first sweep
  
  if (final_pairings === 'format') {

    return 'error'
  } else if (typeof final_pairings === 'string' && final_pairings.charAt(0) === '#') {
    DocumentApp.getUi().alert('There are two labels with the code ' + final_pairings + '.' +
                              "\n\nLabel codes must be 5 letters and label names (e.g. '" + final_pairings.substr(7,final_pairings.length) + "') must be unique.");
    return 'error'

  } else if (typeof final_pairings === 'string') {
    DocumentApp.getUi().alert('The label code #' + final_pairings + ' was not recognised.' +
                              '\nIt might be a typo or it might be a custom label you' +
                              '\nhave not yet added in the configuration sidebar.');
    return 'error'
  } 
  
  // Second sweep of text body to update references
  var error = sweepParagraphs(paragraphs,2,final_pairings,counter,refprops);
  
  if (error === 'format') {return 'error'}
  
  // Sweep footnotes to update references
  for (var i in footnotes) {
    var fnparagraphs = footnotes[i].getFootnoteContents().getParagraphs();
    var error = sweepParagraphs(fnparagraphs,2,final_pairings,counter,refprops);
  }
  
  if (error === 'format') {return 'error'}
  
  // Produce applicable error messages
  if (error === 'missrefs') {
    DocumentApp.getUi().alert('The reference highlighted in red has nothing to refer to.' +
                           '\nIt might contain a typo or the corresponding label might be missing.')
    return 'error'
  }
}




// ********* Storage and retrieval of user/document settings *********


// Retrieves label properties from document and user stores

function retrieveStoredLabs(docProps,userProps) {
  
  var labprops = {
    figur:['Figure ',null, null,null],
    table:['Table ',null,null,null],
    equat:['Equation ',null,null,null]
    }
  
  for (var i in userProps) {
    if (i.substr(0,5) === 'cross') {
      var pstring = userProps[i];
      var individual = pstring.split('_');
      var code = individual[0]
      labprops[code] = individual.slice(2,6);
      PropertiesService.getDocumentProperties().setProperty(code, pstring)
      var propstored = true;
    }
  }
  
  for (var i in docProps) {
    if (i.substr(0,5) === 'cross') {
      var pstring = docProps[i];
      var individual = pstring.split('_');
      var code = individual[0]
      labprops[code] = individual.slice(2,6)
      var propstored = true;
    }
  }
  return labprops
}

// Retrieves reference properties from document and user stores

function retrieveStoredRefs(docProps,userProps) {

  var refprops = {
      fig:['figure ',null, null,null],
      tab:['table ',null,null,null],
      equ:['equation ',null,null,null]
    }
  
  for  (var i in docProps) {
    if (i.substr(0,5) === 'cross') {
      var code = i.substr(6,9);
      var pstring = docProps[i];
      var individual = pstring.split('_');
      refprops[code] = individual.slice(6,10)
      var propstored = true;
    }
  }
  
  for  (var i in userProps) {
    if (i.substr(0,5) === 'cross') {
      var code = i.substr(6,9);
      var pstring = userProps[i];
      var individual = pstring.split('_');
      refprops[code] = individual.slice(6,10);
      PropertiesService.getDocumentProperties().setProperty(code, pstring)
      var propstored = true;
    }
  }
  return refprops 
}
