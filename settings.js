// *** Must be duplicated in sidebar-js.html because gs is not js.
var orderedSettingsKeys = [
  'labCode',
  'labName',
  'labText',
  'labIsBold',
  'labIsItalic',
  'labIsUnderlines',
  'refText',
  'refIsBold',
  'refIsItalic',
  'refIsUnderlines',
  'labColor',
  'refColor',
  'labSuffix',
  'refSuffix',
]

function encodeSettings(unencoded) {
  var result = ''
  for (var i = 0; i < orderedSettingsKeys.length; i++) {
    var k = orderedSettingsKeys[i];
    result += (k in unencoded ? unencoded[k] : 'null') + '_'
  }
  return result.slice(0, -1)

}

function decodeSettings(encoded) {
  return encoded
    .split('_')
    .reduce(function (result, current, i) { result[orderedSettingsKeys[i]] = current; return result }, {})
}

// *** END DUPE

// Defaults

function getDefaultSettings() {
  return {
    Equation: {
      labCode: 'equat',
      labName: 'Equation',
      labText: 'equation ',
      labIsBold: 'null',
      labIsItalic: 'null',
      labIsUnderlines: 'null',
      refText: 'equation ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlines: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'null',
      refSuffix: 'null',
    },
    Figure: {
      labCode: 'figur',
      labName: 'Figure',
      labText: 'figure ',
      labIsBold: 'null',
      labIsItalic: 'null',
      labIsUnderlines: 'null',
      refText: 'figure ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlines: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'null',
      refSuffix: 'null',
    },
    Footnote: {
      labCode: 'fnote',
      labName: 'Footnote',
      labText: '',
      labIsBold: 'null',
      labIsItalic: 'null',
      labIsUnderlines: 'null',
      refText: 'fn. ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlines: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'null',
      refSuffix: 'null',
    },
    Table: {
      labCode: 'table',
      labName: 'Table',
      labText: 'table ',
      labIsBold: 'null',
      labIsItalic: 'null',
      labIsUnderlines: 'null',
      refText: 'table ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlines: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'null',
      refSuffix: 'null',
    }
  }
}
