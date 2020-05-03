/*
settings = {
  lab: {
    code: ...
  }
  ref: {
    code: ...
    ...
  }
}
*/

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

const isLegacy = (encoded) => settings.charAt(0) !== '{'
const decodeLegacy = (encoded) =>
  encoded
    .split('_')
    .reduce((result, current, i) => {
      result[orderedSettingsKeys[i]] = current;
      return result
    }, {});


// const encodeSettings = (unencoded) =>
//   orderedSettingsKeys
//     .reduce((total, k) => total + (k in unencoded ? unencoded[k] : 'null') + '_', '')
//     .slice(0, -1);

const encodeSettings = (unencoded) => JSON.stringify(unencoded)

const decodeSettings = (encoded) =>
  isLegacy(encoded)
    ? decodeLegacy(encoded)
    : JSON.parse(encoded)

const refCodeFromLabCode = (labCode) => labCode.substr(0, 3)

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
    equ: {
      name: 'Equation',
      lab: {
        code: 'equat',
        text: 'equation ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      },
      ref: {
        code: 'equ',
        text: 'equation ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
      }
      suffix: 'null',
    },
    Figure: {
      name: 'Figure',
      lab: {
        code: 'figur',
        text: 'figure ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'sug',
      },
      ref: {
        code: 'fig',
        text: 'figure ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      }
    },
    Footnote: {
      name: 'Footnote',
      lab: {
        code: 'fnote',
        text: '',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      },
      ref: {
        code: 'fno',
        text: 'fn. ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      },
    },
    Table: {
      name: 'Table',
      lab: {
        code: 'table',
        text: 'table ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      },
      ref: {
        code: 'tab',
        text: 'table ',
        isBold: 'null',
        isItalic: 'null',
        isUnderlined: 'null',
        color: 'null',
        suffix: 'null',
      }
    }
  }
}
