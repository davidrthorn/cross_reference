function testAllText() {
  testSuite('text.js', [
    testCapitalizeIfAppropriate,
    testIsCapitalized,
    testCapitalize,
    testLabelNumberHandler,
    testRefNumberHandler,
    getStyle,
  ])
}

function testCapitalizeIfAppropriate() {
  Expect('returns capitalized when reference text is already capitalized',
    capitalizeIfAppropriate('aa bb Figure', 5, 'Figure'),
    'Figure'
  )
  Expect('returns capitalized when text to replace is already capitalized',
    capitalizeIfAppropriate('aa bb Figur', 5, 'figure'),
    'Figure'
  )
  Expect('returns uncapitalized when text to replace is not capitalized',
    capitalizeIfAppropriate('aa bb figur', 5, 'figure'),
    'Figure'
  )
}

function testCapitalize() {
  Expect('returns empty for empty',
    capitalize(''),
    ''
  )
  Expect('capitalizes non-empty string',
    capitalize('hello'),
    'Hello'
  )
}

function testIsCapitalized() {
  Expect('returns false for empty string',
    isCapitalized(''),
    false
  )
  Expect('returns true if is capitalized',
    isCapitalized('Hello'),
    true
  )
  Expect('returns false if not capitalize',
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

  Expect('increments the existing entry in the label map',
    labelNameNumberMap['fig'],
    2
  )
  Expect('records the url in the recorded numbers',
    recordedNumbers,
    {
      '#fig_first': 1,
      '#fig_somename': 2,
    }
  )
  Expect('returns the correct number',
    got,
    2
  )

  got = sut('#fig_first')
  Expect('returns duplicate error',
    got.message(),
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
  Expect('returns correct number for url',
    got,
    2
  )

  got = sut('#fig_missing')
  Expect('returns correct number for url',
    got,
    new Error('missref')
  )
}


function testGetStyle() {
  let settings = getDefaultSettings()
  let prop = getPropsForType('lab', settings).fig

  let got = getStyle(prop)
  Expect('returns correct style object for default',
    got,
    {BOLD: 'null', ITALIC: 'null', UNDERLINE: 'null', FOREGROUND_COLOR: 'null'}
  )
}
