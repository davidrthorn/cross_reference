function createLoF() {

  const cursor = getCursorIndex()

  if (updateDoc() === 'error') return // TODO: need to check error type
  
  const {labCount, figDescs} = encodeLabel()
  const position = deleteLoF() || cursor
  
  insertDummyLoF(labCount, figDescs, position)
  
  const html = HtmlService.createTemplateFromFile('lof').evaluate()
  html.setWidth(250).setHeight(90)
  DocumentApp.getUi().showModalDialog(html, 'Generating list of figures...')
}

function getCursorIndex() {
  const cursor = DocumentApp.getActiveDocument().getCursor()
  if (!cursor) return 0
  
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
  let figDescs = ''

  const getLabs = getCRUrls(isCRUrl(5))
  
  const handleText = text => CRUrl => {
    figDescs += 'ഛಎ' + text.getText()
    const start = CRUrl.start
    text.deleteText(start, start + 1).insertText(start, '☙')
    labCount['fig']++
  }
  
  const error = updateParagraphs(paragraphs)(getLabs)(handleText)
  
  return {figDescs, labCount}
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
  return lof ? lof.getRange().getRangeElements()[0].getElement().asTable() : null
}


function insertDummyLoF(labCount, figDescs, position) {
  const doc = DocumentApp.getActiveDocument()
  const lofCells = []
  const placeholder = '...'
  const range = doc.newRange()

  doc.getNamedRanges('lofTable').forEach(r => r.remove())
  const splitDescs = figDescs ? figDescs.split('ഛಎ') : null
  
  for (let i = 1, len = labCount['fig']; i <= len ; i++) {
    let figDesc = splitDescs[i].replace(/^[\t\r\n]/, '').replace(/^(\w)/, (_, l) => l.toUpperCase())
    lofCells.push([figDesc, placeholder])
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

/*
@var pageNumbers : [1,0,2...] -- members correspond to count of labels on a page (in order)
*/
function insertLoFNumbers(pageNumbers) {
  const lofTable = findLoF()
  let currentRow = 0
  
  for (let i = 0; i < pageNumbers.length; i++) {
    const labCount = pageNumbers[i]
    if (!labCount) continue
    
    const pageNumber = (i + 1).toString()
    
    for (let j = currentRow; j < lofTable.getNumRows(); j++) {
      lofTable.getCell(j, 1)
        .clear()
        .getChild(0).asParagraph()
        .appendText(pageNumber)
    }
    currentRow += labCount
  }
}


function restoreLabels() {
  const paragraphs = DocumentApp.getActiveDocument().getBody().getParagraphs()
  
  const getLabs = getCRUrls(isCRUrl(5))
  const handleText = text => CRUrl => {
    const start = CRUrl.start
    text.deleteText(start - 1, start)
  }
  
  const error = updateParagraphs(paragraphs)(getLabs)(handleText)
  
  updateDoc()
}
