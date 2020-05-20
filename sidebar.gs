function updateProps(tempSettings) {
  const docProps = PropertiesService.getDocumentProperties()
  clearProps(docProps)

  for (const labCode in tempSettings) {
    docProps.setProperty(getPropKey(labCode), encodeSetting(tempSettings[labCode]))
  }

  updateDoc()
  return '#save-apply'
}


function getSettings() {
  const docProps = PropertiesService.getDocumentProperties().getProperties()
  const userProps = PropertiesService.getUserProperties().getProperties()

  settings = getDefaultSettings()

  settings = patchSettings(settings, userProps)
  settings = patchSettings(settings, docProps)

  return settings
}


function storeDefault(tempSettings) {
  const userProps = PropertiesService.getUserProperties()
  for (const labName in tempSettings) {
    const settings = tempSettings[labName]
    storePairing(userProps, settings) // TODO: this doesn't exist anymore
    Utilities.sleep(200) // TODO: why?
  }
  return '#save-defaults'
}


const storeCustom = customSettings => storePairing(PropertiesService.getUserProperties(), customSettings)


// TODO: rename
function restoreDefault() {
  const userProps = PropertiesService.getUserProperties().getProperties()
  const settings = getDefaultSettings()

  for (const key in userProps) {
    if (isCrossProp(key)) {
      settings[key] = userProps[key]
    }
  }

  return settings
}


// Remove a custom category from user prop stores
function removePair(code) {
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
