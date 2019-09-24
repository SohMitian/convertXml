const fs = require('fs');
const che = require('cheerio');
const kuromoji = require('kuromoji');
const xmlBuilder = require('xmlbuilder');

// 文中の空白を削除する関数
function dispAry(text) {
  return text.replace(/\s+/g, "");
}

postArry = ['代表取締役', '支配人', '社員', '代表社員'];

// XMLファイル読み込み
const xml_data = fs.readFileSync("before.xml", "utf-8");
const $ = che.load(xml_data);

// XMLの「name」タグを読み込み
const xmlName = dispAry($('name').text());
// console.log(dispAry(name));

// 形態素解析のオブジェクト
const builder = kuromoji.builder({
  // 辞書を設定
  dicPath: 'node_modules/kuromoji/dict'
});

// 形態素解析機のビルド
builder.build(function(err, tokenizer) {
  if(err) { throw err; }

  const tokens = tokenizer.tokenize(xmlName);

  // 名前を取り出す
  const firstName = tokens.find(text => {
    return text.pos_detail_3 === '名'
  });

  // 姓を取り出す
  const lastName = tokens.find(text => {
    return text.pos_detail_3 === '姓'
  });

  // 名前の結合
  const name = lastName.basic_form + firstName.basic_form;

  // 役職を取り出す
  let postName = '';
  postArry.forEach(post => { 
    if (xmlName.indexOf(post) !== -1) {
      postName = post;
    }
  });
  // xmlNameの調整
  console.log(postName);
  console.log(name);
  let xml = xmlBuilder.create('delegate')
  .ele('postName', postName).up()
  .ele('name', name).up()
    .end({ pretty: true });
  
  fs.writeFile("./after.xml", xml, err => {
    if(err) {
      console.log(err);
    }
  });
// console.log(xml);
});