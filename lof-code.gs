function createLoF() {

  var cursor = getCursorIndex();
  var labSettings = PropertiesService.getDocumentProperties().getProperty( 'cross_fig' );
  var labText = labSettings ?  toCap( labSettings.split( '_' )[ 2 ] ) : 'Figure ';

  if ( updateDoc() === 'error' ) return;
  
  var labCount = encodeLabel();
  var position = deleteLoF() || cursor;
  
  insertDummyLoF( labCount, labText, position );
  
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
  var labCount = { 'fig': 0 };
  var figDescs = '';
  
  for ( var i = 0; i < paragraphs.length; i++ ) {
    var text = paragraphs[ i ].editAsText();
    var locs = getCrossLinks( text, 5 );
    var start = locs[ 0 ][ 0 ];
    var url = locs[ 2 ][ 0 ];

    if ( !locs[ 0 ].length ) continue;
    
    if ( url.substr( 0, 4 ) === '#fig' ) {

      figDescs += 'ഛಎ' + text.getText().match(/([ ]\d[^\w]*)([^\.]*)/)[2]
    
      text.deleteText( start, start + 1 )
        .insertText( start, '☙' );
      labCount[ 'fig' ]++;
    }
  }
  
  PropertiesService.getDocumentProperties().setProperty('fig_descs', figDescs)
  return labCount;
}


function deleteLoF() {
  var lofTable = findLoF();
  if ( !lofTable ) return;
  
  var lofIndex = lofTable.getParent().getChildIndex( lofTable );
  lofTable.removeFromParent();
  
  return lofIndex
}


function findLoF() {
  var lof = DocumentApp.getActiveDocument().getNamedRanges( 'lofTable' )[ 0 ];
  
  return lof ? lof.getRange().getRangeElements()[ 0 ].getElement().asTable() : null;
}


function insertDummyLoF( labCount, labText, position ) {
  var doc = DocumentApp.getActiveDocument();
  var lofCells = [];
  var labText = toCap( labText );
  var placeholder = '...';
  var range = doc.newRange();
  
  doc.getNamedRanges( 'lofTable' ).forEach( function( r ) {
    r.remove()
  });
  
  var figDescs = PropertiesService.getDocumentProperties().getProperty('fig_descs');
  var splitDescs = figDescs ? figDescs.split('ഛಎ') : null;
  
  for ( var i = 1; i <= labCount[ 'fig' ]; i++ ) {
    var figName = labText + i;
    var figDesc = splitDescs && splitDescs[i].length ? ': ' + splitDescs[i] : '';
    var row = [ figName + figDesc, placeholder ];
    lofCells.push( row );
  }
  
  var lofTable = doc.getBody().insertTable( position, lofCells )
  styleLoF( lofTable );
  
  range.addElement( lofTable );
  doc.addNamedRange('lofTable', range.build() )
}


function styleLoF( lofTable ) {
  
  lofTable.setBorderWidth( 0 );
  
  var styleAttributes = {
    'BOLD': null,
    'ITALIC': null,
    'UNDERLINE': null,
    'FONT_SIZE': null
  };
  
  for ( var i = lofTable.getNumRows(); i--; ) {
    var row = lofTable.getRow( i );
    
    lofTable.setAttributes( styleAttributes ).setColumnWidth( 1, 64 );
    row.getCell( 0 ).setPaddingLeft( 0 );
    row.getCell( 1 ).setPaddingRight( 0 )
      .getChild( 0 ).asParagraph().setAlignment( DocumentApp.HorizontalAlignment.RIGHT );
  }
}


function getDocAsPDF() {
   return DocumentApp.getActiveDocument().getBlob().getBytes();
}


function insertLoFNumbers( pg_nums ) {
  
  var lofTable = findLoF();
  var currentRow = 0;
  
  for ( var i = 0; i < pg_nums.length; i++ ) {
    var labCount = pg_nums[ i ];
    if ( !labCount ) continue;

    for ( var j = currentRow; j < lofTable.getNumRows(); j++ ) {
      lofTable.getCell( j, 1 )
        .clear()
        .getChild( 0 ).asParagraph().appendText( i + 1 );
    }
    var currentRow = currentRow + labCount;
  }
}


function restoreLabels() {
  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  
  for ( var i = 0; i < paras.length; i++ ) {
    var text = paras[ i ].editAsText();
    var locs = getCrossLinks( text, 5 );
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
