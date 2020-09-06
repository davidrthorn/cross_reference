function updateProps(tempSettings) {
  const docProps = PropertiesService.getDocumentProperties()
  for (const labCode in tempSettings) {
    docProps.setProperty(getPropKey(labCode), encodeSetting(tempSettings[labCode]))
  }
  updateDoc()
  return '#save'
}


function storeDefault(tempSettings) {
  const userProps = PropertiesService.getUserProperties()
  for (const labCode in tempSettings) {
    const setting = tempSettings[labCode]
    userProps.setProperty(getPropKey(labCode), encodeSetting(setting))
  }
  return '#save-defaults'
}


const storeCustom = setting => PropertiesService.getUserProperties().setProperty(getPropKey(setting.lab.code), encodeSetting(setting))


function getDefaults() {
  const userProps = PropertiesService.getUserProperties().getProperties()
  const settings = getDefaultSettings()
  return patchSettings(settings, userProps)
}


// Remove a custom category from user prop stores
function removePair(code) {
  if (isDefault(code)) return new Error('cannot delete default code')

  PropertiesService.getUserProperties().deleteProperty("cross_" + code)
  PropertiesService.getDocumentProperties().deleteProperty("cross_" + code)
}


// Return the color of highlighted text
function cloneColor(type='lab') {
  const selection = DocumentApp.getActiveDocument().getSelection()
  if (!selection) {
    DocumentApp.getUi().alert(
      "Clone colour", "Please select some text with the colour you want to clone.",
      DocumentApp.getUi().ButtonSet.OK
    )
    return
  }

  const element = selection.getRangeElements()[0]
  if (!element.getElement().editAsText) return

  const text = element.getElement().editAsText()
  const offset = element.isPartial() ? element.getStartOffset() : 0

  return text.getAttributes(offset).FOREGROUND_COLOR
}
