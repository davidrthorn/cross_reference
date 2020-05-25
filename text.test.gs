function testAllText() {
  testSuite('text.js', [
    testGetStyle,
    testCodeFromCRUrl,
    testCapitalizeIfAppropriate,
    testIsCapitalized,
    testCapitalize,
    testLabelNumberHandler,
    testRefNumberHandler,
  ])
}

function testCodeFromCRUrl() {
  It('ref url returns 3-string code',
    codeFromUrl('#fig_hello'),
    'fig'
  )
  It('lab url returns 5 string code',
    codeFromUrl('#figur_hello'),
    'figur'
  )
  It('returns null for other url',
    codeFromUrl('https://google.com'),
    null
  )
  It('returns null for malformed CRUrl',
    codeFromUrl('#figu_hello'),
    null
  )
}

function testCapitalizeIfAppropriate() {
  It('returns capitalized when reference text is already capitalized',
    capitalizeIfAppropriate('aa bb Figure', 5, 'Figure'),
    'Figure'
  )
  It('returns capitalized when text to replace is already capitalized',
    capitalizeIfAppropriate('aa bb Figur', 5, 'figure'),
    'Figure'
  )
  It('returns uncapitalized when text to replace is not capitalized',
    capitalizeIfAppropriate('aa bb figur', 5, 'figure'),
    'Figure'
  )
}

function testCapitalize() {
  It('returns empty for empty',
    capitalize(''),
    ''
  )
  It('capitalizes non-empty string',
    capitalize('hello'),
    'Hello'
  )
  It('does not modify already capitalized',
    capitalize('Hello'),
    'Hello'
  )
}

function testIsCapitalized() {
  It('returns false for empty string',
    isCapitalized(''),
    false
  )
  It('returns true if is capitalized',
    isCapitalized('Hello'),
    true
  )
  It('returns false if not capitalize',
    isCapitalized('hello'),
    false
  )
}

function testLabelNumberHandler() {
  let recordedNumbers = {
    '#fig_first': 1,
  }
  let labelNameNumberMap = {
    'figur': 1,
    'table': 2,
  }
  let sut = handleLabNumber(recordedNumbers, labelNameNumberMap)

  let got = sut('#figur_somename')

  It('increments the existing entry in the label map',
    labelNameNumberMap['figur'],
    2
  )
  
  It('records the url in the recorded numbers',
    recordedNumbers,
    {
      '#fig_first': 1,
      '#fig_somename': 2,
    }
  )

  It('returns the correct number',
    got,
    2
  )

  got =
    It('returns duplicate error',
      sut('#figur_first').message,
      'duplicate'
    )
}


function testRefNumberHandler() {
  let recordedNumbers = {
    '#fig_first': 1,
    '#fig_second': 2,
  }
  let sut = handleRefNumber(recordedNumbers)

  let got = sut('#fig_second')
  It('returns correct number for url',
    got,
    2
  )
  It('returns error for missing url',
    sut('#fig_missing').message,
    'missref'
  )
}


function testGetStyle() {
  let settings = getDefaultSettings()
  let props = getProps('lab')(settings)

  let got = getStyle(props.figur)
  It('returns correct style object for default',
    got,
    { BOLD: false, ITALIC: false, UNDERLINE: false, FOREGROUND_COLOR: null }
  )
}


function testGetCRUrls() {
  let mockText = {
    getText: () => 'lorem ipsum',
    getTextAttributeIndices: () => [6, 10],
    getLinkUrl: idx => [6, 9].includes(idx) ? '#figur_test' : null
  }
  const isCR = isCRUrl(5)

  It('returns start and url',
    getCRUrls(isCR)(mockText),
    [{ start: 6, end: 9, url: '#figur_test'}]
  )

  mockText.getLinkUrl = idx => [6, 9].includes(idx) ? '#figur_test' : 'https://google.com'
  It("doesn't get broken by surrounding links",
    getCRUrls(isCR)(mockText),
    [{ start: 6, end: 9, url: '#figur_test'}]
  )

}
