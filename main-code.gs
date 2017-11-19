
function onInstall(e) {
  onOpen(e)
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDocument')
    .addItem('Configure', 'showSidebar')
    .addItem('Create list of figures (beta)', 'createLoF')
    .addToUi()
}

function showSidebar() {
  var sidebar = HtmlService.createTemplateFromFile('sidebar').evaluate();
  sidebar.setTitle('Cross Reference');
  DocumentApp.getUi().showSidebar(sidebar);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function updateDocument() {
  doc = DocumentApp.getActiveDocument();
  var paragraphs = doc.getBody().getParagraphs(),
      footnotes = doc.getFootnotes(),
      document_properties = PropertiesService.getDocumentProperties().getProperties(),
      user_properties = PropertiesService.getUserProperties().getProperties(),
      label_properties = getStoredLabelSettings(document_properties,user_properties),
      reference_properties = getStoredReferenceSettings(document_properties,user_properties);
  
  var counter = {},  // counter for label numbering
      pairings = {}; // storage for the numbers assigned to each name
  
  var final_pairings = sweepParagraphs(paragraphs,1,pairings,counter,label_properties);
  
  // Error handling from first sweep 
  if (final_pairings === 'format') {
    return 'error';
  } else if (typeof final_pairings === 'string' && final_pairings.charAt(0) === '#') {
    DocumentApp.getUi().alert('There are two labels with the code ' + final_pairings + '.' +
                              "\n\nLabel codes must be 5 letters and label names (e.g. '" +
                              final_pairings.substr(7, final_pairings.length) + "') must be unique.");
    return 'error';

  } else if (typeof final_pairings === 'string') {
    DocumentApp.getUi().alert('The label code #' + final_pairings + ' was not recognised.' +
                              '\nIt might be a typo or it might be a custom label you' +
                              '\nhave not yet added in the configuration sidebar.');
    return 'error';
  }
  
  // Second sweep
  var error = sweepParagraphs(paragraphs,0,final_pairings,counter,reference_properties);
  
  if (error === 'format')  return 'error';
  
  // Footnote sweep
  for (var i in footnotes) {
    var footnote_paragraphs = footnotes[i].getFootnoteContents().getParagraphs();
    var error = sweepParagraphs(footnote_paragraphs,0,final_pairings,counter,reference_properties);
  };
  
  if (error === 'format')  return 'error';
  
  if (error === 'missrefs') {
    DocumentApp.getUi().alert('The reference highlighted in red has nothing to refer to.' +
                           '\nIt might contain a typo or the corresponding label might be missing.' +
                           '\n\nUpdating the document when this has been fixed will automatically' +
                           '\nrestore the correct colour.');
    return 'error';
  }
}


function getStoredLabelSettings(document_properties,user_properties) {
  
  // Default properties
  var label_properties = {
    'figur': ['Figure ',null,null,null],
    'table': ['Table ',null,null,null],
    'equat': ['Equation ',null,null,null]
    }
  
  // Overwrite with user properties if they exist
  for (var i in user_properties) {
    if (i.substr(0,5) === 'cross') {
      var property_string = user_properties[i],
          individual_properties = property_string.split('_'),
          code = individual_properties[0]
      label_properties[code] = individual_properties.slice(2,6);
      PropertiesService.getDocumentProperties().setProperty(code, property_string)
    }
  }
  
  // Overwrite with document properties if they exist
  for (var i in document_properties) {
    if (i.substr(0,5) === 'cross') {
      var property_string = document_properties[i],
          individual_properties = property_string.split('_'),
          code = individual_properties[0];
      label_properties[code] = individual_properties.slice(2,6);
    }
  }
  return label_properties;
}


function getStoredReferenceSettings(document_properties,user_properties) {
  
  // Default properties
  var reference_properties = {
      'fig': ['figure ',null,null,null],
      'tab': ['table ',null,null,null],
      'equ': ['equation ',null,null,null]
      }
  
  // Overwrite with user properties if they exist
  for  (var i in user_properties) {
    if (i.substr(0,5) === 'cross') {
      var code = i.substr(6,9),
          property_string = user_properties[i],
          individual_properties = property_string.split('_');
      reference_properties[code] = individual_properties.slice(6,10)
      PropertiesService.getDocumentProperties().setProperty(code, property_string);
    }
  }
  
  // Overwrite with document properties if they exist
  for  (var i in document_properties) {
    if (i.substr(0,5) === 'cross') {
      var code = i.substr(6,9),
          property_string = document_properties[i],
          individual_properties = property_string.split('_');
      reference_properties[code] = individual_properties.slice(6,10);
    }
  }
  return reference_properties 
}


function sweepParagraphs(paragraphs,type,pairings,counter,properties) {

  for (var i in paragraphs) {  
    var paragraph = paragraphs[i] 
    for (var j = 0; j < paragraph.getNumChildren(); j++) {
      if (paragraph.getChild(j).getType() == "TEXT") {
        var text = paragraph.getChild(j).asText(),
            format_indices = findCrossLinks(type,text);
        if (!format_indices) {return 'format'};
        
        var starts = format_indices[0],
            ends = format_indices[1];

        // Zoom into individual label/reference and process     
        if (starts) {
          for (var i = starts.length - 1; i >= 0; i--) { // process backwards because changes to text length change subsequent starts/ends
            var start = starts[i],
                end = ends[i],
                url = text.getLinkUrl(start),
                code = url.substr(1, 3);
            
            // Labels
            
            if (type === 1) {
              var label_code = url.substr(1, 5),
                  number = labelCount(code,counter),
                  name = url.substr(7, url.length);
              
              // Error handling
              
              if (Object.keys(properties).indexOf(label_code) === -1) {
                  text.setForegroundColor(start, end, '#FF0000');
                  var position = doc.newPosition(paragraph.getChild(j), start);
                  doc.setCursor(position);
                
                  return label_code
                  
              } else if (Object.keys(pairings).indexOf(code + 'N' + name) !== -1) {
                  text.setForegroundColor(start, end, '#FF0000');
                  var position = doc.newPosition(paragraph.getChild(j), start);
                  doc.setCursor(position);
                  
                  return url
              }
              
              pairings[code + 'N' + name] = number;
              
              var style_attributes = determineAttributes(text,start,label_code,properties);
              replaceCrossLink(text,start,end,label_code,number,style_attributes,properties);
              
            } 
            
            // References
            
            else {

              var name = url.substr(5,url.length),
                  number = pairings[code + 'N' + name];
              
              // Error handling
              
              if (number === undefined) {
                text.setForegroundColor(start, end, '#FF0000');
                var position = doc.newPosition(paragraph.getChild(j), start);
                doc.setCursor(position);
                
                return 'missrefs'
              }
              
              var style_attributes = determineAttributes(text,start,code,properties); 
              replaceCrossLink(text,start,end,code,number,style_attributes,properties);
            }
          }
        }
      } 
    }
  }
  return pairings
}


function findCrossLinks(type,text) {
  
  var text_length = text.getText().length,
      format_indices = text.getTextAttributeIndices(), // find all points in paragraph where formatting changes
      starts = [],
      ends = [];
  
  format_indices.push(text_length);

  for (var i in format_indices) {   // find url at each format index and for immediately preceding character if possible
    var format_index = format_indices[i];
    
    if (format_index === text_length)
      var url = 'null';
    else
      var url = String(text.getLinkUrl(format_index));
    
    if (format_index > 0)
      var url_one_back = String(text.getLinkUrl(format_index - 1));
    else
      var url_one_back = 'null';

    var locations = findReferencesOrLabels(type,url,url_one_back,starts,ends,format_index);
  }
  return locations
}


function findReferencesOrLabels(type,url,url_one_back,starts,ends,format_index) {
  var position = parseInt(type * 2 + 4); // 4 for references; 6 for labels
  
  if (url.charAt(0) === '#') {
    if (url_one_back.charAt(0) !== '#' && url.charAt(position) === '_') starts.push(format_index);
  } else if (url_one_back.charAt(0) === '#' && url_one_back.charAt(position) === '_') {
    ends.push(format_index - 1);
  }
  return [starts,ends]
}


function labelCount(code,counter) {
  
  if (counter[code])
    var number = counter[code];
  else
    var number = 1;
  
  counter[code] = number + 1;
  return number
}


function determineAttributes(text,start,code,properties) {
  var current = text.getAttributes(start),
      replacements = {};
  
  for (var i in current)  replacements[i] = current[i];

  replacements['BOLD'] = properties[code][1];
  replacements['ITALIC'] = properties[code][2];
  replacements['UNDERLINE'] = properties[code][3];
  
  return replacements;
}


function replaceCrossLink(text,start,end,code,number,style_attributes,properties) {
  
  var replacement_text = determineReplacementText(text,start,code,number,properties);

  text.deleteText(start, end)
      .insertText(start, replacement_text) 
      .setAttributes(start, start + replacement_text.length - 1, style_attributes)
      .setForegroundColor(start, start + replacement_text.length - 1, null);
}


function determineReplacementText(text,start,code,number,properties) {
  
  var text_format = properties[code][0],
      first_letter = text_format.charAt(0);
  
  if (first_letter === first_letter.toUpperCase())  return text_format + number;
    
  if (isCapitalised(text,start))
    return first_letter.toUpperCase() + text_format.substr(1, text_format.length) + number;

  return text_format + number
}


function isCapitalised(original_text,start) {
  
  var text = original_text.getText();
  
  var back_one = text.charAt(start - 1),
      back_two = text.charAt(start - 2),
      back_three = text.charAt(start - 3),
      back_four = text.charAt(start - 4),
      back_five = text.charAt(start - 5);
  
  var sentence_enders = ['!','?'];
  
  if (!back_one)  return true;
  if (back_one === '\r')  return true;
  if (sentence_enders.indexOf(back_two) !== -1)  return true;
  if (back_two === '.' && back_four !== '.')  return true;
  if (back_two === '”')
    if (sentence_enders.indexOf(back_three) !== -1)  return true;
  if (back_one === '(')
    if (sentence_enders.indexOf(back_three) !== -1 || back_three === '.' && back_five !== '.')  return true;
  
  return false
}


// Testing only

function clearproperties() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();
}
