const CRUrlChecker = (codeLength) => (url) => (new RegExp('^#[^_]{' + codeLength + '}_')).test(url)
const codeFromUrl = (url) => url.substr(1, 3)

const getNumberHandler = (type, recordedNumbers, labelNameNumberMap) =>
  type === 'lab'
    ? (url) => {
      const code = codeFromUrl(url)
      const refEquivalent = '#' + code + '_' + url.substr(5);
      const num = labelNameNumberMap[code] + 1 || 1;

      if (refEquivalent in recordedNumbers) return new Error('duplicate')

      recordedNumbers[refEquivalent] = num;
      labelNameNumberMap[code] = num;

      return num;
    }
    : (url) => recordedNumbers[url] || new Error('missref');


function updateParagraphs(paragraphs, isLabel, props, handleNumbering) {
  for (let i = 0, len = paragraphs.length; i < len; i++) {
    const text = paragraphs[i].editAsText()

    const result = updateText(text, isLabel, props, handleNumbering)
    if (result instanceof CRError) {
      return result
    }
  }
}


function updateText(text, isLabel, props, handleNumbering) {
  const isCRUrl = CRUrlChecker(isLabel ? 5 : 3)
  const CRUrls = getCRUrls(text, isCRUrl)

  if (!CRUrls.length) return
  
  if (isLabel && CRUrls.length > 1) {
    return new CRError(text, CRUrls, 'multiple')
  }

  for (let i = CRUrls.length; i--;) { // iterate backwards because we're changing the underlying text length
    const CRUrl = CRUrls[i]

    const result = handleCRUrl(props, text, CRUrl, handleNumbering)
    if (result instanceof CRError) {
      return result
    }
  }
}


function handleCRUrl(props, text, CRUrl, handleNumbering) {
  const code = codeFromUrl(CRUrl.url)
  
  const prop = props[code]
  if (!prop) {
    return new CRError(text, CRUrl, 'unrecognised')
  }
  
  let replacementText = capitalizeIfAppropriate(text.getText(), CRUrl.start, prop.text)
  const num = handleNumbering(CRUrl.url)
  if (num instanceof Error) {
    return new CRError(text, CRUrl, num.message)
  }

  replacementText += num;

  const style = getStyle(prop)

  replaceText(text, CRUrl, replacementText, style)
}


const replaceText = (text, CRUrl, replacementText, style) => {
  const { start, end, url } = CRUrl
  const replacementEnd = start + replacementText.length - 1;
  text.deleteText(start, end)
    .insertText(start, replacementText)
    .setLinkUrl(start, replacementEnd, url)
    .setAttributes(start, replacementEnd, style)
}


const getStyle = (prop) => ({
  'BOLD': prop.isBold,
  'ITALIC': prop.isItalic,
  'UNDERLINE': prop.isUnderlined,
  'FOREGROUND_COLOR': (prop.color && prop.color !== 'null') ? '#' + prop.color : null,
})


function getCRUrls(text, isCRUrl) {
  const textLength = text.getText().length;
  const idxs = text.getTextAttributeIndices()
  idxs.push(textLength) // the final index is the end of the text

  const CRUrls = [];

  for (let i = 0; i < idxs.length; i++) {
    const idx = idxs[i];

    const urlHere = idx !== textLength ? text.getLinkUrl(idx) : null;
    const urlToTheLeft = i > 0 ? text.getLinkUrl(idx - 1) : null;

    const isStart = !isCRUrl(urlToTheLeft) && isCRUrl(urlHere)
    const isEnd = isCRUrl(urlToTheLeft) && !isCRUrl(urlHere)
    
    if (isStart) {
      CRUrls.push({ start: idx, url: urlHere })
    }
    if (isEnd) {
      CRUrls[CRUrls.length - 1].end = idx - 1
    }
  }
  return CRUrls
}


const isCapitalized = (str) => str !== '' && str.charAt(0) === str.charAt(0).toUpperCase()


const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)


const capitalizeIfAppropriate = (text, start, replacementText) => 
  isCapitalized(replacementText) || !isCapitalized(text.substr(start, start + 1))
    ? replacementText
    : capitalize(replacementText)


// TODO: footnotes
function fnLabs(footnotes, fnProps, num_pairs) {
  const isCRUrl = CRUrlChecker(5)
  for (let i = 0; i < footnotes.length; i++) {
    const paras = footnotes[i].getFootnoteContents().getParagraphs();
    for (let j = 0; j < paras.length; j++) {
      const text = paras[j].editAsText();
      const { start, end, url } = getCRUrls(text, isCRUrl);

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
