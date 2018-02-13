
function createLoF() {

  var cursor = getCursorIndex();
  var lab_settings = PropertiesService.getDocumentProperties().getProperty( 'cross_fig' );
  var lab_text = lab_settings ?  toCap( lab_settings.split( '_' )[ 2 ] ) : 'Figure ';

  if ( updateDoc() === 'error' ) return;
  
  var lab_count = encodeLabel();
  var position = deleteLoF() || cursor;
  
  insertDummyLof( lab_count, lab_text, position );
  
  var html = HtmlService.createTemplateFromFile( 'lof' ).evaluate();
  html.setWidth( 250 ).setHeight( 90 );
  DocumentApp.getUi().showModalDialog( html, 'Generating list of figures...' );
}


function getCursorIndex() {
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if ( !cursor ) return 0;
  
  var element = cursor.getElement();
  
  return element.getParent().getChildIndex(element);
}


function encodeLabel() {
  var doc = DocumentApp.getActiveDocument();
  var paragraphs = doc.getBody().getParagraphs();
  var lab_count = { 'fig': 0 };
  
  for ( var i = 0; i < paragraphs.length; i++ ) {
    var text = paragraphs[i].editAsText();
    var locs = getCL( text, 5 );
    var start = locs[ 0 ][ 0 ];
    var url = locs[ 2 ][ 0 ];
    
    if ( !start ) continue;
    
    if ( url.substr( 0, 4 ) === '#fig' ) {
      text.deleteText( start, start + 1 )
        .insertText( start, '☙' );
      lab_count[ 'fig' ]++;
    }
  }
  return lab_count;
}


function deleteLoF() {
  var lof_table = findLoF();
  if ( lof_table ) {
    var index = lof_table.getParent().getChildIndex( lof_table );
    lof_table.removeFromParent();
    
    return index;
  }
}


function findLoF() {
  var ranges = DocumentApp.getActiveDocument().getNamedRanges( 'lof_table' ),
      lof = ranges[ 0 ];
  
  return lof ? lof.getRange().getRangeElements()[ 0 ].getElement().asTable() : null;
}


function insertDummyLof( lab_count, lab_text, position ) {
  var doc = DocumentApp.getActiveDocument();
  var lof_cells = [];
  var lab_text = toCap( lab_text );
  var placeholder = '...';
  var range = doc.newRange();
  
  doc.getNamedRanges( 'lof_table' ).forEach( function( r ) {
    r.remove()
  });
  
  for ( var i = 1; i <= lab_count[ 'fig' ]; i++ ) {
    var name = lab_text + i;
    var row = [ name, placeholder ];
    lof_cells.push( row );
  }
  
  var lof_table = doc.getBody().insertTable( position, lof_cells );
  styleLoF( lof_table );
  
  range.addElement( lof_table );
  doc.addNamedRange('lof_table', range.build() )
}


function styleLoF( lof_table ) {
  
  lof_table.setBorderWidth( 0 );
  
  var style_attributes = {
    'BOLD': null,
    'ITALIC': null,
    'UNDERLINE': null,
    'FONT_SIZE': null
  };
  
  for ( var i = lof_table.getNumRows(); i--; ) {
    var left_cell = lof_table.getRow( i ).getCell( 0 );
    var right_cell = lof_table.getRow( i ).getCell( 1 );
    lof_table.setAttributes( style_attributes );
    
    left_cell.setPaddingLeft( 0 );
    right_cell.setPaddingRight( 0 )
      .getChild( 0 )
      .asParagraph()
      .setAlignment( DocumentApp.HorizontalAlignment.RIGHT );
  }
}


function getDocAsPDF() {
   return DocumentApp.getActiveDocument().getBlob().getBytes();
}


function insertLoFNumbers( pg_nums ) {
  
  var lof_table = findLoF();
  var current_row = 0;
  
  for ( var i = 0; i < pg_nums.length; i++ ) {
    var pg = i + 1;
    var lab_count = pg_nums[ i ];
    if ( !lab_count ) continue;

    for ( var j = current_row; j < current_row + lab_count; j++ ) {
      lof_table.getCell( j, 1 )
        .clear()
        .getChild( 0 ).asParagraph()
        .appendText( pg );
    }
    var current_row = current_row + lab_count;
  }
}


function restoreLabels() {
  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  
  for ( var i = 0; i < paras.length; i++ ) {
    var text = paras[ i ].editAsText();
    var locs = getCL( text, 5 );
    var starts = locs[ 0 ];
    var urls = locs[ 2 ];
    
    if ( !starts.length ) continue;
    
    for ( var k = starts.length; k--; ) {
      var start = starts[ k ];
      var url = urls[ k ];
      if (url.substr( 0, 4 ) === '#fig') text.deleteText( start - 1, start );
    }
  }
  
  updateDoc();
}
