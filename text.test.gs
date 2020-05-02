
function testCapitalization() {
  let replacementText = 'figure'
  let context = 'abcde'
  It('capitalises when start of paragraph',
    capitalizeIfAppropriate(context, 0, replacementText),
    'Figure'
  )
  It('capitalises when following a question',
    capitalizeIfAppropriate('abc? ', 0, replacementText),
    'Figure'
  )
  It('capitalises when following an exclamation',
    capitalizeIfAppropriate('abc! ', 0, replacementText),
    'Figure'
  )
}
