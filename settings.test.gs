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