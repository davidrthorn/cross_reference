function onInstall(e) {
  onOpen(e)
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDoc')
    .addItem('Configure', 'showSidebar')
    .addSeparator()
    .addItem('Create list of figures (beta)', 'createLoF')
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
  const paragraphs = document.getBody().getParagraphs()
  const footnotes = document.getFootnotes()

  const settings = getSettings()
  updateDocProps(settings)

  const recordedNumbers = {}
  const labelNameNumberMap = {}

  const handleLabNumber = getNumberHandler('lab', recordedNumbers, labelNameNumberMap)
  const labProps = getProps('lab', settings)

  const getLabs = getCRUrls(isCRUrl(5))
  const handleLabs = handleCRUrl(labProps)(handleLabNumber)
  let error = updateParagraphs(paragraphs)(getLabs)(handleLabs)

  // fnLabs(footnotes, labProps, numPairs)

  if (error instanceof CRError) {
    handleErr(error)
    return 'error'
  }

  const handleRefNumber = getNumberHandler('ref', recordedNumbers)
  const refProps = getProps('ref', settings)

  const getRefs = getCRUrls(isCRUrl(3))
  const handleRefs = handleCRUrl(refProps)(handleRefNumber)
  error = updateParagraphs(paragraphs)(getRefs)(handleRefs)

  if (error instanceof CRError) {
    handleErr(error)
    return 'error'
  }

  // for (const i = 0, len = footnotes.length i < len i++) {
  //   const f_paras = footnotes[i].getFootnoteContents().getParagraphs()
  //   error = updateParagraphs(f_paras, false, numPairs, refProps)
  //   if (Array.isArray(error)) {
  //     handleErr(error)
  //     return 'error'
  //   }
  // }
}


/** ALL TESTS */

function runAllTests() {
  testAllSettings()
  testAllText()
}
