function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Update document', 'updateDoc')
    .addItem('Configure', 'showSidebar')
    .addSeparator()
    .addItem('Create list of figures (beta)', 'createLoF')
    .addToUi();
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function showSidebar() {
  const sidebar = HtmlService.createTemplateFromFile('sidebar').evaluate();
  sidebar.setTitle('Cross Reference');
  DocumentApp.getUi().showSidebar(sidebar);
}

function updateDoc() {
  const document = DocumentApp.getActiveDocument();
  const paragraphs = document.getBody().getParagraphs();
  const footnotes = document.getFootnotes();

  const labProps = getStoredProps('lab');
  const refProps = getStoredProps('ref');

  copyUserPropsToDocProps();

  const [recordedNumbers, labelNameNumberMap] = [{}, {}]
  const handleLabNumber = getNumberHandler('lab', recordedNumbers, labelNameNumberMap)

  let error = updateParagraphs(paragraphs, true, labProps, handleLabNumber);

  // fnLabs(footnotes, labProps, numPairs);

  if (error instanceof CRError) {
    handleErr(error);
    return 'error';
  };

  const handleRefNumber = getNumberHandler('ref', recordedNumbers, labelNameNumberMap)
  error = updateParagraphs(paragraphs, false, refProps, handleRefNumber);

  if (error instanceof CRError) {
    handleErr(error);
    return 'error';
  };

  // for (const i = 0, len = footnotes.length; i < len; i++) {
  //   const f_paras = footnotes[i].getFootnoteContents().getParagraphs();
  //   error = updateParagraphs(f_paras, false, numPairs, refProps);
  //   if (Array.isArray(error)) {
  //     handleErr(error);
  //     return 'error';
  //   };
  // };
}


function fnLabs(foots, fn_props, num_pairs) {
  for (const i = 0; i < foots.length; i++) {
    const paras = foots[i].getFootnoteContents().getParagraphs();
    for (const j = 0; j < paras.length; j++) {
      const text = paras[j].editAsText();
      const { start, end, url } = getCRUrls(text, 5);

      if (!start) continue;
      if (url.substr(0, 4) != '#fno') continue;

      const ref_equiv = url.substr(0, 4) + url.substr(6);
      num_pairs[ref_equiv] = [i + 1];
      text.setUnderline(start, end, null)
        .setForegroundColor(start, end, null);
    }
  }

  return num_pairs;
}
