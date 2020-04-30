function handleErr(err) {
  const type = err[0];
  const details = err[1];
  const [text, start, end, url] = details;

  let message = 'An unknown error occurred.' +
    '\n\nPlease raise an in issue at' +
    '\ngithub.com/davidrthorn/cross_reference' +
    '\nif this persists';

  switch (type) {
    case 'duplicate':
      message = 'There are two labels with the code ' + url + '.' +
        "\n\nLabel codes must be 5 letters and label names (e.g. '" +
        url.substr(7) + "') must be unique."
    case 'multiple':
      message = 'One of your paragraphs contains more than one label.' +
        '\n\nParagraphs may contain multiple references, but only one label.' +
        '\nYou probably meant to insert a reference. The last label in' +
        '\nthe paragraph has been highlighed in red.'
    case 'missref':
      message = 'The reference highlighted in red has nothing to refer to.' +
        '\nIt might contain a typo or the corresponding label might be missing.' +
        '\n\nUpdating the document when this has been fixed will automatically' +
        '\nrestore the correct colour.'
    case 'unrecognised':
      message = 'The label starting ' + url.substr(0, 4) + ' was not recognised.' +
        '\nIt might be a typo or it might be a custom label you' +
        '\nhave not yet added in the configuration sidebar.'
  }
  DocumentApp.getUi().alert(message)

  addFlag(text, start, end);
}


// Highlight an erroneous label or reference
function addFlag(text, start, end) {
  const doc = DocumentApp.getActiveDocument();
  const position = doc.newPosition(text, start);

  text.setForegroundColor(start, end, '#FF0000');
  doc.setCursor(position);
}

function CRError(containingText, CRUrls, error) {
  return {
    text: containingText,
    CRUrls: CRUrls,
    error: error,
  }
}
