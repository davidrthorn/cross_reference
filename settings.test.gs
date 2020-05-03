function testAllSettings() {
  testSuite('settings.js', [
    testLegacySettingsMapsToNewSettings,
    testPatchSettings,
    testIsLegacy
  ])
}

function testLegacySettingsMapsToNewSettings() {
  let legacy = 'figur_Figure_Fig. _true_null_null_figure _null_true_null_null_555555'
  let want = {
    name: 'Figure',
    lab: {
      code: 'figur',
      text: 'Fig. ',
      isBold: true,
      isItalic: false,
      isUnderlined: false,
      color: null,
      suffix: '',
    },
    ref: {
      code: 'fig',
      text: 'figure ',
      isBold: false,
      isItalic: true,
      isUnderlined: false,
      color: '555555',
      suffix: '',
    }
  }
  Expect('returns correctly formatted new settings for legacy string',
    decodeLegacy(legacy),
    want
  )
}

function testIsLegacy() {
  Expect('returns true for JSON',
    isLegacy(JSON.stringify({a: 'hello'})),
    true
  )
  Expect('returns false for non-JSON',
    isLegacy('hello'),
    false
  )
}

function testPatchSettings() {
  let settings = getDefaultSettings()
  let storedProps = {'cross_fig': encodeSetting({
    name: 'testName',
    lab: {'code': 'figur'},
  })}

  Expect('replaces "figur" entry with one in stored props',
    patchSettings(settings, storedProps)['figur'],
    decodeSetting(storedProps['cross_fig'])
  )

  settings = getDefaultSettings()
  storedProps = {'cross_tig': encodeSetting({
    name: 'Tiger',
    lab: {'code': 'tiger'},
  })}
  Expect('adds entry if not present',
    patchSettings(settings, storedProps)['tiger'],
    decodeSetting(storedProps['cross_tig'])
  )

  settings = getDefaultSettings()
  const originalLength = Object.keys(settings).length
  Expect('does not overwrite existing',
    Object.keys(patchSettings(settings, storedProps)).length,
    originalLength + 1
  )
}
