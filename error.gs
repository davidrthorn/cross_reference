function handleErr(err) {
  addFlag(err.text, err.CRUrl)
  DocumentApp.getUi().alert(err.message)
}


function addFlag(text, CRUrl) {
  if (Number.isNaN(CRUrl.start) || Number.isNaN(CRUrl.end)) return

  const doc = DocumentApp.getActiveDocument();
  const position = doc.newPosition(text, CRUrl.start);

  text.setForegroundColor(CRUrl.start, CRUrl.end, '#FF0000');
  doc.setCursor(position);
}


function CRError(containingText, CRUrl, error) {
  const url = CRUrl.url
  const messages = {
    duplicate: 'There are at least 2 labels with the code ' + url + '.' +
        "\n\nLabel codes must be 5 letters and label names (e.g. '" +
        url.substr(7) + "') must be unique.",
    missref: 'There is a reference with nothing to refer to.' +
        '\nIt might contain a typo or the corresponding label might be missing.' +
        "\n\nClick 'OK' to see the reference highlighted. Updating the " +
        'document when this has been fixed will automatically' +
        '\nremove this highlighting.',
    unrecognised: "The label with code: '" + url.substr(1, 5) + "' was not recognised." +
        '\n\nIt might be a typo or it might be a custom label you' +
        '\nhave not yet added in the configuration sidebar.' +
        "\n\nClick 'OK' to see the label highlighted. Updating the " +
        '\ndocument when this has been fixed will automatically' +
        '\nremove this highlighting.',
  }
  
  return {
    text: containingText,
    CRUrl: CRUrl,
    error: error,
    message: messages[error],
  }
}
