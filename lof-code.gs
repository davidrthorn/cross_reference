function createLof() {
  
  var lab_count = encodeLabel();
  dummyLof(lab_count);
  
  var html = HtmlService.createHtmlOutputFromFile('lof')
      .setWidth(400)
      .setHeight(300);
  DocumentApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'My custom dialog');
}

function getPDF() {
   var blob = DocumentApp.getActiveDocument().getBlob().getBytes();
   return blob
}

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
        
        Logger.log(starts.length)
        
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

function dummyLof(lab_count) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  var num_fig = lab_count['fig']
  
  for (var i=0; i<num_fig; i++) {
    body.insertParagraph(i, 'Figure ' + (i + 1) + '.......... ')
  }
}

function lofNumbers(page_numbers) {
  var paras = DocumentApp.getActiveDocument().getBody().getParagraphs();
  var current_loc = -1;
  Logger.log(page_numbers.length);
 
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
