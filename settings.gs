const encodeSettings = (unencoded) => JSON.stringify(unencoded)

const decodeSettings = (encoded) =>
  isLegacy(encoded)
    ? decodeLegacy(encoded)
    : JSON.parse(encoded)

const refCodeFromLabCode = (labCode) => labCode.substr(0, 3)


const getPropsForType = (type, settings) =>
  Object.keys(settings).reduce((total, key) => {
    const s = settings[key]
    const code = refCodeFromLabCode(s['labCode'])
    total[code] = propsFromSetting(type, s)
    return total
  }, {})


function getDefaultSettings() {
  return {
    equat: {
      name: 'Equation',
      lab: {
        code: 'equat',
        text: 'equation ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      },
      ref: {
        code: 'equ',
        text: 'equation ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      }
    },
    figur: {
      name: 'Figure',
      lab: {
        code: 'figur',
        text: 'figure ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      },
      ref: {
        code: 'fig',
        text: 'figure ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      }
    },
    fnote: {
      name: 'Footnote',
      lab: {
        code: 'fnote',
        text: '',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      },
      ref: {
        code: 'fno',
        text: 'fn. ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      },
    },
    table: {
      name: 'Table',
      lab: {
        code: 'table',
        text: 'table ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      },
      ref: {
        code: 'tab',
        text: 'table ',
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        color: null,
        suffix: '',
      }
    }
  }
}

/* Required for legacy. Hardcoded as hell */
const isLegacy = (encoded) => settings.charAt(0) !== '{'
const decodeLegacy = (encoded) => {
  const asArr = encoded.split('_')
  const bool = (str) => str === 'true'
  const realNull = (str) => str === 'null' ? null : str

  return {
    name: asArr[1],
    lab: {
      code: asArr[0],
      text: asArr[2],
      isBold: bool(asArr[3]),
      isItalic:  bool(asArr[4]),
      isUnderlined: bool(asArr[5]),
      color:  realNull(asArr[10]),
      suffix: '',
    },
    ref: {
      code: refCodeFromLabCode(asArr[0]),
      text: asArr[6],
      isBold: bool(asArr[7]),
      isItalic: bool(asArr[8]),
      isUnderlined: bool(asArr[9]),
      color: realNull(asArr[11]),
      suffix: '',
    }
  }
}
