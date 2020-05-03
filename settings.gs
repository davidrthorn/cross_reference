const isCrossProp = (propKey) =>  propKey.substr(0, 6) === 'cross_' 

const getPropKey = (labCode) => 'cross_' + cur.substr(0, 3)

const refCodeFromLabCode = (labCode) => labCode.substr(0, 3)

const encodeSetting = (unencoded) => JSON.stringify(unencoded)

const decodeSetting = (encoded) =>
  isLegacy(encoded)
    ? decodeLegacy(encoded)
    : JSON.parse(encoded)


function getSettings() {
  let settings = getDefaultSettings()
  settings = patchSettings(getDefaultSettings(), PropertiesService.getUserProperties().getProperties())
  settings = patchSettings(getDefaultSettings(), PropertiesService.getDocumentProperties().getProperties())
  return settings
}


function patchSettings(settings, storedProps) {
  for (const key in storedProps) {
    if (!isCrossProp(key)) continue
    const setting = decodeSetting(storedProps[key])
    settings[setting.lab.code] = setting
  }
  return settings
}

// TODO: what is this actually doing?
const encodeSettings = (settings) =>
  Object.Entries(getSettings())
    .reduce(
      (acc, cur) => acc[getPropKey(cur[0])] = encodeSetting(cur[1])
      , {})


function updateDocProps() {
  const encoded = encodeSettings(getSettings())
  PropertiesService.getDocumentProperties().setProperties(encoded)
}


//TODO: test this and all the other functions in this file
// const getProps = (type, settings)
// Object.Entries(settings).reduce(
//   (acc, cur) => acc[cur.type.code] = cur.type
//   , {})


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
const isLegacy = (encoded) => encoded.charAt(0) !== '{'

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

/** debug */

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties()
  PropertiesService.getUserProperties().deleteAllProperties()
}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())
}