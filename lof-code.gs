const isFigLab = url => /^#figur_/.test(url)

const getDocAsPDF = () => DocumentApp.getActiveDocument().getBlob().getBytes()

const saveLofConfig = settings => PropertiesService.getDocumentProperties().setProperty('entityTablesSettings', JSON.stringify(settings))

const getLofConfig = () => JSON.parse(PropertiesService.getDocumentProperties().getProperty('entityTablesSettings'))


function createLoF() {
  if (updateDoc() === 'error') return
  
  const settings = getLofConfig() || {'fig': {'order': 0}, 'tab': {'order': 1}}
  const codes = Object.keys(settings).sort((a, b) => settings[a].order || 0 - settings[b].order || 0)
  
  const signs = filterObjectByKeys({
    'fig': '☙', 'tab': '❆'
  }, codes)
  
  const positions = getPositions()
  
  const descriptions = encodeLabel(signs)
  
  if (!descriptions.fig.length && !descriptions.tab.length) return
  
  let fallbackPosition = getCursorParagraphIndex() || 0 // must assign this to variable before deleting LoFs
  for (const i in codes) {
    const code = codes[i]
    if (descriptions[code].length === 0) continue
    insertDummyLoF(code, descriptions[code], positions[i] || fallbackPosition++) 
  }
  
  const html = HtmlService.createTemplateFromFile('lof').evaluate()
  html.setWidth(250).setHeight(90)
  DocumentApp.getUi().showModalDialog(html, 'Generating list of figures...')
}


const getElementIndex = el => el.getParent().getChildIndex(el)


function getPositions() {
  const figTable = findLoF('fig')
  const tabTable = findLoF('tab')
  
  const positions = []
  if (figTable) {
    positions.push(getElementIndex(figTable))
  }
  if (tabTable) {
    positions.push(getElementIndex(tabTable))
  }
  
  figTable && figTable.removeFromParent()
  tabTable && tabTable.removeFromParent()

  return positions.sort()
}

function filterObjectByKeys(object, keys) {
  const result = {}
  for (const k in object) {
    if (keys.includes(k)) {
      result[k] = object[k]
    }
  }
  return result
}


function getCursorParagraphIndex() {
  const cursor = DocumentApp.getActiveDocument().getCursor()
  if (!cursor) return 0
  const paragraph = getContainingParagraph(cursor.getElement())
  return paragraph.getParent().getChildIndex(paragraph)
}


function getContainingParagraph(el) {
  if (!el || typeof el.getType !== 'function') return
  const type = el.getType()
  
  if (type === DocumentApp.ElementType.PARAGRAPH) return el
  if (type === DocumentApp.ElementType.BODY_SECTION) return
  return getContainingParagraph(el.getParent())
}


// encodeLabel replaces the beginning of a label with
// a rare UTF-8 characters that will be used
// to identify labels when we process the PDF file
function encodeLabel(signMap) {
  const doc = DocumentApp.getActiveDocument()
  const paragraphs = doc.getBody().getParagraphs()
  const descriptions = {'fig': [], 'tab':[]}
  
  const getCRs = getCRUrls(isCRUrl(5))
  const handleText = text => CRUrl => {
    const code = CRUrl.url.substr(1, 3)
    let sign = signMap[code]
    if (!sign) return

    descriptions[code].push(text.getText())    
    const start = CRUrl.start
    text.deleteText(start + 1, start + 2).insertText(start + 1, sign)
  }
  
  const error = updateParagraphs(paragraphs)(getCRs)(handleText)
  
  return descriptions
}


function deleteLoF(code) {
  const lofTable = findLoF(code)
  
  if (!lofTable) return
  
  const lofIndex = lofTable.getParent().getChildIndex(lofTable)
  // lofTable.removeFromParent()
  
  return lofIndex
}


function findLoF(code) {
  const lof = DocumentApp.getActiveDocument().getNamedRanges('lofTable_' + code)[0]
  if (!lof) return
  const el = lof.getRange().getRangeElements()[0]
  if (!el) return
  const element = el.getElement()
  return element.getType() === DocumentApp.ElementType.TABLE ? element.asTable() : null
}


function insertDummyLoF(code, descriptions=[], position) {
  const doc = DocumentApp.getActiveDocument()
  const placeholder = '...'
  const lofCells = descriptions.map(fd => [fd.replace(/^[\t\r\n]/, ''), placeholder])
  
  const lofTable = doc.getBody().insertTable(position, lofCells)
  styleLoF(lofTable)
  
  const range = doc.newRange()
  range.addElement(lofTable)
  doc.addNamedRange('lofTable_' + code, range.build())
}


function styleLoF(lofTable) {
  const styleAttributes = {
    'BOLD':       null,
    'ITALIC':     null,
    'UNDERLINE':  null,
    'FONT_SIZE':  null
  }
  
  lofTable.setBorderWidth(0)
    .setAttributes(styleAttributes)
    .setColumnWidth(1, 64)

  let i = lofTable.getNumRows()
  while (i--) {
    const row = lofTable.getRow(i)
    
    row.getCell(0)
      .setPaddingLeft(0)
      .setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM)
    row.getCell(1)
      .setPaddingRight(0)
      .setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM)
      .getChild(0).asParagraph()
      .setAlignment(DocumentApp.HorizontalAlignment.RIGHT)
  }
}

 
/*
@var pageNumbers : [1,0,2...] -- members correspond to count of labels on a page (in order)
*/
function insertLoFNumbers(pageNumbers) {
  for (const code of ['fig', 'tab']) {
    const lofTable = findLoF(code)
    if (!lofTable) continue
    let currentRow = 0
   
    for (let i = 0; i < pageNumbers[code].length; i++) {
      const labCount = pageNumbers[code][i]
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
}


function restoreLabels() {
  const paragraphs = DocumentApp.getActiveDocument().getBody().getParagraphs()
  
  const getLabs = getCRUrls(isFigLab)
  const handleText = text => CRUrl => {
    const start = CRUrl.start
    text.deleteText(start + 1, start + 2)
  }
  
  const error = updateParagraphs(paragraphs)(getLabs)(handleText)
  
  updateDoc()
}
