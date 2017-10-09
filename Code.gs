function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDocument')
    .addItem('Configure', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Configure cross referencing');
  DocumentApp.getUi().showSidebar(ui);
}



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
    DocumentApp.getUi().alert('There was a problem scanning the paragraph starting\n\n"' + 
                             text.getText().substr(0,60) + '..."' +
                             '\n\nThe most likely explanation is that a reference or label changes '+
                             'formatting half way through. Please try using Docs\' "clear formatting" command'
                             + ' on the labels and references in this paragraph and running again.' + 
                               "\n\nIf this doesn't work, try removing and reapplying the reference link.")
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

  if (!props[code]) {
    return text.getLinkUrl(start).substr(0,6);
  }

  replacements['BOLD'] = props[code][1];
  replacements['ITALIC'] = props[code][2];
  replacements['UNDERLINE'] = props[code][3];
  
  return replacements;
}


// Replace the existing cross link with the new one

function replaceCrossLink(text,start,end,code,number,attributes,props,error) {
  
  var reptext = determineReplaceText(text,start,code,number,props);

  text.deleteText(start, end);
  text.insertText(start, reptext);
  
  text.setAttributes(start, start + reptext.length - 1, attributes);
  if (error === code) {
    text.setForegroundColor(start, start + reptext.length - 1, '#FF0000')
  } else {
  text.setForegroundColor(start, start + reptext.length - 1, null)
  }
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


// Above function feed into the main paragraph sweep and replace...

// Sweep paragraphs and update

function sweepParagraphs(paragraphs,type,pairings,counter,props) {
  var error = ''
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
              var number = labelCount(code,counter);
              var name = url.substr(7,url.length);
              pairings[code + 'N' + name] = number;
            } else {
              var name = url.substr(5,url.length);
              var number = pairings[code + 'N' + name];
              if (number === undefined) {
                var error = code;
              }
            }
            
            // Replacement

            var attributes = determineAttributes(text,start,code,props);
            if (typeof attributes === 'string') {
              return attributes
            }
            replaceCrossLink(text,start,end,code,number,attributes,props,error)
          }
        }
      } 
    }
  }
  if(error) {
    return error
  } else {
  return pairings
  }
}

// ********* Update Document *********

// This function sweeps the main text for labels, then for references, and then sweeps the footnotes for references

function updateDocument() {
  var doc = DocumentApp.getActiveDocument();
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
  
  if (final_pairings === 'format') {
    return
  } else if (typeof final_pairings === 'string') {
      DocumentApp.getUi().alert('The label code ' + final_pairings + ' was not recognised.' +
                                '\n\nIt could be a typo...' +
                                '\n\n...but if you want to use it as a new label,' +
                                '\nyou can add it to Cross Reference using the sidebar.');
      return
  }
  
  // Second sweep of text body to update references
  var error = sweepParagraphs(paragraphs,2,final_pairings,counter,refprops);
  
  if (error === 'format') {return}
  
  // Sweep footnotes to update references
  for (var i in footnotes) {
    var fnparagraphs = footnotes[i].getFootnoteContents().getParagraphs();
    var error = sweepParagraphs(fnparagraphs,2,final_pairings,counter,refprops);
  }
  
  if (error === 'format') {return}
  
  // Produce applicable error messages
  if (typeof error === 'string') {
    DocumentApp.getUi().alert("Some in-text references have nothing to refer to." +
                           "\n\nYou probably either deleted a label and didn't remove" +
                           " the relevant cross\nreferences, or there is a typo in the reference.\n" +
                           "Remember, figures are labelled 'figur' without the last 'e'." +
                           "\n\nOrphaned references have been highlighted. Once fixed, use Docs'" +
                           "\n'clear formatting' command to remove highlighting.");
  }
}




// ********* Storage and retrieval of user/document settings *********


// Retrieves label properties from document and user stores

function retrieveStoredLabs(docProps,userProps) {
  
  var labprops = {};
  
  labprops = {
      fig:['figure ',null, null,null],
      tab:['table ',null,null,null],
      equ:['equation ',null,null,null]
    }
  
  for  (var i in docProps) {
    if (i.substr(0,5) === 'cross') {
      var code = i.substr(6,9);
      var pstring = docProps[i];
      var individual = pstring.split('_');
      labprops[code] = individual.slice(2,6)
      var propstored = true;
    }
  }
  
  if (!propstored) {
    for  (var i in userProps) {
      if (i.substr(0,5) === 'cross') {
        var code = i.substr(6,9);
        var pstring = userProps[i];
        var individual = pstring.split('_');
        labprops[code] = individual.slice(2,6);
        PropertiesService.getDocumentProperties().setProperty(code, pstring)
        var propstored = true;
      }
    }
  }
  return labprops
}

// Retrieves reference properties from document and user stores

function retrieveStoredRefs(docProps,userProps) {

  var refprops = {};
  
  refprops = {
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
  
  if (!propstored) {
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
  }
  return refprops 
}



//********* Sidebar interaction *********


// Updates user/document properties based on user input in side panel

function updateProps(temp_settings) {
  
  var docProps = PropertiesService.getDocumentProperties();
  var getProps = docProps.getProperties()
  
  for (var i in getProps) {
    if (i.substr(0,6) === "cross_") {
      docProps.deleteProperty(i)
    }
  }
  
  for (var i in temp_settings) {
    var setting = temp_settings[i];
    var code = setting[0].substr(0,3);
    
    var pkey = 'cross_' + code;
    var pvalue = '';
    for (var j = 0; j < (setting.length - 1); j++) {
      pvalue += setting[j] + '_'
    }
    pvalue += setting[setting.length - 1];
    docProps.setProperty(pkey, pvalue);
  }
  
  updateDocument();
}


// Retrieves user settings to feed to sidebar on open

function getSettings() {
  
  var docProps = PropertiesService.getDocumentProperties();
  var userProps = PropertiesService.getUserProperties();
  
  var dprops = docProps.getProperties();
  var uprops = userProps.getProperties();
  
  var settings = {};
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null';
  
  for (var i in uprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = uprops[i];
    }
  }
  
  for (var i in dprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = dprops[i];
    }
  }

  return settings
}

// Stores settings as default


function storeDefault(temp_settings) {
  
  var user_props = PropertiesService.getUserProperties();
  
  for (var i in temp_settings) {
    var settings = temp_settings[i];
    storePairing(user_props, settings)
  }
}

function storeCustom(custom_settings) {
  
    var user_props = PropertiesService.getUserProperties();
    storePairing(user_props, custom_settings);
}

function storePairing(user_props, settings) {
  
    var code = settings[0].substr(0,3);
    
    var pkey = 'cross_' + code;
    var pvalue = '';
  
    for (var j = 0; j < (settings.length - 1); j++) {
      pvalue += settings[j] + '_'
    }
  
    pvalue += settings[settings.length - 1];
    user_props.setProperty(pkey, pvalue);
}


// Feeds default settings to sidebar to be applied

function restoreDefault() {
  var userProps = PropertiesService.getUserProperties();
  var uprops = userProps.getProperties();
  
  var settings = {};
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null';
  
  for (var i in uprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = uprops[i];
    }
  }
  return settings
}


// Removes pairings from user settings

function removePair(ref) {
  PropertiesService.getUserProperties().deleteProperty("cross_" + ref);
  PropertiesService.getDocumentProperties().deleteProperty("cross_" + ref);
}

//***** For testing only *****

function clearProps() {
  PropertiesService.getUserProperties().deleteAllProperties()
  PropertiesService.getDocumentProperties().deleteAllProperties()
}

function showProps() {
  Logger.log(PropertiesService.getUserProperties().getProperties());
  Logger.log(PropertiesService.getDocumentProperties().getProperties());
  }
