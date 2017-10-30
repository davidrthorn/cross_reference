// Open dialogue and create lof

function createLof() {
  
  var lab_count = encodeLabel();
  dummyLof(lab_count);
  
  var html = HtmlService.createHtmlOutputFromFile('lof')
      .setWidth(400)
      .setHeight(300);
  DocumentApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'My custom dialog');
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
          Logger.log(start);
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
  
  var num_fig = lab_count['fig']
  body.insertParagraph(0, 'List of Figures');
  body.getParagraphs()[0].setHeading(DocumentApp.ParagraphHeading.HEADING1);
  for (var i=1; i<=num_fig; i++) {
    body.insertParagraph(i, 'Figure ' + i + '.......... ')
    if (i == num_fig) {
      body.insertPageBreak(num_fig + 1);
    }
  }
}

// Add actual page numbers to lof

function lofNumbers(page_numbers) {
  var paras = DocumentApp.getActiveDocument().getBody().getParagraphs();
  var current_loc = 0;
 
  for (var i=0; i<page_numbers.length; i++) {
    var p_number = i + 1;
    var fig_count = page_numbers[i];
    if (fig_count == 0){continue};

    for (var j=current_loc + 1; j<=current_loc + fig_count; j++) {
      var lof_line = paras[j].getChild(0).asText();
      lof_line.insertText(lof_line.getText().length, p_number);
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
  updateDocument()
}
