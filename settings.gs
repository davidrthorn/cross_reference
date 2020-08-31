// isCrossProp returns true if a string is a key from the gDocs property store
const isCrossProp = propKey =>  propKey.substr(0, 6) === 'cross_' 

// getPropKey returns a key to be used in the gDocs property stores
const getPropKey = labCode => 'cross_' + labCode.substr(0, 3)

const refCodeFrom = labCode => labCode.substr(0, 3)

const encodeSetting = s => JSON.stringify(s)

const decodeSetting = s => JSON.parse(s)


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
  settings = patchSettings(settings, PropertiesService.getUserProperties()) 
  settings = patchSettings(settings, PropertiesService.getDocumentProperties())

  return settings
}


// patchSettings overwrites settings with those from a given gDocs property store
function patchSettings(settings, propStore) {
  const props = propStore.getProperties()
  
  for (const key in props) {
    if (!isCrossProp(key)) continue
    
    const encoded = props[key]

    let s = null
    if (isLegacy(encoded)) {
      s = decodeLegacy(encoded)
      propStore.setProperty(key, encodeSetting(s)) // update legacy props
    } else {
      s = decodeSetting(encoded)
    }
    
    settings[s.lab.code] = s
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

const isDefault = code => ['equ', 'fig', 'fno', 'tab'].includes(code.substr(0, 3))

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
      code: refCodeFrom(asArr[0]),
      text: asArr[6],
      isBold: bool(asArr[7]),
      isItalic: bool(asArr[8]),
      isUnderlined: bool(asArr[9]),
      color: realNull(asArr[11]),
      suffix: '',
    }
  }
}

/*
Legacy properties example:

*/

/** For debugging purposes */

function setLegacyDocProps() {
  clearProps()
  PropertiesService.getDocumentProperties().setProperties({
    cross_tab: 'table_Table_table _null_null_null_table _null_null_null_null_null',
    cross_tes: 'testi_Testing_testing _null_null_null_testing _null_null_null_null_null',
    cross_fig: 'figur_Figure_figFIGFIG _null_null_null_figure _null_null_null_null_null',
    cross_equ: 'equat_Equation_equation _null_null_null_equation _null_null_null_null_null',
    cross_fno: 'fnote_Footnote__null_null_null_fn. _null_null_null_null_null'
  })
}

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties()
  PropertiesService.getUserProperties().deleteAllProperties()
}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())
}
