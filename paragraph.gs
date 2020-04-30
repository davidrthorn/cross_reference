const isCRUrl = (url, codeLength) => (new RegExp('#[^_]{' + codeLength + '}_')).test(url)

const getNumberHandler = (type, recordedNumbers, labelNameNumberMap) =>
  type === 'lab'
    ? (url) => { // TODO: handle dupes?
      const refEquivalent = '#' + code + url.substr(6);
      const num = labelNumbers[code] + 1 || 1;

      recordedNumbers[refEquivalent] = num;
      labelNumbers[code] = num;

      return num;
    }
    : (url) => url in recordedNumbers ? recordedNumbers[url] : new Error('missref');


function updateParagraphs(paragraphs, isLabel, props, handleNumbering) {
  const labelTotals = {};

  for (let i = 0, len = paragraphs.length; i < len; i++) {
    const text = paragraphs[i].editAsText();

    const CRUrls = getCRUrls(text, isLabel ? 5 : 3);

    if (!CRUrls.length) continue;

    if (isLabel && CRUrls.length > 1) {
      return new CRError(text, CRUrls, 'multiple')
    }

    for (let i = CRUrls.length; i--;) { // iterate backwards because we're changing the underlying text length
      const CRUrl = CURrl[i]
      const errDetails = [text, CRUrl]

      updateText(CRUrl, props, handleNumbering, text);
    }
  }
}


function updateText(CRUrl, props, handleNumbering, text) {
  const code = url.substr(1, 3);

  if (!(code in props)) {
    return new CRError(text, CRUrl, 'unrecognised')
  }

  const replacementText = capitalizeIfAppropriate(text, CRUrl.start, props.text)

  const num = handleNumbering(url)
  if (num instanceof Error) return new CRError(text, CRUrl, num.message())

  replacementText += num;

  const style = {
    'BOLD': props.isBold,
    'ITALIC': props.isItalic,
    'UNDERLINE': props.isUnderlined,
    'FOREGROUND_COLOR': (props.color && props.color !== 'null') ? '#' + props.color : null,
  }

  const { start, end, url } = CRUrl
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

    const isStart = !isCRUrl(urlToTheLeft, codeLength) && isCRUrl(urlHere, codeLength)
    const isEnd = isCRUrl(urlToTheLeft, codeLength) && !isCRUrl(urlHere, codeLength)

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

function getLabelNumber(url, code, numPairs, labelNumbers) {
  const refEquivalent = '#' + code + url.substr(6);
  const num = labelNumbers[code] + 1 || 1;

  numPairs[refEquivalent] = num;
  labelNumbers[code] = num;

  return num;
}
