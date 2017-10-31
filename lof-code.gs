// Open dialogue and create lof

function createLof() {
  
  var lab_count = encodeLabel();
  dummyLof(lab_count);
  
  var html = HtmlService.createHtmlOutputFromFile('lof')
      .setWidth(300)
      .setHeight(100);
  DocumentApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Generating list of figures...');
}

// Retrieve document as blob bytes

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

function dummyLof(lab_count) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  var num_fig = lab_count['fig'];
  var cells = [
    ['List of Figures','']
  ];
  
  for (var i=1; i<=num_fig; i++) {
    var name = 'Figure ' + i;
    var placeholder = '---';
    var row = [name, placeholder];
    cells.push(row);
  }

  var lof_table = body.insertTable(0, cells);
  styleTable(lof_table);
}

// Style lof table
function styleTable(table) {
  
  table.setBorderWidth(0);
  
  for (var i=0; i<table.getNumRows(); i++) {
    var lcell = table.getRow(i).getCell(0);
    var rcell = table.getRow(i).getCell(1);
    
    lcell.setPaddingLeft(0);
    lcell.setPaddingTop(0);
    
    rcell.setPaddingRight(0);
    rcell.setPaddingTop(0);
    rcell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    if (i==0) {
      lcell.getChild(0).asParagraph().setBold(true);
    }
  }
}

// Add actual page numbers to lof

function lofNumbers(page_numbers) {
  var tables = DocumentApp.getActiveDocument().getBody().getTables();
  
  for (var i=0; i<tables.length; i++) {
    var top_cell = tables[i].getCell(0, 0);
    if (top_cell.getText()) {
      var table = tables[i];
      break
    }
  }
  
  var current_loc = 1;
  
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
}

