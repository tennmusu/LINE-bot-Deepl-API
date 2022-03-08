var ACCESS_TOKEN = '私のアクセストークン';
var MODE = getTextFile();
function doPost(e) {
  var event = JSON.parse(e.postData.contents).events[0];
  // 応答トークン
  var replyToken = event.replyToken;
  // ユーザーからのメッセージ
  var userMessage = event.message.text;
  // 応答メッセージ用のAPI URL
  var url = 'https://api.line.me/v2/bot/message/reply';

  if (userMessage === undefined) {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    userMessage = '？？？';
  } else if (userMessage === '〇〇語→英語モードに変更しました。') {
    MODE = 'EN';
    update_file(MODE);
  } else if (userMessage === '〇〇語→日本語モードに変更しました。') {
    MODE = 'JA';
    update_file(MODE);
  } else {
    var deepl = 'https://api-free.deepl.com/v2/translate?auth_key=私のauth_key&text=' + userMessage + '&target_lang=' + MODE;
    var response = UrlFetchApp.fetch(deepl).getContentText();
    var json = JSON.parse(response);
    userMessage = json["translations"][0]["text"];
  }

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': userMessage,
      }]
    })
  });
  return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);
}
function getTextFile() {
  const contents = DriveApp.getRootFolder()
    .getFilesByName('mode.txt')
    .next()
    .getBlob()
    .getDataAsString("sjis");
  return contents
}
function update_file(e) {
  var content = e;
  var file = DriveApp.getRootFolder()
    .getFilesByName('mode.txt');
  if (file.hasNext()) {
    var v = file.next();
    v.setContent(content);
  }
}
