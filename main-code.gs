
//
// # Set things up
//


function onInstall(e) {
  onOpen(e);
}


function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDocument')
    .addItem('Configure', 'showSidebar')
    .addSeparator()
    .addItem('Create list of figures (beta)', 'createLoF')
    .addToUi();
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function showSidebar() {
  var sidebar = HtmlService.createTemplateFromFile('sidebar').evaluate();
  sidebar.setTitle('Cross Reference');
  DocumentApp.getUi().showSidebar(sidebar);
}


//
// # Update document
//

// Apply current settings to the document
function updateDocument() {

  doc = DocumentApp.getActiveDocument();
  
  var paragraphs = doc.getBody().getParagraphs();
  var footnotes = doc.getFootnotes();
  var doc_props = PropertiesService.getDocumentProperties().getProperties();
  var user_props = PropertiesService.getUserProperties().getProperties();
  var lab_props = getStoredLabelSettings(doc_props, user_props);
  var ref_props = getStoredReferenceSettings(doc_props, user_props);
  
  // counter for label numbering
  var counter = {};
  // storage for the numbers assigned to each name
  var pairings = {};
   
  userPropsToDocProps();
  
  var final_pairings = sweepParagraphs(paragraphs, 1, pairings, counter, lab_props);
  
  // Error handling from first sweep
  if (typeof final_pairings === 'string') {
    if (final_pairings.charAt(0) === '#') {
      DocumentApp.getUi().alert('There are two labels with the code ' + final_pairings + '.' +
        "\n\nLabel codes must be 5 letters and label names (e.g. '" +
        final_pairings.substr(7, final_pairings.length) + "') must be unique."
      );
    } else if (final_pairings === 'multiple') {
      DocumentApp.getUi().alert('One of your paragraphs contains more than one label.' +
        '\n\nParagraphs may contain multiple references, but only one label.' +
        '\nYou probably meant to insert a reference. The last label in' +
        '\nthe paragraph has been highlighed in red.'
      );
    } else {
      DocumentApp.getUi().alert('The label code #' + final_pairings + ' was not recognised.' +
        '\nIt might be a typo or it might be a custom label you' +
        '\nhave not yet added in the configuration sidebar.'
      );
    }
    return 'error';
  }
  
  // Second sweep
  var error = sweepParagraphs(paragraphs, 0, final_pairings, counter, ref_props);
  
  // Footnote sweep
  for (var i in footnotes) {
    var footnote_paragraphs = footnotes[i].getFootnoteContents().getParagraphs();
    var error = sweepParagraphs(footnote_paragraphs, 0, final_pairings, counter, ref_props);
  }
  
  if (error === 'missrefs') {
    DocumentApp.getUi().alert('The reference highlighted in red has nothing to refer to.' +
      '\nIt might contain a typo or the corresponding label might be missing.' +
      '\n\nUpdating the document when this has been fixed will automatically' +
      '\nrestore the correct colour.'
    );
    
    return 'error';
  }
}


// Return the user/document/default settings for labels
function getStoredLabelSettings(doc_props, user_props) {
  
  // Default properties
  var lab_props = {
    'figur': ['Figure ',null, null, null, null],
    'table': ['Table ',null, null, null, null],
    'equat': ['Equation ', null, null, null, null]
  };
      
  var splice = [2,6];

  // Overwrite with user properties if they exist
  overwriteProps(lab_props, user_props, splice, 10, true, true);
  
  // Overwrite with document properties if they exist
  overwriteProps(lab_props, doc_props, splice, 10, false, true);

  return lab_props;
}


// Return the user/document/default settings for references
function getStoredReferenceSettings(doc_props, user_props) {
  
  // Default properties
  var ref_props = {
    'fig': ['figure ', null, null, null, null],
    'tab': ['table ', null, null, null, null],
    'equ': ['equation ', null, null, null, null]
  };
  
  var splice = [6,10];
  
  // Overwrite with user properties if they exist
  overwriteProps(ref_props, user_props, splice, 11, true, false);
    
  // Overwrite with document properties if they exist
  overwriteProps(ref_props, doc_props, splice, 11, false, false);
  
  return ref_props;
}


// Overwrite the settings object from a given prop store
function overwriteProps(to_overwrite, props, slice_index, color_index, is_user, is_label) {

  var prop;
  var prop_string;
  var split_props;
  var code;

  for (prop in props) {
    if (prop.substr(0,5) !== 'cross') continue;
    prop_string = props[prop];
    split_props = prop_string.split('_');
    code = is_label ? split_props[0] : split_props[0].substr(0,3);
    to_overwrite[code] = split_props.slice(slice_index[0],slice_index[1]);
    to_overwrite[code].push(split_props[color_index]);
  }
}


// Copy user props to doc props if not already present
function userPropsToDocProps() {

  var user_props = PropertiesService.getUserProperties().getProperties();
  var docProps = PropertiesService.getDocumentProperties();
  var doc_props = docProps.getProperties();
  var final_props = {
    'cross_fig': 'figur_Figure_figure _null_null_null_figure _null_null_null_null_null',
    'cross_tab': 'table_Table_table _null_null_null_table _null_null_null_null_null',
    'cross_equ': 'equat_Equation_equation _null_null_null_equation _null_null_null_null_null',
  };
  
  for (var u_prop in user_props) {
    final_props[u_prop] = user_props[u_prop];
  }
  
  for (var d_prop in doc_props) {
    final_props[d_prop] = doc_props[d_prop];
  }
  
  docProps.setProperties(final_props);
}


// Iterate through paragraphs and update cross references accordingly
function sweepParagraphs(paragraphs, cross_type, pairings, counter, properties) {
  
  var para;
  var text;
  
  var cross_link_indices;
  var starts;
  var start;
  var ends;
  var end;
  var url;
  
  var code;
  var label_code;
  var name;
  var number;
  var new_style;
  
  var paras_length = paragraphs.length;
  
  for ( var i = 0; i < paras_length; i++ ) {
    para = paragraphs[ i ];
    
    var para_children = para.getNumChildren();
    for ( var j = 0; j < para_children; j++ ) {
      if ( para.getChild( j ).getType() == "TEXT" ) {
        text = para.getChild( j ).asText();
        
        // Where are the cross links?
        cross_link_indices = findCrossLinks( cross_type, text );
        
        starts = cross_link_indices[ 0 ];
        ends = cross_link_indices[ 1 ];
        
        if ( !starts ) continue;

        // Zoom into individual label/reference and process
        // Work backwards because we might change the text length
        for ( var k = starts.length - 1; k >= 0; k-- ) {
          start = starts[ k ];
          end = ends[ k ];
          url = text.getLinkUrl( start );
          code = url.substr( 1, 3 );
          
          // Labels
          
          if ( cross_type === 1 ) {
            label_code = url.substr( 1, 5 );
            number = advanceLabCount( code, counter );
            name = url.substr( 7 );
            
            // Error handling
            
            if ( starts.length > 1 ) {
              addFlag( para, text, start, end, j );
              return 'multiple'
            };
            
            // Label code not recognised
            if ( !( label_code in properties ) ) {
              addFlag( para, text, start, end, j );
              return label_code;
            }
            
            // Duplicate label code found
            if ( code + 'N' + name in properties ) {
              addFlag( para, text, start, end, j );
              return url;
            }
            
            pairings[ code + 'N' + name ] = number;
            
            new_style = determineAttributes( text, start, label_code, properties );
            replaceCrossLink( text, start, end, label_code, number, new_style, properties );
          }
          
          // References
          
          if ( cross_type === 0 ) {
            name = url.substr( 5 );
            number = pairings[ code + 'N' + name ];
            
            // Error handling
            
            if ( number === undefined ) {
              addFlag( para, text, start, end, j );
              return 'missrefs'
            }
            
            new_style = determineAttributes( text, start,code, properties );
            replaceCrossLink( text, start, end, code, number, new_style, properties );
          }
        }
      }
    }
  }
  return pairings;
}


// Detect a label or reference in a paragraph
function findCrossLinks( cross_type, text ) {
  
  var text_length = text.getText().length;
  var att_ind = text.getTextAttributeIndices();
  var starts = [];
  var ends = [];
  
  att_ind.push( text_length );

  for ( var i = att_ind.length; i--; ) {
    var att_i = att_ind[ i ];
    var url = ( att_i === text_length ) ? 'null' : String( text.getLinkUrl( att_i ) );
    var url_one_back = ( att_i > 0 ) ? String( text.getLinkUrl( att_i - 1 ) ) : 'null';
    
    var locations = refOrLab( cross_type, url, url_one_back, starts, ends, att_i );
  }
  return locations;
}


// Is the link a label or a reference?
function refOrLab(type, url, url_one_back, starts, ends, format_index) {
  var position = parseInt(type * 2 + 4); // 4 for references, 6 for labels
  
  if (url.charAt(0) === '#') {
    if (url_one_back.charAt(0) !== '#' && url.charAt(position) === '_') starts.push(format_index);
  }
  else if (url_one_back.charAt(0) === '#' && url_one_back.charAt(position) === '_') {
    ends.push(format_index - 1);
  }
  return [starts, ends]
}


// Advance the label counter for a given label code
function advanceLabCount(lab_code, counter) {
  var number = (counter[lab_code]) ? counter[lab_code] : 1;
  counter[lab_code] = number + 1;

  return number
}


// Highlight the erroneous label or reference
function addFlag(paragraph, text, start, end, iteration) {
  text.setForegroundColor(start, end, '#FF0000');
  var position = doc.newPosition(paragraph.getChild(iteration), start);
  doc.setCursor(position);
}


// Determine the style attributes to apply
function determineAttributes(text, start, code, properties) {
  var current = text.getAttributes(start);
  var replacements = {};
  
  for (var i in current) {
    replacements[i] = current[i];
  }

  replacements['BOLD'] = properties[code][1];
  replacements['ITALIC'] = properties[code][2];
  replacements['UNDERLINE'] = properties[code][3];

  return replacements;
}


// Determine the text for the replacement
function determineReplacementText(text, start, code, number, properties) {
  
  var text_format = properties[code][0];
  var first_letter = text_format.charAt(0);
  
  // Bail if the text is to be capitalised no matter what
  if (first_letter === first_letter.toUpperCase()) {
    return text_format + number;
  }
  
  // Capitalise by context
  if (isCapitalised(text,start)) {
    var capitalised = first_letter.toUpperCase() + text_format.substr(1, text_format.length) + number;
    return capitalised;
  }
  
  return text_format + number;
}


// Replace the given label or reference
function replaceCrossLink(text, start, end, code, number, style_attributes, properties) {
  
  var replacement_text = determineReplacementText(text, start, code, number, properties);
  var color = properties[code][4];

  text.deleteText(start, end)
    .insertText(start, replacement_text)
    .setAttributes(start, start + replacement_text.length - 1, style_attributes);
  
  if (!color || color == 'null' || color.length < 3) {
    text.setForegroundColor(start, start + replacement_text.length - 1, null);
  } else {
    text.setForegroundColor(start, start + replacement_text.length - 1, '#' + color);
  }
}


// Check whether to capitalise
function isCapitalised(original_text, start) {
  
  var text = original_text.getText();
  
  var back_one = text.charAt(start - 1);
  var back_two = text.charAt(start - 2);
  var back_three = text.charAt(start - 3);
  var back_four = text.charAt(start - 4);
  var back_five = text.charAt(start - 5);
  
  var sentence_enders = ['!','?'];
  
  if (!back_one) {return true}
  if (back_one === '\r') {return true}
  if (sentence_enders.indexOf(back_two) !== -1) {return true}
  if (back_two === '.' && back_four !== '.') {return true}
  if (back_two === '”') {
    if (sentence_enders.indexOf(back_three) !== -1) {return true}
  }
  if (back_one === '(') {
    if (sentence_enders.indexOf(back_three) !== -1 || back_three === '.' && back_five !== '.') {return true}
  }
  
  return false;
}


//***Testing only***

function clearProperties() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();
}

function logProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties());
  Logger.log(PropertiesService.getUserProperties().getProperties());
}
