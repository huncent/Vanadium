VanadiumRules = {
  email: [
    'only_on_blur',
    {validator:'required', advice:'email_advice'},
    {validator:'email', advice:'email_advice'}
  ],
  name: [
    'required',
    ['min_length', 5],
    ['wait', 500],
    ['ajax', '/user_exists.json']
  ],
  pass: [
    'required',
    ['min_length', 5, 'global-advice'],
    ['wait', 200]
  ],
  repeat_pass: [
    ['advice', 'global-advice'],
    'required',
    ['min_length', 5, 'global-advice'],
    ['same_as','pass','global-advice']
  ],
  'signup-form': 'container',
  email_and_name: 'container',
  passwords: 'container'
}
