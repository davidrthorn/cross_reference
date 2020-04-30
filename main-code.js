//
// 1. Set things up
// 2. Deal with properties
// 3. Update references
// 4. Error handling
// 5. Footnote references EXPERIMENTAL
//


//
// # Set things up
//


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


//
// # Deal with properties
//


function getStoredProps(type) {
  const userProps = PropertiesService.getUserProperties().getProperties();
  const docProps = PropertiesService.getDocumentProperties().getProperties();

  let settings = getDefaultSettings();
  overwriteSettings(settings, userProps);
  overwriteSettings(settings, docProps);

  return getPropsForType(type, settings)
}

function overwriteSettings(settings, storedProps) {
  let final = {}
  for (const propKey in storedProps) {
    if (!isCrossProp(propKey)) continue;
    const prop = storedProps[propKey];
    const decoded = decodeSettings(prop);
    final = {decoded, ...final}
  }
}

function copyUserPropsToDocProps() {

  const user_props = PropertiesService.getUserProperties().getProperties();
  const docProps = PropertiesService.getDocumentProperties();
  const doc_props = docProps.getProperties();
  const defaults = getDefaultSettings();
  const props = {
    'cross_fig': encodeSettings(defaults.Figure),
    'cross_tab': encodeSettings(defaults.Table),
    'cross_equ': encodeSettings(defaults.Equation),
    'cross_fno': encodeSettings(defaults.Footnote),
  };

  for (const u in user_props) {
    props[u] = user_props[u];
  }

  for (const d in doc_props) {
    props[d] = doc_props[d];
  }

  docProps.setProperties(props);
}


//
// # Update references
//


function updateDoc() {

  const document = DocumentApp.getActiveDocument();
  const paragraphs = document.getBody().getParagraphs();
  const footnotes = document.getFootnotes();

  const labProps = getStoredProps('lab');
  const refProps = getStoredProps('ref');

  copyUserPropsToDocProps();

  const numPairs = updateParagraphs(paragraphs, true, labProps);

  // fnLabs(footnotes, labProps, numPairs);

  if (Array.isArray(numPairs)) {
    handleErr(numPairs);
    return 'error';
  };

  const error = updateParagraphs(paragraphs, false, refProps, numPairs);

  if (Array.isArray(error)) {
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


function updateParagraphs(paragraphs, isLabel, props, numPairs) {
  const codeLen = isLabel ? 5 : 3;

  // Stores the numbers associated with individual labels
  numPairs = numPairs || {};

  // Stores running total for each label type
  const labNums = {};

  for (const i = 0, len = paragraphs.length; i < len; i++) {
    const text = paragraphs[i].editAsText();

    const CRUrls = getCRUrls(text, codeLen);

    if (!CRUrls.length) {
      return;
    }

    if (isLabel && CRUrls.length > 1) {
      return ['multiple', errDetails];
    }

    for (const j = CRUrls.length; j--;) { // iterate backwards because we are changing the text as we go
      const CRUrl = CURrl[j]
      const errDetails = [text, CRUrl]
      updateText(CRUrl, props, numPairs, labNums, text);
    }
  }
  return numPairs;
}

function updateParagraph(paragraph, codeLen, isLabel, url, props, numPairs, labNums) {

}

function updateText(CRUrl, props, numPairs, labNums, text) {
  const { start, end, url } = CRUrl

  const code = url.substr(1, 3);

  if (!(code in props)) {
    return ['unrecognised', errDetails];
  }

  // Get replacement text
  const replacementText = props[code][0]; // TODO: this should be object based

  replacementText = capitalizeIfAppropriate(text, start, replacementText)

  const num = isLabel
    ? getLabelNumber(url, code, numPairs, labNums)
    : numPairs[url] || 'missref';

  if (num === 'duplicate' || num === 'duplicate') return [num, errDetails];

  // Append number
  replacementText += num;

  const style = setStyle(props, code);
  executeTextUpdate(CRUrl, replacementText, style, text)
}

function executeTextUpdate(CRUrl, replacementText, style, text) {
  const replacementEnd = start + replacementText.length - 1;
  text.deleteText(start, end)
    .insertText(start, replacementText)
    .setLinkUrl(start, replacementEnd, url)
    .setAttributes(start, replacementEnd, style)
}

function getCRUrls(text, codeLength) {
  const len = text.getText().length;
  const idxs = text.getTextAttributeIndices().push(len) // the final index is the end of the text

  const CRUrls = [];

  for (const i = 0; i < idxs.length; i++) {
    const idx = idxs[i];

    const urlHere = idx !== len ? text.getLinkUrl(idx) : null;
    const urlToTheLeft = i > 0 ? text.getLinkUrl(idx - 1) : null;

    const isStart = !isCRUrl(urlToTheLeft) && isCRUrl(urlHere)
    const isEnd = isCRUrl(urlToTheLeft) && !isCRUrl(urlHere)

    if (isStart) {
      CRUrls.push({
        start: idx,
        url: urlHere,
      });
    }
    if (isEnd) {
      CRUrls[CRUrls.length - 1].end = idx - 1;
    }
  }
  return CRUrls;
}

function isCRUrl(url) {
  const re = new RegExp('#[^_]{' + codeLength + '}_');
  return re.test(url)
}

function capitalizeIfAppropriate(text, start, replacementText) {

  const t = text.getText();
  const first = replacementText.charAt(0);
  const upper = first.toUpperCase();

  if (first === upper) return replacementText;

  const b1 = t.charAt(start - 1);
  const b2 = t.charAt(start - 2);
  const b3 = t.charAt(start - 3);
  const b4 = t.charAt(start - 4);
  const b5 = t.charAt(start - 5);

  const isInCapitalizationContext = 
    !b1 ||
    b1 === '\r' ||
    /(\!|\?)/.test(b2) ||
    (b2 === '.' && b4 !== '.') ||
    (b2 === '”' && /(\!|\?)/.test(b3)) ||
    (b1 === '(' && /(\!|\?|\.)/.test(b3) && b5 !== '.')

  return isInCapitalizationContext
    ? upper + replacementText.slice(1)
    : replacementText
}

function shouldCapitalize(text, start) {

}


function getLabelNumber(url, code, numPairs, labelNumbers) {

  const refEquivalent = '#' + code + url.substr(6);
  const num = labelNumbers[code] + 1 || 1;

  numPairs[refEquivalent] = num;
  labelNumbers[code] = num;

  return num;
}

function addToLabelNumbers(code, url, labelNumbers) {

}


function setStyle(props, code) {
  const col = props[code][4];
  const color = (col && col != 'null') ? '#' + col : null;

  return {
    'BOLD': props[code][1],
    'ITALIC': props[code][2],
    'UNDERLINE': props[code][3],
    'FOREGROUND_COLOR': color
  };
}


//
// # Error handling
//


function handleErr(err) {
  const type = err[0];
  const details = err[1];
  const [text, start, end, url] = details;

  if (type === 'duplicate') {
    DocumentApp.getUi().alert('There are two labels with the code ' + url + '.' +
      "\n\nLabel codes must be 5 letters and label names (e.g. '" +
      url.substr(7) + "') must be unique."
    );
  } else if (type === 'multiple') {
    DocumentApp.getUi().alert('One of your paragraphs contains more than one label.' +
      '\n\nParagraphs may contain multiple references, but only one label.' +
      '\nYou probably meant to insert a reference. The last label in' +
      '\nthe paragraph has been highlighed in red.'
    );
  } else if (type === 'missref') {
    DocumentApp.getUi().alert('The reference highlighted in red has nothing to refer to.' +
      '\nIt might contain a typo or the corresponding label might be missing.' +
      '\n\nUpdating the document when this has been fixed will automatically' +
      '\nrestore the correct colour.'
    );
  } else if (type === 'unrecognised') {
    DocumentApp.getUi().alert('The label starting ' + url.substr(0, 4) + ' was not recognised.' +
      '\nIt might be a typo or it might be a custom label you' +
      '\nhave not yet added in the configuration sidebar.'
    );
  }

  addFlag(text, start, end);
}


// Highlight an erroneous label or reference
function addFlag(text, start, end) {
  const doc = DocumentApp.getActiveDocument();
  const position = doc.newPosition(text, start);

  text.setForegroundColor(start, end, '#FF0000');
  doc.setCursor(position);
}


//
// # Footnote labelling EXPERIMENTAL
//


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


//
// # General helper functions
//

function toCap(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();

}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())

}
