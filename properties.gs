function getStoredProps(type) {
  const userProps = PropertiesService.getUserProperties().getProperties();
  const docProps = PropertiesService.getDocumentProperties().getProperties();

  let settings = getDefaultSettings();
  overwriteSettings(settings, userProps);
  overwriteSettings(settings, docProps);

  return getPropsForType(type, settings)
}

function overwriteSettings(settings, storedProps) {
  let final = {}
  for (const propKey in storedProps) {
    if (!isCrossProp(propKey)) continue;
    const prop = storedProps[propKey];
    const decoded = decodeSettings(prop);
    final = {decoded, ...final}
  }
}

function updateDocProps() {

  const userProps = PropertiesService.getUserProperties().getProperties()
  const docProps = PropertiesService.getDocumentProperties().getProperties()
  const defaultSettings = getDefaultSettings();
  const props = {
    'cross_fig': encodeSettings(defaultSettings.Figure),
    'cross_tab': encodeSettings(defaultSettings.Table),
    'cross_equ': encodeSettings(defaultSettings.Equation),
    'cross_fno': encodeSettings(defaultSettings.Footnote),
  };

  for (const propKey in userProps) {
    props[propKey] = userProps[propKey];
  }

  for (const propKey in docProps) {
    props[propKey] = docProps[propKey];
  }

  PropertiesService.getDocumentProperties().setProperties(props);
}

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();

}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())
}
