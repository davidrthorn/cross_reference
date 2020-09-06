const isCRUrl = codeLength => url => (new RegExp('^#[^_]{' + codeLength + '}_')).test(url)

const handleRefNumber = numberForRefUrl => url => numberForRefUrl[url] || new Error('missref')

const isCapitalized = str => str !== '' && str.charAt(0) === str.charAt(0).toUpperCase()

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)


function codeFromUrl(url) {
  if (!url) return
  const match = url.match(/^#([^_]{3}|[^_]{5})_/)
  return match ? match[1] : null
}


/*
@var numForRefUrl : {} -- map of `ref url` to `number for the corresponding label`
@var countByLabelType : {} -- map of `label code` to `count of code in document`
@var url : string -- the current url
@return int | error -- the number for the current label
*/
const handleLabNumber = numberForRefUrl => countByLabelType => url => {
  const code = codeFromUrl(url)
  const refEquivalent = '#' + code.substr(0, 3) + '_' + url.substr(7)
  
  const num = countByLabelType[code] + 1 || 1

  if (refEquivalent in numberForRefUrl) return new Error('duplicate')

  numberForRefUrl[refEquivalent] = num
  countByLabelType[code] = num

  return num
}


/*
@var CRUrls : [{start, end, url}]
@var handleCR : {start, end, url} -> ?error
*/
const updateText = CRUrls => handleCR => {
  let i = CRUrls.length
  while (i--) { // iterate backwards because we're changing the underlying text length
    const error = handleCR(CRUrls[i])
    if (error) {
      return error
    }
  }
}

/*
@var paragraphs : [paragraphs]
@var getCRs : text -> [{start, end, url}]
@var handleText : text -> [{start, end, url}] -> ?error
@return ?error
*/
const updateParagraphs = paragraphs => getCRs => handleText => {
  for (let i = 0, len = paragraphs.length; i < len; i++) {
    const text = paragraphs[i].editAsText()

    const CRUrls = getCRs(text)
    if (!CRUrls.length) continue

    const handleCR = handleText(text)
    const error = updateText(CRUrls)(handleCR)
    if (error) {
      return error
    }
  }
}


const replaceText = (text, CRUrl, replacementText, style) => {
  const { start, end, url } = CRUrl
  const replacementEnd = start + replacementText.length - 1
  const size = text.getFontSize(start)
  
  text.deleteText(start, end)
    .insertText(start, replacementText)
    .setLinkUrl(start, replacementEnd, url)
    .setAttributes(start, replacementEnd, style)
    .setFontSize(start, replacementEnd, size)
}


const getStyle = prop => ({
  'BOLD':             prop.isBold,
  'ITALIC':           prop.isItalic,
  'UNDERLINE':        prop.isUnderlined,
  'FOREGROUND_COLOR': prop.color,
})

/*
@var props : {} -- map of `code` to `properties`
@var handleNumbering : {start, end, url} -> int
@var text : Text
@var CRUrl : {start, end, url}
@return ?error
*/
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


/*
@var props : {} -- map of `code` to `properties`
@var handleNumbering : {start, end, url} -> int
@var text : Text
@var CRUrl : {start, end, url}
@return ?error
*/
const handleFootnoteLabCRUrl = props => handleNumbering => text => CRUrl => {
  const foundCode = codeFromUrl(CRUrl.url)
  if (foundCode !== 'fnote') return

  const num = handleNumbering(CRUrl.url)
  if (num instanceof Error) {
    return new CRError(text, CRUrl, num.message)
  }

  text.setAttributes(CRUrl.start, CRUrl.end, {'UNDERLINE': null, 'FOREGROUND_COLOR': '#000000'})
}


/*
@var isCRUrl : string -> bool
@var text : Text
@return [{start, end, url}]
*/
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


const capitalizeIfAppropriate = (text, start, replacementText) =>
  isCapitalized(replacementText) || !isCapitalized(text.substr(start, start + 1))
    ? replacementText
    : capitalize(replacementText)
