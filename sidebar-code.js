//
// ***
// Executes commands issued in sidebar
// ***
//


// Update the Docs property stores
function updateProps(tempSettings) {
  var docProps = PropertiesService.getDocumentProperties();

  for (var key in docProps.getProperties()) {
    if (isCrossProp(key)) {
      docProps.deleteProperty(key);
    }
  }

  for (var labName in tempSettings) {
    var settings = tempSettings[labName];
    var property_value = '';

    docProps.setProperty(getPropKey(settings), encodeSettings(settings));
  }

  updateDoc();
  return '#save-apply';
}

function isCrossProp(propKey) { return propKey.substr(0, 6) === 'cross_' };
function getPropKey(settings) { return 'cross_' + settings.labCode.substr(0, 3) };

function getSettings() {
  var docProps = PropertiesService.getDocumentProperties().getProperties();
  var userProps = PropertiesService.getUserProperties().getProperties();

  var settings = getDefaultSettings();

  for (var key in userProps) {
    if (isCrossProp(key)) {
      var set = decodeSettings(userProps[key]);
      settings[set.labName] = set
    }
  }

  for (var key in docProps) {
    if (isCrossProp(key)) {
      var set = decodeSettings(docProps[key]);
      settings[set.labName] = set
    }
  }

  return settings
}


// Store defaults in user props store
function storeDefault(temp_settings) {
  var userProps = PropertiesService.getUserProperties();
  for (var labName in temp_settings) {
    var settings = temp_settings[labName];
    storePairing(userProps, settings);
    Utilities.sleep(200)
  }
  return '#save-defaults'
}


// Store custom category in user props store
function storeCustom(custom_settings) {
  var userProps = PropertiesService.getUserProperties();
  storePairing(userProps, custom_settings);
}


// Store given settings in user props store
function storePairing(userProps, settings) {
  userProps.setProperty(getPropKey(settings), encodeSettings(settings));
}


// Return default settings
function restoreDefault() {
  var userProps = PropertiesService.getUserProperties().getProperties();
  var settings = getDefaultSettings();

  for (var key in userProps) {
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
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) {
    DocumentApp.getUi().alert(
      "Clone colour", "Please select some text with the colour you want to clone.",
      DocumentApp.getUi().ButtonSet.OK
    );
    return
  }

  var element = selection.getRangeElements()[0];

  if (!element.getElement().editAsText) return;
  var text = element.getElement().editAsText(),
    offset = (element.isPartial()) ? element.getStartOffset() : 0;

  return [lab_or_ref, text.getAttributes(offset).FOREGROUND_COLOR.substr(1, 7)];
}
