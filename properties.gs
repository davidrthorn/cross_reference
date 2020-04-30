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

function copyUserPropsToDocProps() {

  const user_props = PropertiesService.getUserProperties().getProperties();
  const docProps = PropertiesService.getDocumentProperties();
  const doc_props = docProps.getProperties();
  const defaults = getDefaultSettings();
  const props = {
    'cross_fig': encodeSettings(defaults.Figure),
    'cross_tab': encodeSettings(defaults.Table),
    'cross_equ': encodeSettings(defaults.Equation),
    'cross_fno': encodeSettings(defaults.Footnote),
  };

  for (const u in user_props) {
    props[u] = user_props[u];
  }

  for (const d in doc_props) {
    props[d] = doc_props[d];
  }

  docProps.setProperties(props);
}

function clearProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();

}

function viewProps() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties())
  Logger.log(PropertiesService.getUserProperties().getProperties())

}