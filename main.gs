// FIXME: references don't work?!

function onInstall(e) {
  onOpen(e)
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDoc')
    .addItem('Configure', 'showSidebar')
    .addSeparator()
    .addItem('Create list of figures', 'createLoF')
    .addToUi()
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}


function showSidebar() {
  const sidebar = HtmlService.createTemplateFromFile('sidebar').evaluate()
  sidebar.setTitle('Cross Reference')
  DocumentApp.getUi().showSidebar(sidebar)
}

function updateDoc() {
  const document = DocumentApp.getActiveDocument()
  let paragraphs = document.getBody().getParagraphs()
  const footnotes = document.getFootnotes()

  // Add all footnote paragraphs to paragraphs array
  paragraphs = footnotes.reduce((acc, footnote) => [...acc, ...footnote.getFootnoteContents().getParagraphs()], paragraphs)

  const settings = getSettings()
  updateDocProps(settings)

  const recordedNumbers = {}
  const labelNameNumberMap = {}

  const labProps = getProps('lab')(settings)

  const getLabs = getCRUrls(isCRUrl(5))
  const handleLabs = handleCRUrl(labProps)(handleLabNumber(recordedNumbers)(labelNameNumberMap))
  let result = updateParagraphs(paragraphs)(getLabs)(handleLabs)

  if (result instanceof CRError) {
    handleErr(result)
    return 'error'
  }

  for (let i = 0, len = footnotes.length; i < len; i++) {
    const footnoteParagraphs = footnotes[i].getFootnoteContents().getParagraphs()
    const handleFNLabs = handleFootnoteLabCRUrl(labProps)(handleLabs)
    const result = updateParagraphs(footnoteParagraphs)(getLabs)(handleFNLabs)
    if (result instanceof CRError) {
      handleErr(result)
      return 'error'
    }
  }

  const refProps = getProps('ref')(settings)

  const getRefs = getCRUrls(isCRUrl(3))
  const handleRefs = handleCRUrl(refProps)(handleRefNumber(recordedNumbers))
  result = updateParagraphs(paragraphs)(getRefs)(handleRefs)

  if (result instanceof CRError) {
    handleErr(result)
    return 'error'
  }
}


/** ALL TESTS */

function runAllTests() {
  testAllSettings()
  testAllText()
}
