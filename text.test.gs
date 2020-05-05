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
    'fig': 1,
    'tab': 2,
  }
  let sut = getNumberHandler('lab', recordedNumbers, labelNameNumberMap)

  let got = sut('#fig_somename')

  It('increments the existing entry in the label map',
    labelNameNumberMap['fig'],
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
    sut('#fig_first').message,
    'duplicate'
  )
}


function testRefNumberHandler() {
  let recordedNumbers = {
    '#fig_first': 1,
    '#fig_second': 2,
  }
  let sut = getNumberHandler('ref', recordedNumbers, {})
  
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
    {BOLD: false, ITALIC: false, UNDERLINE: false, FOREGROUND_COLOR: null}
  )
}
