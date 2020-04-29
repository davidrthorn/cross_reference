//
// ***
// Executes commands issued in sidebar
// ***
//


// Update the Docs property stores
function updateProps(tempSettings) {
  var documentProperties = PropertiesService.getDocumentProperties();

  for (var key in documentProperties.getProperties()) {
    if (isCrossProp(key)) {
      documentProperties.deleteProperty(key);
    }
  }

  for (var labName in tempSettings) {
    var settings = tempSettings[labName];
    var code = settings.labCode.substr(0, 3);
    var property_key = 'cross_' + code;
    var property_value = '';

    documentProperties.setProperty(property_key, encodeSettings(settings));
  }

  updateDoc();
  return '#save-apply';
}

function isCrossProp(propKey) { return propKey.substr(0, 6) === 'cross' }

// Get the settings for this document
function getSettings() {

  var document_properties = PropertiesService.getDocumentProperties().getProperties();
  var user_properties = PropertiesService.getUserProperties().getProperties();

  var settings = getDefaultSettings();

  for (var key in user_properties) {
    if (isCrossProp(key)) {
      settings[key] = user_properties[key];
    }
  }

  for (var key in document_properties) {
    if (isCrossProp(key)) {
      settings[key] = document_properties[key];
    }
  }

  return settings
}


// Store defaults in user props store
function storeDefault(temp_settings) {
  var user_properties = PropertiesService.getUserProperties();
  for (var labName in temp_settings) {
    var settings = temp_settings[labName];
    storePairing(user_properties, settings);
    Utilities.sleep(200)
  }
  return '#save-defaults'
}


// Store custom category in user props store
function storeCustom(custom_settings) {
  var user_properties = PropertiesService.getUserProperties();
  storePairing(user_properties, custom_settings);
}


// Store given settings in user props store
function storePairing(user_props, settings) {

  var code = settings[0].substr(0, 3);
  var property_key = 'cross_' + code;

  user_props.setProperty(property_key, encodeSettings(settings));
}


// Return default settings
function restoreDefault() {
  var user_properties = PropertiesService.getUserProperties().getProperties();
  var settings = getDefaultSettings();

  for (var key in user_properties) {
    if (isCrossProp(key)) {
      settings[key] = user_properties[key];
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
