const Expect = (description, got, want) =>
  Logger.log(
    assertEqual(got, want)
      ? '✅' + description
      : '❌' + description + '. Expected ' + JSON.stringify(want) + '; got ' + JSON.stringify(got)
  )


const assertEqual = (a, b) => {
  if (typeof a !== typeof b) return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!assertEqual(a[i], b[i])) return false
    }
  } else if (typeof a === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) return false
    for (const key in a) {
      if (!assertEqual(a[key], b[key])) return false
    }
  } else {
    if (a !== b) return false
  }
  return true
}


const objectToString = (obj) => {
  let result = '{'
  for (const key in obj) {
    result += key + ': ' + obj[key]
  }
  return
}


function testSuite(name, suite = []) {
  Logger.log('=========')
  Logger.log('TEST SUITE: ' + name)
  Logger.log('=========')

  suite.forEach((s) => {
    Logger.log('---------')
    Logger.log(s.name)
    Logger.log('---------')
    s()
  })
}
