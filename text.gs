const isCRUrl = codeLength => url => (new RegExp('^#[^_]{' + codeLength + '}_')).test(url)

function codeFromUrl(url) {
  if (!url) return null
  const match = url.match(/^#([^_]{3}|[^_]{5})_/)
  return match ? match[1] : null
}

const getNumberHandler = (type, recordedNumbers, labelNameNumberMap) => //TODO: this is an ugly function
  type === 'lab'
    ? (url) => {
      const code = codeFromUrl(url)
      const refEquivalent = '#' + code + '_' + url.substr(5)
      const num = labelNameNumberMap[code] + 1 || 1

      if (refEquivalent in recordedNumbers) return new Error('duplicate')

      recordedNumbers[refEquivalent] = num
      labelNameNumberMap[code] = num

      return num
    }
    : (url) => recordedNumbers[url] || new Error('missref')


const updateText = CRUrls => handleCR => {
  for (let i = CRUrls.length; i--;) { // iterate backwards because we're changing the underlying text length
    const CRUrl = CRUrls[i]

    const result = handleCR(CRUrl)
    if (result instanceof CRError) {
      return result
    }
  }
}


const updateParagraphs = paragraphs => getCRs => handleText => {
  for (let i = 0, len = paragraphs.length; i < len; i++) {
    const text = paragraphs[i].editAsText()

    const CRUrls = getCRs(text)
    if (!CRUrls.length) continue

    const handleCR = handleText(text)
    const result = updateText(CRUrls)(handleCR)
    if (result instanceof CRError) {
      return result
    }
  }
}


const replaceText = (text, CRUrl, replacementText, style) => {
  const { start, end, url } = CRUrl
  const replacementEnd = start + replacementText.length - 1
  text.deleteText(start, end)
    .insertText(start, replacementText)
    .setLinkUrl(start, replacementEnd, url)
    .setAttributes(start, replacementEnd, style)
}


const getStyle = prop => ({
  'BOLD': prop.isBold,
  'ITALIC': prop.isItalic,
  'UNDERLINE': prop.isUnderlined,
  'FOREGROUND_COLOR': (prop.color && prop.color !== 'null') ? '#' + prop.color : null, // TODO: surely we can make this data clean when creating settings
})


const handleCRUrl = props => handleNumbering => text => CRUrl => {
  const foundCode = codeFromUrl(CRUrl.url)
  const prop = props[foundCode]
  if (!prop) {
    return new CRError(text, CRUrl, 'unrecognised')
  }

  let replacementText = capitalizeIfAppropriate(text.getText(), CRUrl.start, prop.text)
  const num = handleNumbering(CRUrl.url)
  if (num instanceof Error) {
    return new CRError(text, CRUrl, num.message)
  }

  replacementText += num

  const style = getStyle(prop)

  replaceText(text, CRUrl, replacementText, style)
}


const getCRUrls = isCRUrl => text => {
  const textLength = text.getText().length
  const idxs = text.getTextAttributeIndices()
  idxs.push(textLength) // the final index is the end of the text

  const CRUrls = []

  for (let i = 0, len = idxs.length; i < len; i++) {
    const idx = idxs[i]

    const urlHere = idx !== textLength ? text.getLinkUrl(idx) : null
    const urlToTheLeft = i > 0 ? text.getLinkUrl(idx - 1) : null

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


const isCapitalized = str => str !== '' && str.charAt(0) === str.charAt(0).toUpperCase()


const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)


const capitalizeIfAppropriate = (text, start, replacementText) =>
  isCapitalized(replacementText) || !isCapitalized(text.substr(start, start + 1))
    ? replacementText
    : capitalize(replacementText)


// TODO: footnotes
function fnLabs(footnotes, fnProps, num_pairs) {
  const isCRUrl = isCRUrl(5)
  for (let i = 0; i < footnotes.length; i++) {
    const paras = footnotes[i].getFootnoteContents().getParagraphs()
    for (let j = 0; j < paras.length; j++) {
      const text = paras[j].editAsText()
      const { start, end, url } = getCRUrls(text, isCRUrl)

      if (!start) continue
      if (url.substr(0, 4) != '#fno') continue

      const ref_equiv = url.substr(0, 4) + url.substr(6)
      num_pairs[ref_equiv] = [i + 1]
      text.setUnderline(start, end, null)
        .setForegroundColor(start, end, null)
    }
  }

  return num_pairs
}
