// isCrossProp returns true if a string is a key from the gDocs property store
const isCrossProp = propKey =>  propKey.substr(0, 6) === 'cross_' 

// getPropKey returns a key to be used in the gDocs property stores
const getPropKey = labCode => 'cross_' + labCode.substr(0, 3)

const refCodeFromLabCode = labCode => labCode.substr(0, 3)

const encodeSetting = s => JSON.stringify(s)

const decodeSetting = s => isLegacy(s) ? decodeLegacy(s) : JSON.parse(s)


// encodeSettings returns an object where key is the key to be used
// in the gDocs prop stores and value is the settings encoded as a string
function encodeSettings(settings) {
  const result = {}
  for (const key in settings) {
    const setting = settings[key]
    result[getPropKey(setting.lab.code)] = encodeSetting(setting)
  }
  return result
}


// getSettings retrieves a combination of default, user-level and document-level
// settings (in that order of priority)
function getSettings() {
  let settings = getDefaultSettings()
  patchSettings(settings, PropertiesService.getUserProperties().getProperties())
  patchSettings(settings, PropertiesService.getDocumentProperties().getProperties())
  return settings
}


// patchSettings overwrites settings with those from a given gDocs property store
function patchSettings(settings, storedProps) {
  for (const key in storedProps) {
    if (!isCrossProp(key)) continue
    const setting = decodeSetting(storedProps[key])
    settings[setting.lab.code] = setting
  }
  return settings
}


// getProps returns the sub-settings for a particular type of cross reference
// (e.g. label or reference) with codes as keys (e.g. {fig: {...}}, or {figur: {...}})
const getProps = type => settings => {
  const props = {}
  for (const key in settings) {
    const setting = settings[key]
    props[setting[type].code] = setting[type]
  }
  return props
}


function clearPropStore(store) {
  for (const key in store) {
    if (isCrossProp(key)) {
      store.deleteProperty(key)
    }
  }
}


function updateDocProps() {
  const encoded = encodeSettings(getSettings())
  PropertiesService.getDocumentProperties().setProperties(encoded)
}


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
const isLegacy = encoded => encoded.charAt(0) !== '{'

const decodeLegacy = encoded => {
  const asArr = encoded.split('_')
  const bool = str => str === 'true'
  const realNull = str => str === 'null' ? null : str

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

/** For debugging purposes */

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties()
  PropertiesService.getUserProperties().deleteAllProperties()
}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())
}
