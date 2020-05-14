const It = (description, got, want) =>
  Logger.log(
    areDeepEqual(got, want)
      ? '✅ ' + description
      : '❌ ' + description + '.\nExpected\n' + JSON.stringify(want) + '\n Got\n' + JSON.stringify(got)
  )

const isObject = thing => Object.prototype.toString.call(thing) === '[object Object]'
const isIterable = thing => isObject(thing) || Array.isArray(thing) // Symbol.iterator approach does not work in gs. No need for sets or maps yet


// areSameType returns true if two things are the same type.
// Only supports primitives, objects and arrays
function areSameType(a, b) {
  if (isObject(a)) {
    return isObject(b)
  }
  if (Array.isArray(a)) {
    return Array.isArray(b)
  }
  return typeof a === typeof b
}


// areSameLength returns true if two items are the same length
// This function is liberal: an array can be the same length as a string;
// an object has a length (the count of its iterable properties)
const areSameLength = (a, b) => {
  const lenA = isObject(a) ? Object.keys(a).length : a.length
  const lenB = isObject(b) ? Object.keys(b).length : b.length

  return lenA === lenB
}


// areDeepEqual returns true if two inputs are deeply equal.
// It only drills down into array and object iterable types
const areDeepEqual = (a, b, strict=true) => {
  if (strict && !areSameType(a, b)) {
    return false
  }

  if (isIterable(a)) {
    if (!isIterable(b) || !areSameLength(a, b)) {
      return false    
    }
    for (const key in a) {
      if (!areDeepEqual(a[key], b[key], strict)) {
        return false
      }
    }
  } else {
    return string ? a === b : a == b
  }

  return true
}


function testSuite(name, suite = []) {
  Logger.log('SUITE: ' + name)
  Logger.log('======')

  suite.forEach((s) => {
    Logger.log(s.name)
    Logger.log('------')
    s()
    Logger.log('')
  })
}
