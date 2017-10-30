// Updates user/document properties based on user input in side panel

function updateProps(temp_settings) {
  
  var docProps = PropertiesService.getDocumentProperties();
  var dprops = docProps.getProperties()
  
  for (var i in dprops) {
    if (i.substr(0,6) === "cross_") {
      docProps.deleteProperty(i)
    }
  }
  
  for (var i in temp_settings) {
    var setting = temp_settings[i];
    var code = setting[0].substr(0,3);
    
    var pkey = 'cross_' + code;
    var pvalue = '';
    for (var j = 0; j < (setting.length - 1); j++) {
      pvalue += setting[j] + '_'
    }
    pvalue += setting[setting.length - 1];
    docProps.setProperty(pkey, pvalue);
  }
  
  updateDocument();
}


// Retrieves user settings to feed to sidebar on open

function getSettings() {
  
  var dprops = PropertiesService.getDocumentProperties().getProperties();
  var uprops = PropertiesService.getUserProperties().getProperties();
  
  var settings = {};
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null';
  
  for (var i in uprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = uprops[i];
    }
  }
  
  for (var i in dprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = dprops[i];
    }
  }

  return settings
}

// Stores settings as default


function storeDefault(temp_settings) {
  
  var user_props = PropertiesService.getUserProperties();
  
  for (var i in temp_settings) {
    var settings = temp_settings[i];
    storePairing(user_props, settings)
  }
}

function storeCustom(custom_settings) {
  
    var user_props = PropertiesService.getUserProperties();
    storePairing(user_props, custom_settings);
}

function storePairing(user_props, settings) {
  
    var code = settings[0].substr(0,3);
    
    var pkey = 'cross_' + code;
    var pvalue = '';
  
    for (var j = 0; j < (settings.length - 1); j++) {
      pvalue += settings[j] + '_'
    }
  
    pvalue += settings[settings.length - 1];
    user_props.setProperty(pkey, pvalue);
}


// Feeds default settings to sidebar to be applied

function restoreDefault() {
  var uprops = PropertiesService.getUserProperties().getProperties();
  
  var settings = {};
  
  settings['fig'] = 'figur_Figure_figure _null_null_null_figure _null_null_null';
  settings['tab'] = 'table_Table_table _null_null_null_table _null_null_null';
  settings['equ'] = 'equat_Equation_equation _null_null_null_equation _null_null_null';
  
  for (var i in uprops) {
    if (i.substr(0,5) === 'cross') {
      settings[i.substr(6,i.length)] = uprops[i];
    }
  }
  return settings
}


// Removes pairings from user settings

function removePair(ref) {
  PropertiesService.getUserProperties().deleteProperty("cross_" + ref);
  PropertiesService.getDocumentProperties().deleteProperty("cross_" + ref);
}
