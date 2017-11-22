
function createLoF() {

  var cursor = getCursorIndex(),
      label_settings = PropertiesService.getDocumentProperties().getProperty('cross_fig');
  
  if (label_settings) {
    var label_text = label_settings.split('_')[2],
        label_text_capitalised = label_text.substr(0,1).toUpperCase() + label_text.substr(1,label_text.length);
  }
  else {
    var label_text_capitalised = 'Figure ';
  }

  var error = updateDocument();
  if (error === 'error') {return}
  
  var label_count = encodeLabel(),
      lof_position = deleteLoF();
  
  var position = lof_position || cursor;
  
  insertDummyLof(label_count, label_text_capitalised, position);
  
  var html = HtmlService.createTemplateFromFile('lof').evaluate();
  html.setWidth(250).setHeight(90);
  DocumentApp.getUi().showModalDialog(html, 'Generating list of figures...');
}


function getCursorIndex() {
  var element = DocumentApp.getActiveDocument().getCursor().getElement();
  
  return element.getParent().getChildIndex(element);
}


function encodeLabel() {
  var doc = DocumentApp.getActiveDocument(),
      paragraphs = doc.getBody().getParagraphs(),
      label_count = {'fig': 0}
  
  for (var i in paragraphs) {
    var paragraph = paragraphs[i];
    for (var j = 0; j < paragraph.getNumChildren(); j++) {
      if (paragraph.getChild(j).getType() == 'TEXT') {
        var text = paragraph.getChild(j).asText(),
            locations = findCrossLinks(1, text);
        if (!locations[1][0]) {continue}
        
        var start = locations[0][0];

        if (text.getLinkUrl(start).substr(0,4) === '#fig') {
          text.deleteText(start, start + 1)
              .insertText(start, '☙');
          label_count['fig'] = label_count['fig'] + 1;
        }
      }
    }
  }
  return label_count
}


function deleteLoF() {
  var lof_table = findLoF();
  if (lof_table) {
    var index = lof_table.getParent().getChildIndex(lof_table);
    lof_table.removeFromParent();
    
    return index;
  }
}


function findLoF() {
  var ranges = DocumentApp.getActiveDocument().getNamedRanges('lof_table'),
      lof = ranges[0];
  
  if (lof) {return lof.getRange().getRangeElements()[0].getElement().asTable()}
}


function insertDummyLof(label_count, label_text, position) {
  var doc = DocumentApp.getActiveDocument(),
      body = doc.getBody(),
      lof_cells = [];
  
  for (var i = 0; i < label_count['fig']; i++) {
    var name = label_text + (i + 1);
    var placeholder = '...',
        row = [name, placeholder];
    lof_cells.push(row);
  }
  
  var lof_table = body.insertTable(position, lof_cells);
  
  styleLoF(lof_table);
  
  var lof_ranges = doc.getNamedRanges('lof_table');
  
  for (var i in lof_ranges) {lof_ranges[i].remove()}
  
  var range = doc.newRange();
  range.addElement(lof_table);
  doc.addNamedRange('lof_table', range.build())
}


function styleLoF(lof_table) {
  
  lof_table.setBorderWidth(0);
  
  var style_attributes = {};
  style_attributes[DocumentApp.Attribute.BOLD] = null;
  style_attributes[DocumentApp.Attribute.ITALIC] = null;
  style_attributes[DocumentApp.Attribute.UNDERLINE] = null;
  style_attributes[DocumentApp.Attribute.FONT_SIZE] = null;
  
  for (var i = 0; i < lof_table.getNumRows(); i++) {
    var left_cell = lof_table.getRow(i).getCell(0),
        right_cell = lof_table.getRow(i).getCell(1);
    lof_table.setAttributes(style_attributes);
    
    left_cell.setPaddingLeft(0);
    right_cell.setPaddingRight(0)
              .getChild(0).asParagraph()
              .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  }
}


function getDocAsPDF() {
   var blob = DocumentApp.getActiveDocument().getBlob().getBytes();
   return blob;
}


function insertLoFNumbers(page_numbers) {
  
  var lof_table = findLoF(),
      current_row = 0;
  
  for (var i = 0; i < page_numbers.length; i++) {
    var page_number = (i + 1),
        label_count = page_numbers[i];
    if (label_count === 0){continue}

    for (var j = current_row; j < current_row + label_count; j++) {
      lof_table.getCell(j, 1)
               .clear()
               .getChild(0).asParagraph()
               .appendText(page_number);
    }
    var current_row = current_row + label_count;
  }
}


function restoreLabels() {
  var doc = DocumentApp.getActiveDocument(),
      paragraphs = doc.getBody().getParagraphs(),
      label_count = {'fig': 0};
  
  for (var i in paragraphs) {
    var paragraph = paragraphs[i];
    for (var j = 0;j < paragraph.getNumChildren();j++) {
      if (paragraph.getChild(j).getType() == "TEXT") {
        var text = paragraph.getChild(j).asText(),
            locations = findCrossLinks(1, text);
        
        if (!locations[0][0]) {continue}
        
        var starts = locations[0];
        
        for (var k = starts.length - 1; k >= 0; k--) {
          var start = starts[k],
              url = text.getLinkUrl(start);
          if (url.substr(0,4) == '#fig') {text.deleteText(start - 1, start)}
        }
      }
    }
  }
  
  updateDocument();
  
  doc.setCursor(doc.newPosition(paragraphs[1].getChild(0), 0)) // set cursor to top of document
}
