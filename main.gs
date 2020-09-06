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
  const sidebar = HtmlService.createTemplateFromFile('sidebar-html').evaluate()
  sidebar.setTitle('Cross Reference')
  DocumentApp.getUi().showSidebar(sidebar)
}

function updateDoc() {
  const document = DocumentApp.getActiveDocument()
  const paragraphs = document.getBody().getParagraphs()
  const footnotes = document.getFootnotes()

  const settings = getSettings()
  updateDocProps(settings)

  const recordedNumbers = {}
  const labelNameNumberMap = {}

  const labProps = getProps('lab')(settings)

  const getLabs = getCRUrls(isCRUrl(5))
  const handleNumbering = handleLabNumber(recordedNumbers)(labelNameNumberMap)
  const handleLabs = handleCRUrl(labProps)(handleNumbering)
  let error = updateParagraphs(paragraphs)(getLabs)(handleLabs)
  if (error) {
    handleErr(error)
    return 'error'
  }

  for (let i = 0, len = footnotes.length; i < len; i++) {
    const footnoteParagraphs = footnotes[i].getFootnoteContents().getParagraphs()
    const handleFNLabs = handleFootnoteLabCRUrl(labProps)(handleNumbering)
    const error = updateParagraphs(footnoteParagraphs)(getLabs)(handleFNLabs)
    if (error) {
      handleErr(error)
      return 'error'
    }
  }

  const refProps = getProps('ref')(settings)

  const getRefs = getCRUrls(isCRUrl(3))
  const handleRefs = handleCRUrl(refProps)(handleRefNumber(recordedNumbers))
  error = updateParagraphs(paragraphs)(getRefs)(handleRefs)
  if (error) {
    handleErr(error)
    return 'error'
  }
}

/** ALL TESTS */

function runAllTests() {
  testAllSettings()
  testAllText()
}
