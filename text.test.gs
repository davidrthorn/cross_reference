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
}

function testAllText() {
  testSuite('text.js', [
    testCapitalizeIfAppropriate,
    testCapitalize,
  ])
}
