// Open dialogue and create lof

function createLof() {

  var cursor = getCursorIndex();

  var error = updateDocument();
  if (error == 'error') {
    return;
  }

  var lof_position = deleteLof(); 
  var lab_count = encodeLabel();
  
  if (lof_position) {
    var position = lof_position
  } else {
    var position = cursor
  }
  
  dummyLof(lab_count, position);
  
  var html = HtmlService.createTemplateFromFile('lof').evaluate()
  html.setWidth(300).setHeight(100);
  DocumentApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Generating list of figures...');
}

// get  the body index of the cursor

function getCursorIndex() {
  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  var element = cursor.getElement();
  var index = element.getParent().getChildIndex(element);
  
  return index
}

// find current lof 

function findLof() {
  var ranges = DocumentApp.getActiveDocument().getNamedRanges('lof_table');
  var lof = ranges[0];
  if (lof) {
    var table = lof.getRange().getRangeElements()[0].getElement().asTable();
    return table;
  }
}

// Delete current lof

function deleteLof() {
  var table = findLof();
  if (table) {
    var index = table.getParent().getChildIndex(table);
    table.removeFromParent();
    return index
  }
}

// Retrieve document as PDF blob in byte form

function getPDF() {
   var blob = DocumentApp.getActiveDocument().getBlob().getBytes();
   return blob
}

// Replace first two letter of figure labels with UTF-8 symbol placeholder

function encodeLabel() {
  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  
  var lab_count = {'fig': 0}
  
  for (var i in paras) {
    var para = paras[i]
    for (var j = 0;j < para.getNumChildren();j++) {
      if (para.getChild(j).getType() == "TEXT") {
        var text = para.getChild(j).asText();
        var locations = findCrossLinks(1,text);
        
        if (!locations[0][0]){continue}
        
        var starts = locations[0];
        var ends = locations[1];
        
        for (var k=starts.length-1; k>=0; k--) {
          var start = starts[k];
          var end = ends[k];
          var url = text.getLinkUrl(start);  
          if (url.substr(0,4) == '#fig') {
            text.deleteText(start, start + 1)
            text.insertText(start, '☙')
            lab_count['fig'] = lab_count['fig'] + 1
          }
        }
      }
    }
  }
  return lab_count
}

// Create correct length lof without page numbers (so that page numbers reflect inclusion of lof)

function dummyLof(lab_count,position) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  var d_props = PropertiesService.getDocumentProperties();
  var u_props = PropertiesService.getUserProperties();
  
  var lab_props = retrieveStoredLabs(d_props,u_props);
  var lab_text = lab_props['figur'][0];
    
  var num_fig = lab_count['fig'];
  var cells = [];
  
  for (var i=0; i<num_fig; i++) {
    var name = lab_text + (i + 1);
    var placeholder = '...';
    var row = [name, placeholder];
    cells.push(row);
  }
  
  var lof_table = body.insertTable(position, cells);
  styleTable(lof_table);
  
  var lof_ranges = doc.getNamedRanges('lof_table');
  for (var i in lof_ranges) {
    lof_ranges[i].remove();
  }
  var range = doc.newRange();
  range.addElement(lof_table);
  doc.addNamedRange('lof_table', range.build())
}

// Style lof table

function styleTable(table) {
  
  table.setBorderWidth(0);
  
  var att = {};
  att[DocumentApp.Attribute.BOLD] = null;
  att[DocumentApp.Attribute.ITALIC] = null;
  att[DocumentApp.Attribute.UNDERLINE] = null;
  att[DocumentApp.Attribute.FONT_SIZE] = null;
  
  for (var i=0; i<table.getNumRows(); i++) {
    var lcell = table.getRow(i).getCell(0);
    var rcell = table.getRow(i).getCell(1);
    table.setAttributes(att);
    
    lcell.setPaddingLeft(0);
    rcell.setPaddingRight(0);
    rcell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  }
}

// Add actual page numbers to lof

function lofNumbers(page_numbers) {
  
  var table = findLof();
  var current_loc = 0;
  
  for (var i=0; i<page_numbers.length; i++) {
    var p_number = i + 1;
    var fig_count = page_numbers[i];
    if (fig_count == 0){continue};

    for (var j=current_loc; j<current_loc + fig_count; j++) {
      var num_cell = table.getCell(j, 1)
      num_cell.clear();
      num_cell.getChild(0).asParagraph().appendText(p_number);
    }
    var current_loc = current_loc + fig_count;
  }
}

// Restore labels to their correct formatting

function restoreLabels() {
  var doc = DocumentApp.getActiveDocument();
  var paras = doc.getBody().getParagraphs();
  
  var lab_count = {'fig': 0}
  
  for (var i in paras) {
    var para = paras[i]
    for (var j = 0;j < para.getNumChildren();j++) {
      if (para.getChild(j).getType() == "TEXT") {
        var text = para.getChild(j).asText();
        var locations = findCrossLinks(1,text);
        
        if (!locations[0][0]){continue}
        
        var starts = locations[0];
        var ends = locations[1]; 
        
        for (var k=starts.length-1; k>=0; k--) {
          var start = starts[k];
          var end = ends[k];
          var url = text.getLinkUrl(start);
          if (url.substr(0,4) == '#fig') {
            text.deleteText(start - 1, start)
          }
        }
      }
    }
  }
  updateDocument();
  
  var top = doc.newPosition(paras[1].getChild(0), 0);
  doc.setCursor(top);
}
