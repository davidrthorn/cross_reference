//
// ***
// Executes commands issued in sidebar
// ***
//


// Update the Docs property stores
function updateProps(tempSettings) {
  const docProps = PropertiesService.getDocumentProperties();

  for (const key in docProps.getProperties()) {
    if (isCrossProp(key)) {
      docProps.deleteProperty(key);
    }
  }

  for (const labName in tempSettings) {
    const settings = tempSettings[labName];
    const property_value = '';

    docProps.setProperty(getPropKey(settings), encodeSettings(settings));
  }

  updateDoc();
  return '#save-apply';
}

function isCrossProp(propKey) { return propKey.substr(0, 6) === 'cross_' };
function getPropKey(settings) { return 'cross_' + settings.labCode.substr(0, 3) };

function getSettings() {
  const docProps = PropertiesService.getDocumentProperties().getProperties();
  const userProps = PropertiesService.getUserProperties().getProperties();

  const settings = getDefaultSettings();

  for (const key in userProps) {
    if (isCrossProp(key)) {
      const set = decodeSettings(userProps[key]);
      settings[set.labName] = set
    }
  }

  for (const key in docProps) {
    if (isCrossProp(key)) {
      const set = decodeSettings(docProps[key]);
      settings[set.labName] = set
    }
  }

  return settings
}


// Store defaults in user props store
function storeDefault(temp_settings) {
  const userProps = PropertiesService.getUserProperties();
  for (const labName in temp_settings) {
    const settings = temp_settings[labName];
    storePairing(userProps, settings);
    Utilities.sleep(200)
  }
  return '#save-defaults'
}


// Store custom category in user props store
function storeCustom(custom_settings) {
  const userProps = PropertiesService.getUserProperties();
  storePairing(userProps, custom_settings);
}


// Store given settings in user props store
function storePairing(userProps, settings) {
  userProps.setProperty(getPropKey(settings), encodeSettings(settings));
}


// Return default settings
function restoreDefault() {
  const userProps = PropertiesService.getUserProperties().getProperties();
  const settings = getDefaultSettings();

  for (const key in userProps) {
    if (isCrossProp(key)) {
      settings[key] = userProps[key];
    }
  }

  return settings
}


// Remove a custom category from user prop stores
function removePair(code) {
  PropertiesService.getUserProperties().deleteProperty("cross_" + code);
  PropertiesService.getDocumentProperties().deleteProperty("cross_" + code);
}


// Return the color of highlighted text
function cloneColor(lab_or_ref) {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) {
    DocumentApp.getUi().alert(
      "Clone colour", "Please select some text with the colour you want to clone.",
      DocumentApp.getUi().ButtonSet.OK
    );
    return
  }

  const element = selection.getRangeElements()[0];

  if (!element.getElement().editAsText) return;
  const text = element.getElement().editAsText(),
    offset = (element.isPartial()) ? element.getStartOffset() : 0;

  return [lab_or_ref, text.getAttributes(offset).FOREGROUND_COLOR.substr(1, 7)];
}
