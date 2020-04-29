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
  var sidebar = HtmlService.createTemplateFromFile('sidebar').evaluate();
  sidebar.setTitle('Cross Reference');
  DocumentApp.getUi().showSidebar(sidebar);
}


//
// # Deal with properties
//


function getStored(isLab) {

  var userProps = PropertiesService.getUserProperties().getProperties();
  var docProps = PropertiesService.getDocumentProperties().getProperties();
  var slice = isLab ? [2, 6, 10] : [6, 10, 11];

  // Default properties
  var props = {
    'fig': ['figure ', null, null, null, null],
    'tab': ['table ', null, null, null, null],
    'equ': ['equation ', null, null, null, null],
    'fno': ['fn. ', null, null, null, null]
  };

  // Overwrite with user properties if they exist
  overwriteProps(props, userProps, slice, true);

  // Overwrite with document properties if they exist
  overwriteProps(props, docProps, slice, false);

  return props;
}


function overwriteProps(to_overwrite, props, slice, is_user) {
  for (var prop in props) {
    if (!isCrossProp) continue;
    var prop_string = props[prop];
    var split_props = prop_string.split('_');
    var code = split_props[0].substr(0, 3);
    to_overwrite[code] = split_props.slice(slice[0], slice[1]);
    to_overwrite[code].push(split_props[slice[2]]);
  }
}


function copyUserPropsToDocProps() {

  var user_props = PropertiesService.getUserProperties().getProperties();
  var docProps = PropertiesService.getDocumentProperties();
  var doc_props = docProps.getProperties();
  var defaults = getDefaultSettings();
  var props = {
    'cross_fig': encodeSettings(defaults.Figure),
    'cross_tab': encodeSettings(defaults.Table),
    'cross_equ': encodeSettings(defaults.Equation),
    'cross_fno': encodeSettings(defaults.Footnote),
  };

  for (var u in user_props) {
    props[u] = user_props[u];
  }

  for (var d in doc_props) {
    props[d] = doc_props[d];
  }

  docProps.setProperties(props);
}


//
// # Update references
//


function updateDoc() {

  var document = DocumentApp.getActiveDocument();
  var paragraphs = document.getBody().getParagraphs();
  var footnotes = document.getFootnotes();

  var labProps = getStored(true);
  var refProps = getStored(false);

  copyUserPropsToDocProps();

  var numPairs = updateParagraphs(paragraphs, true, labProps);

  fnLabs(footnotes, labProps, numPairs);

  if (Array.isArray(numPairs)) {
    handleErr(numPairs);
    return 'error';
  };

  var error = updateParagraphs(paragraphs, false, refProps, numPairs);

  if (Array.isArray(error)) {
    handleErr(error);
    return 'error';
  };

  for (var i = 0, len = footnotes.length; i < len; i++) {
    var f_paras = footnotes[i].getFootnoteContents().getParagraphs();
    error = updateParagraphs(f_paras, false, numPairs, refProps);
    if (Array.isArray(error)) {
      handleErr(error);
      return 'error';
    };
  };
}


function updateParagraphs(paragraphs, isLabel, props, numPairs) {
  var codeLen = isLabel ? 5 : 3;

  // Stores the numbers associated with individual labels
  var numPairs = numPairs || {};

  // Stores running total for each label type
  var labNums = {};

  for (var i = 0, len = paragraphs.length; i < len; i++) {
    var text = paragraphs[i].editAsText();

    var CRUrls = getCRUrls(text, codeLen);

    if (!CRUrls.length) {
      return;
    }

    if (isLabel && CRUrls.length > 1) {
      return ['multiple', errDetails];
    }

    for (var j = CRUrls.length; j--;) { // iterate backwards because we are changing the text as we go
      var CRUrl = CURrl[j]
      var errDetails = [text, CRUrl]
      updateText(CRUrl, props, numPairs, labNums, text);
    }
  }
  return numPairs;
}

function updateParagraph(paragraph, codeLen, isLabel, url, props, numPairs, labNums) {

}

function updateText(CRUrl, props, numPairs, labNums, text) {
  var { start, end, url } = CRUrl

  var code = url.substr(1, 3);

  if (!(code in props)) {
    return ['unrecognised', errDetails];
  }

  // Get replacement text
  var replacementText = props[code][0]; // TODO: this should be object based

  replacementText = capitalizeIfAppropriate(text, start, replacementText)

  var num = isLabel
    ? getLabelNumber(url, code, numPairs, labNums)
    : numPairs[url] || 'missref';

  if (num === 'duplicate' || num === 'duplicate') return [num, errDetails];

  // Append number
  replacementText += num;

  var style = setStyle(props, code);
  executeTextUpdate(CRUrl, replacementText, style, text)
}

function executeTextUpdate(CRUrl, replacementText, style, text) {
  var replacementEnd = start + replacementText.length - 1;
  text.deleteText(start, end)
    .insertText(start, replacementText)
    .setLinkUrl(start, replacementEnd, url)
    .setAttributes(start, replacementEnd, style)
}

function getCRUrls(text, codeLength) {
  var len = text.getText().length;
  var idxs = text.getTextAttributeIndices().push(len) // the final index is the end of the text

  var CRUrls = [];

  for (var i = 0; i < idxs.length; i++) {
    var idx = idxs[i];

    var urlHere = idx !== len ? text.getLinkUrl(idx) : null;
    var urlToTheLeft = i > 0 ? text.getLinkUrl(idx - 1) : null;

    var isStart = !isCRUrl(urlToTheLeft) && isCRUrl(urlHere)
    var isEnd = isCRUrl(urlToTheLeft) && !isCRUrl(urlHere)

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
  var re = new RegExp('#[^_]{' + codeLength + '}_');
  return re.test(url)
}

function capitalizeIfAppropriate(text, start, replacementText) {

  var t = text.getText();
  var first = replacementText.charAt(0);
  var upper = first.toUpperCase();

  if (first === upper) return replacementText;

  var b1 = t.charAt(start - 1);
  var b2 = t.charAt(start - 2);
  var b3 = t.charAt(start - 3);
  var b4 = t.charAt(start - 4);
  var b5 = t.charAt(start - 5);

  var isInCapitalizationContext = 
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

  var refEquivalent = '#' + code + url.substr(6);
  var num = labelNumbers[code] + 1 || 1;

  numPairs[refEquivalent] = num;
  labelNumbers[code] = num;

  return num;
}

function addToLabelNumbers(code, url, labelNumbers) {

}


function setStyle(props, code) {
  var col = props[code][4];
  var color = (col && col != 'null') ? '#' + col : null;

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
  var type = err[0];
  var details = err[1];
  var [text, start, end, url] = details;

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
  var doc = DocumentApp.getActiveDocument();
  var position = doc.newPosition(text, start);

  text.setForegroundColor(start, end, '#FF0000');
  doc.setCursor(position);
}


//
// # Footnote labelling EXPERIMENTAL
//


function fnLabs(foots, fn_props, num_pairs) {
  for (var i = 0; i < foots.length; i++) {
    var paras = foots[i].getFootnoteContents().getParagraphs();
    for (var j = 0; j < paras.length; j++) {
      var text = paras[j].editAsText();
      var { start, end, url } = getCRUrls(text, 5);

      if (!start) continue;
      if (url.substr(0, 4) != '#fno') continue;

      var ref_equiv = url.substr(0, 4) + url.substr(6);
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
