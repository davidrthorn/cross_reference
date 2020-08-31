function createLoF() {

  const cursor = getCursorIndex()
  const settings = getSettings()['figur']

  if (updateDoc() === 'error') return // TODO: need to check error type
  
  const labCount = encodeLabel()
  const position = deleteLoF() || cursor
  
  insertDummyLoF(labCount, settings.lab.text, position)
  
  const html = HtmlService.createTemplateFromFile('lof').evaluate()
  html.setWidth(250).setHeight(90)
  DocumentApp.getUi().showModalDialog(html, 'Generating list of figures...')
}

function getCursorIndex() {
  const cursor = DocumentApp.getActiveDocument().getCursor()
  if (!cursor ) return 0
  
  const element = cursor.getElement()
  
  return element.getParent().getChildIndex(element)
}


// encodeLabel replaces the beginning of a label with
// very rarely used UTF-8 characters that will be used
// to identify labels when we process the PDF file
function encodeLabel() {
  const doc = DocumentApp.getActiveDocument()
  const paragraphs = doc.getBody().getParagraphs()
  const labCount = { 'fig': 0 }
  const figDescs = ''
  
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].editAsText()
    const locs = getCrossLinks(text, 5)
    const start = locs[0][0]
    const url = locs[2][0]

    if (!locs[0].length) continue
    
    if (url.substr(0, 4) === '#fig') {

      figDescs += 'ഛಎ' + text.getText().match(/([ ]\d[^\w]*)([^\.]*)/)[2]
    
      text.deleteText(start, start + 1).insertText(start, '☙')
      labCount['fig']++
    }
  }
  
  PropertiesService.getDocumentProperties().setProperty('fig_descs', figDescs)
  return labCount
}


function deleteLoF() {
  const lofTable = findLoF()
  if (!lofTable) return
  
  const lofIndex = lofTable.getParent().getChildIndex(lofTable)
  lofTable.removeFromParent()
  
  return lofIndex
}


function findLoF() {
  const lof = DocumentApp.getActiveDocument().getNamedRanges('lofTable')[0]
  return lof.getRange().getRangeElements()[0].getElement().asTable() || null
}


function insertDummyLoF(labCount, labText, position) {
  const doc = DocumentApp.getActiveDocument()
  const lofCells = []
  const placeholder = '...'
  const range = doc.newRange()

  doc.getNamedRanges('lofTable').forEach(r => r.remove())
  
  const figDescs = PropertiesService.getDocumentProperties().getProperty('fig_descs')
  const splitDescs = figDescs ? figDescs.split('ഛಎ') : null
  
  for (let i = 1; i <= labCount['fig']; i++) {
    const figName = labText + i
    const figDesc = splitDescs && splitDescs[i].length ? ': ' + splitDescs[i] : ''
    lofCells.push([figName + figDesc, placeholder])
  }
  
  const lofTable = doc.getBody().insertTable(position, lofCells)
  styleLoF(lofTable)
  
  range.addElement(lofTable)
  doc.addNamedRange('lofTable', range.build())
}


function styleLoF(lofTable) {
  
  lofTable.setBorderWidth(0)
  
  var styleAttributes = {
    'BOLD':       null,
    'ITALIC':     null,
    'UNDERLINE':  null,
    'FONT_SIZE':  null
  }
  
  let i = lofTable.getNumRows()
  while (i--) {
    const row = lofTable.getRow(i)
    
    lofTable.setAttributes(styleAttributes).setColumnWidth(1, 64)
    row.getCell(0).setPaddingLeft(0)
    row.getCell(1).setPaddingRight(0)
      .getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT)
  }
}


const getDocAsPDF = () => DocumentApp.getActiveDocument().getBlob().getBytes() 


function insertLoFNumbers(pageNumbers) {
  
  const lofTable = findLoF()
  const currentRow = 0
  
  for (let i = 0; i < pageNumbers.length; i++) {
    const labCount = pageNumbers[i]
    if (!labCount) continue

    for (let j = currentRow; j < lofTable.getNumRows(); j++) {
      lofTable.getCell(j, 1)
        .clear()
        .getChild(0).asParagraph().appendText(i + 1)
    }
    currentRow += labCount
  }
}


function restoreLabels() {
  const paras = DocumentApp.getActiveDocument().getBody().getParagraphs()
  
  for (let i = 0, len = paras.length; i < len; i++) {
    const text = paras[i].editAsText()
    const locs = getCrossLinks(text, 5) // TODO: this is no longer the right signature
    const starts = locs[0] // TODO: thus also wrong
    const urls = locs[2]
    
    let j = starts.length
    while (j--) {
      const start = starts[j]
      if (urls[j].substr(0, 4) === '#fig') {
        text.deleteText(start - 1, start)
      }
    }
  }
  
  updateDoc()
}
