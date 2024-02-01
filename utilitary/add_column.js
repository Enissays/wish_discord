const { translate } = require('bing-translate-api');

translate('你好', null, 'en').then(res => {
    console.log(res.translation);
  }).catch(err => {
    console.error(err);
  });