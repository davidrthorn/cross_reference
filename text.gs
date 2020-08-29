const isCRUrl = codeLength => url => (new RegExp('^#[^_]{' + codeLength + '}_')).test(url)

function codeFromUrl(url) {
  if (!url) return null
  const match = url.match(/^#([^_]{3}|[^_]{5})_/)
  return match ? match[1] : null
}

// numberForRefUrl stores the number assigned to a particular label, but uses the ref_url format as its key (e.g. {#fig_bird: 1}).
// It will be used when we process references.
// countByLabelType stores the current count for a given label type (e.g. {fig: 3, tab: 4}).
// We use this to number the current label.
const handleLabNumber = numberForRefUrl => countByLabelType => url => {
  const code = codeFromUrl(url)
  const refEquivalent = '#' + code.substr(0, 3) + '_' + url.substr(7)
  const num = countByLabelType[code] + 1 || 1

  if (refEquivalent in numberForRefUrl) return new Error('duplicate')

  numberForRefUrl[refEquivalent] = num
  countByLabelType[code] = num

  return num
}

const handleRefNumber = numberForRefUrl => url => numberForRefUrl[url] || new Error('missref')


const updateText = CRUrls => handleCR => {
  let i = CRUrls.length 
  while (i--) { // iterate backwards because we're changing the underlying text length
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
  'BOLD':             prop.isBold,
  'ITALIC':           prop.isItalic,
  'UNDERLINE':        prop.isUnderlined,
  'FOREGROUND_COLOR': prop.color,
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

  replacementText += num + prop.suffix
  replacementText = replacementText.replace(' ', '\xA0')
  
  const style = getStyle(prop)

  replaceText(text, CRUrl, replacementText, style)
}


const handleFootnoteLabCRUrl = props => handleNumbering => text => CRUrl => {
  const foundCode = codeFromUrl(CRUrl.url)
  if (foundCode !== 'fnote') return
  const prop = props[foundCode]

  const num = handleNumbering(CRUrl.url)
  if (num instanceof Error) {
    return new CRError(text, CRUrl, num.message)
  }

  text.setAttributes(CRUrl.start, CRUrl.end, {'UNDERLINE': null, 'FOREGROUND_COLOR': '#000000'})
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
