const It = (description, got, want) =>
  Logger.log(
    assertEqual(got, want)
      ? '✅ It ' + description
      : '❌ It ' + description + '. Expected ' + want + '; got ' + got
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

function testSuite(name, suite=[]) {
  Logger.log('=========')
  Logger.log('TEST SUITE: ' + name)
  Logger.log('=========')

  suite.forEach((s) => {
    Logger.log('---------')
    Logger.log(formatTestName(s.name))
    Logger.log('---------')
    s()
  })
}

const formatTestName = (name) =>
  name.replace(/((^|[A-Z])[^A-Z]*)/g, (word) => word + ' ') .toLowerCase()
