//
// # Set things up
//


function onInstall( e ) {
  onOpen( e );
}


function onOpen( e ) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem( 'Update document', 'updateDoc' )
    .addItem( 'Configure', 'showSidebar' )
    .addSeparator()
    .addItem( 'Create list of figures (beta)', 'createLoF' )
    .addToUi();
}


function include( filename ) {
  return HtmlService.createHtmlOutputFromFile( filename ).getContent();
}


function showSidebar() {
  var sidebar = HtmlService.createTemplateFromFile( 'sidebar' ).evaluate();
  sidebar.setTitle( 'Cross Reference' );
  DocumentApp.getUi().showSidebar( sidebar );
}


function updateDoc() {

  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  var foots = doc.getFootnotes();
  
  var num_pairs = {};
  
  var lab_props = getStored( true );
  var ref_props = getStored( false );
  
  uPropsToDProps();
  
  num_pairs = updateParas( paras, true, num_pairs, lab_props );
  
  if ( Array.isArray( num_pairs ) ) {
    handleErr( num_pairs );
    return 'error';
  };
  
  var error = updateParas( paras, false, num_pairs, ref_props );
  
  if ( Array.isArray( error ) ) {
    handleErr( error );
    return 'error';
  };
  
  for ( var i = 0, len = foots.length; i < len; i++ ) {
    paras = foots[ i ].getFootnoteContents().getParagraphs();
    error = updateParas( paras, false, num_pairs, ref_props );
    if ( Array.isArray( error ) ) {
      handleErr( error );
      return 'error';
    };
  }
}


function updateParas( paras, is_lab, num_pairs, props ) {
  
  var num = 0;
  var code_len = ( is_lab ) ? 5 : 3;
  
  for ( var i = 0, len = paras.length; i < len; i++ ) {
    
    var text = paras[ i ].editAsText();
    
    // Get location of cross links in text
    var idxs = getCL( text, code_len );
    
    var [ starts, ends, urls ] = idxs;

    if ( !starts ) continue;
    
    var err_details = [ text, starts[ 0 ], ends[ 0 ], urls[ 0 ] ];
    
    if ( is_lab && starts.length > 1 ) return [ 'multiple', err_details ];
    
    // Iterate through the cross links in the text
    for ( var j = starts.length; j--; ) {
      
      var start = starts[ j ];
      var end = ends[ j ];
      var url = urls[ j ];
      var code = url.substr( 1, 3 );
      
      if ( !( code in props ) ) return [ 'unrecognised', err_details ];
      
      // Get replacement text
      var rep_text = props[ code ][ 0 ];
           
      // Capitalise if necessary
      rep_text = isCap( text, start, rep_text );
      
      // Determine number
      num = setNumber( is_lab, num, url, num_pairs );
      if ( num === 'duplicate' ) return [ num, err_details ];
      if ( num === 'missref' ) return [ num, err_details ];
      
      // Append number
      rep_text += num;
      
      // Determine style
      var style = setStyle( props, code );
      
      // Replace and style text
      var rep_end = start + rep_text.length - 1;
      text.deleteText( start, end )
        .insertText( start, rep_text)
        .setLinkUrl( start, rep_end, url )
        .setAttributes( start, rep_end, style )
    } 
  }
  return num_pairs;
}


function getCL( text, code_len ) {

  var url, pre_url, loc;
  var starts = [], ends = [], urls = [];
  var len = text.getText().length;
  var idxs = text.getTextAttributeIndices();
  var reUrl = new RegExp( '#[^_]{' + code_len + '}_' );
  
  idxs.push( len );

  for ( var i in idxs ) {
    loc = idxs[ i ];
    pre_url = ( i > 0 ) ? text.getLinkUrl( loc - 1 ) : null;
    url = ( loc !== len ) ? text.getLinkUrl( loc ) : null;

    if ( !reUrl.test( pre_url ) && reUrl.test( url )) {
      starts.push( loc );
      urls.push( url );
    }
    if ( reUrl.test( pre_url ) && !reUrl.test( url ) ) ends.push( loc - 1 );
  }
  
  return [ starts, ends, urls ];
}


// Check whether to capitalise
function isCap(text, start, rep_text) {
  
  var t = text.getText();
  var first = rep_text.charAt( 0 );
  var upper = first.toUpperCase();
  
  if ( first === upper ) return rep_text;
  
  var b1 = t.charAt( start - 1 );
  var b2 = t.charAt( start - 2 );
  var b3 = t.charAt( start - 3 );
  var b4 = t.charAt( start - 4 );
  var b5 = t.charAt( start - 5 );
  
  if (
    !b1 ||
    b1 === '\r' ||
    /(\!|\?)/.test( b2 ) ||
    ( b2 === '.' && b4 !== '.' ) ||
    ( b2 === '”' && /(\!|\?)/.test( b3 ) ) ||
    ( b1 === '(' && /(\!|\?|\.)/.test( b3 ) && b5 !== '.' )
  ) return upper + rep_text.substr( 1 );
  
  return rep_text;
}


function getStored( is_lab ) {

  var user_props = PropertiesService.getUserProperties().getProperties();
  var doc_props = PropertiesService.getDocumentProperties().getProperties();
  var slice = is_lab ? [ 2, 6, 10 ] : [ 6, 10, 11 ];
  
  // Default properties
  var props = {
    'fig': [ 'figure ', null, null, null, null ],
    'tab': [ 'table ', null, null, null, null ],
    'equ': [ 'equation ', null, null, null, null ]
  };
  
  // Overwrite with user properties if they exist
  owriteProps( props, user_props, slice, true );
    
  // Overwrite with document properties if they exist
  owriteProps( props, doc_props, slice, false );
  
  return props;
}


function owriteProps( to_overwrite, props, slice, is_user ) {

  for ( var prop in props ) {
    if ( prop.substr(0,5) !== 'cross' ) continue;
    
    var prop_string = props[ prop ];
    var split_props = prop_string.split( '_' );
    var code = split_props[ 0 ].substr( 0, 3 );
    to_overwrite[ code ] = split_props.slice( slice[ 0 ], slice[ 1 ] );
    to_overwrite[ code ].push( split_props[ slice[ 2 ] ] );
  }
}


// Copy user props to doc props if not already present
function uPropsToDProps() {

  var user_props = PropertiesService.getUserProperties().getProperties();
  var docProps = PropertiesService.getDocumentProperties();
  var doc_props = docProps.getProperties();
  var props = {
    'cross_fig': 'figur_Figure_figure _null_null_null_figure _null_null_null_null_null',
    'cross_tab': 'table_Table_table _null_null_null_table _null_null_null_null_null',
    'cross_equ': 'equat_Equation_equation _null_null_null_equation _null_null_null_null_null',
  };
  
  for (var u in user_props) {
    props[ u ] = user_props[ u ];
  }
  
  for (var d in doc_props) {
    props[ d ] = doc_props[ d ];
  }
  
  docProps.setProperties( props );
}


// Highlight an erroneous label or reference
function addFlag( text, start, end ) {
  var doc = DocumentApp.getActiveDocument();
  var position = doc.newPosition( text, start );
  
  text.setForegroundColor( start, end, '#FF0000' );
  doc.setCursor( position );
}


function handleErr( err ) {
    var type = err[ 0 ];
    var details = err[ 1 ];
    var [ text, start, end, url ] = details;

    if ( type === 'duplicate' ) {
      DocumentApp.getUi().alert( 'There are two labels with the code ' + url + '.' +
        "\n\nLabel codes must be 5 letters and label names (e.g. '" +
        url.substr( 7 ) + "') must be unique."
      );
    } else if ( type === 'multiple' ) {
      DocumentApp.getUi().alert( 'One of your paragraphs contains more than one label.' +
        '\n\nParagraphs may contain multiple references, but only one label.' +
        '\nYou probably meant to insert a reference. The last label in' +
        '\nthe paragraph has been highlighed in red.'
      );
    } else if (type === 'missref') {
      DocumentApp.getUi().alert( 'The reference highlighted in red has nothing to refer to.' +
        '\nIt might contain a typo or the corresponding label might be missing.' +
        '\n\nUpdating the document when this has been fixed will automatically' +
        '\nrestore the correct colour.'
      );
    } else if ( type === 'unrecognised' ) {
      DocumentApp.getUi().alert( 'The label starting ' + url.substr( 0, 4 ) + ' was not recognised.' +
        '\nIt might be a typo or it might be a custom label you' +
        '\nhave not yet added in the configuration sidebar.'
      );
    }
    
    addFlag( text, start, end );
}


function setStyle( props, code ) {
  var col = props[ code ][ 4 ];
  var color = ( col && col != 'null' ) ? '#' + col : null;
  
  return {
    'BOLD': props[ code ][ 1 ],
    'ITALIC': props[ code ][ 2 ],
    'UNDERLINE': props[ code ][ 3 ],
    'FOREGROUND_COLOR': color
  };   
}


function setNumber( is_lab, num, url, num_pairs ) {
  
  if ( is_lab ) {
    var ref_equiv = url.substr( 0, 4 ) + url.substr( 6 );
    num++;
    // Return error code for duplicate labels
    if ( ref_equiv in num_pairs ) return 'duplicate'; 
    num_pairs[ ref_equiv ] = num;
  } else {
    num = num_pairs[ url ] || 'missref';
  }
  
  return num;
}
 
 
 
 
 
//--- Testing footnote labels ---//

function fnTest() {
  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  var foots = doc.getFootnotes();
  var num_pairs = {};
  
  // Pick up label footnotes
  
  for ( var i = 0, len = foots.length; i < len; i++ ) {
    var text =  foots[ i ].getFootnoteContents().getParagraphs()[0].editAsText();
    var locs = getCL( text, 2 );
    
    var start = locs[ 0 ][ 0 ];
    var end = locs[ 1 ][ 0 ];
    var url = locs[ 2 ][ 0 ];
    
    if ( !start ) continue;
    if ( url.substr(0, 3) != '#fn' ) continue;
    
    num_pairs[ url ] = [ i + 1 ];
    text.setUnderline(start, end, null)
      .setForegroundColor(start, end, null);
  };
  
  // Apply to text
  
  for ( var j = 0, len = paras.length; j < len; j++ ) {
    var text =  paras[ j ].editAsText();
    var locs = getCL( text, 2 );
    
    var start = locs[ 0 ][ 0 ];
    var end = locs[ 1 ][ 0 ];
    var url = locs[ 2 ][ 0 ];
    
    if ( !start ) continue;
    if ( url.substr(0, 3) != '#fn' ) continue;
    
    var num = 'fn. ' + String( num_pairs[ url ] );
    var num_end = start + num.length - 1;
    
    text.deleteText( start, end )
      .insertText( start, num )
      .setLinkUrl( start, num_end, url )
      .setUnderline(start, num_end, null)
      .setForegroundColor(start, num_end, null);
  };
}

