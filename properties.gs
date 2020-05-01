function getStoredProps(type) {
  const userProps = PropertiesService.getUserProperties().getProperties()
  const docProps = PropertiesService.getDocumentProperties().getProperties()

  let settings = getDefaultSettings()
  settings = patchSettings(settings, userProps)
  settings = patchSettings(settings, docProps)

  return getPropsForType(type, settings)
}


function patchSettings(settings, storedProps) {
  for (const key in storedProps) {
    if (!isCrossProp(key)) continue
    const set = decodeSettings(storedProps[key])
    settings[set.labName] = set
  }
  return settings
}


function updateDocProps() {
  const userProps = PropertiesService.getUserProperties().getProperties()
  const docProps = PropertiesService.getDocumentProperties().getProperties()
  const defaultSettings = getDefaultSettings()
  const props = {
    'cross_fig': encodeSettings(defaultSettings.Figure),
    'cross_tab': encodeSettings(defaultSettings.Table),
    'cross_equ': encodeSettings(defaultSettings.Equation),
    'cross_fno': encodeSettings(defaultSettings.Footnote),
  }

  for (const propKey in userProps) {
    props[propKey] = userProps[propKey]
  }

  for (const propKey in docProps) {
    props[propKey] = docProps[propKey]
  }

  PropertiesService.getDocumentProperties().setProperties(props)
}

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties()
  PropertiesService.getUserProperties().deleteAllProperties()

}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())
}
