function It(description, got, want) {
  Logger.log(
    assertEqual(got, want)
      ? 'PASSED: It ' + description
      : 'FAILED: It ' + description + '. Expected ' + want + '; got ' + got
  )
}

const assertEqual = (a, b) => {
  if (typeof a !== typeof b) return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!equal(a[i], b[i])) return false
    }
  } else if (typeof a === 'object') {
    for (const key in a) {
      if (!equal(a[key], b[key])) return false
    }
  } else {
    if (a !== b) return false
  }

  return true
}
