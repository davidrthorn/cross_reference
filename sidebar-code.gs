//
// ***
// Executes commands issued in sidebar
// ***
//

// Update the Docs property stores
function updateProps(settings) {
  
  var document_properties = PropertiesService.getDocumentProperties();
  
  for (var i in document_properties.getProperties()) {
    if (i.substr(0, 6) === "cross_")  document_properties.deleteProperty(i);
  }
  
  for (var i in settings) {
    var setting = settings[i],
        code = setting[0].substr(0, 3),
        property_key = 'cross_' + code;
    var property_value = '';
    
    for (var j = 0; j < (setting.length - 1); j++) {property_value += setting[j] + '_'}
    
    property_value += setting[setting.length - 1];
    document_properties.setProperty(property_key, property_value);
  }
  
  updateDocument();
  return '#save-apply';
}


// Get the settings for this document
function getSettings() {
  
  var document_properties = PropertiesService.getDocumentProperties().getProperties(),
      user_properties = PropertiesService.getUserProperties().getProperties(),
      settings = {}
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null_null_null';
  
  for (var i in user_properties) {
    if (i.substr(0, 5) === 'cross')  settings[i.substr(6, i.length)] = user_properties[i];
  }
  
  for (var i in document_properties) {
    if (i.substr(0, 5) === 'cross')  settings[i.substr(6, i.length)] = document_properties[i];
  }

  return settings
}


// Store defaults in user props store
function storeDefault(temp_settings) {
  var user_properties = PropertiesService.getUserProperties();
  for (var i in temp_settings) {
    var settings = temp_settings[i];
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
  var property_value = '';
  
  for (var j = 0; j < (settings.length - 1); j++) {
    property_value += settings[j] + '_'
  }
  
  property_value += settings[settings.length - 1];
  user_props.setProperty(property_key, property_value);
}


// Return default settings for equation, figure, table
function restoreDefault() {
  var user_properties = PropertiesService.getUserProperties().getProperties(),
      settings = {};
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null_null_null';
  
  for (var i in user_properties) {
    if (i.substr(0,5) === 'cross')  settings[i.substr(6, i.length)] = user_properties[i];
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
    DocumentApp.getUi().alert("No selection");
    return
  }
  
  var element = selection.getRangeElements()[0];
  
  if (!element.getElement().editAsText) return;
  var text = element.getElement().editAsText(),
      offset = (element.isPartial()) ? element.getStartOffset(): 0;
  
  return [lab_or_ref, text.getAttributes(offset).FOREGROUND_COLOR.substr(1,7)];
}
