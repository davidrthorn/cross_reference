// *** Must be duplicated in sidebar-js.html because gs is not js.
const orderedSettingsKeys = [
  'labCode',
  'labName',
  'labText',
  'labIsBold',
  'labIsItalic',
  'labIsUnderlined',
  'refText',
  'refIsBold',
  'refIsItalic',
  'refIsUnderlined',
  'labColor',
  'refColor',
  'labSuffix',
  'refSuffix',
]

const encodeSettings = (unencoded) =>
  orderedSettingsKeys
    .reduce((total, k) => total + (k in unencoded ? unencoded[k] : 'null') + '_', '')
    .slice(0, -1);

const decodeSettings = (encoded) =>
  encoded
    .split('_')
    .reduce((result, current, i) => { result[orderedSettingsKeys[i]] = current; return result }, {});

const refCodeFromLabCode = (labCode) => labCode.substr(0,3)

// *** END DUPE


const getPropsForType = (type, settings) =>
  Object.keys(settings).reduce((total, key) => {
    const s = settings[key]
    const code = refCodeFromLabCode(s['labCode'])
    total[code] = propsFromSetting(type, s)
    return total
  }, {})


const propsFromSetting = (type, setting) =>
  type === 'lab'
  ? {
      code: setting['labCode'],
      text: setting['labText'],
      isBold: setting['labIsBold'],
      isItalic: setting['labIsItalic'],
      isUnderlined: setting['labIsUnderlined'],
      color: setting['labColor'],
      suffix: setting['labSuffix'],
    }
    : {
      code: refCodeFromLabCode(setting['labCode']),
      text: setting['refText'],
      isBold: setting['refIsBold'],
      isItalic: setting['refIsItalic'],
      isUnderlined: setting['refIsUnderlined'],
      color: setting['refColor'],
      suffix: setting['refSuffix'],
    }

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
      refIsUnderlined: 'null',
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
      labIsUnderlined: 'null',
      refText: 'figure ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlines: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'sug',
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
      refIsUnderlined: 'null',
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
      labIsUnderlined: 'null',
      refText: 'table ',
      refIsBold: 'null',
      refIsItalic: 'null',
      refIsUnderlined: 'null',
      labColor: 'null',
      refColor: 'null',
      labSuffix: 'null',
      refSuffix: 'null',
    }
  }
}
