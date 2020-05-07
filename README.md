# City Game
## 概要
オブジェクト指向の練習のために作成したjavaScriptゲーム。デザインなどはあまり考えていませんが、ゲームとしてはバグもなく成り立っているはずです。City Gameは数ターンごとに人口が増える中、資源をやりくりしてできるだけ長いターン国を存続させるゲームです。

まだプログラミングを初めて４ヶ月目ぐらいの作品なのでコードが汚かったり、モジュール化できてなかったり、jqueryを気合で使ってDOMを操作しているなどの箇所はあります。もちろんクローンして改造してもいいですし、普通に遊んでTwitterなどでシェアしても大丈夫です。自分的には初心者なりに頑張ったので、ぜひ遊んで見てください。改善・魔改造版のプルリクも受け付けています。

### ゲームのルールは本READMEにはありません
このREADMEではゲームルールの説明は詳細には述べず、開発に関する内容を記述しています。ゲームの説明、ルールに関しては( https://jun-app/citygame/tutorial.html )を参考にしてください。


## ゲームの制作背景
このゲームを作成しようと思ったのは、私がWeb系言語の勉強を行い、そしてその中で「オブジェクト指向」について理解するためでした。オブジェクト指向について本を読んでもしっくりこず、わかる人に相談して「インスタンスや情報の切り替えが激しいものを作ると恩恵が理解できる。ゲームとかいいんじゃない？」とヒントを得てから、ブラウザで実装可能なゲームを作ることにしました。

オブジェクト指向を解説した書籍の言語がPHPだったのでPHPで実装しようとしましたが、このターン制ゲームの設計には不適でした。ページ遷移はせず、ブラウザ内の操作で状態が変化するとならば、javascriptです。ES6ならばクラス構文などわかりやすいクラス文で記述できるので、構文だけ少し勉強すればすんなりとできました。

## ゲームの設計について
### ゲームコンセプトの決め方
私は「プログラムはあくまでサービスを実現するための小道具の一つ」と考えてます。学習効果を高めるためにも、根幹となるサービスやゲームのコンセプトや大体の設計からまずは始めました。

このゲームは完全に私のオリジナリティというわけでもなく、simcity、civ、A列車でいこう、などのゲームから構想を得ています。自分が初心者なのもありますし、まずはオリジナルもとを参考にした方が開発が手取り早かったです。これらのゲームの要素やコンセプトを取り入れつつ、自分のオリジナリティを混ぜた結果、「理不尽な不幸が襲いかかるも、町を運用して長らく生き延びる、暇つぶし程度になるターン制のゲーム」が思いつきました。実際のゲームでもプレーヤーに困難が訪れる様な小さな仕掛けも実装しています。

### ゲームの詳細の決め方
コンセプトを決めてから上記のゲームを元に自分なりにゲームの流れを考えます。

- 一つの町で完結する。
- 資源には食糧、生産力、資金というものがある。
- 毎ターン人は食糧を消費する。足りないと怒る。
- 不満が特定の値までたまったら、ゲームオーバー
- できるだけ長く存続することがゲームの目的
- 建物には農場、工場、商業区があって、農場では食糧、工場では生産力...etc

などもっといろんな要素がありますが、まずは思いついたことをパラパラ書いて、次に各要素の整合性や調整を行うといいです。ここの解説は説明書通りのことなので

### 大まかなロジックの設計
#### ビュー側
HTMLで予め入力内容（箇所）を用意して**jquery**で値を書き換えています。UI、例えば（＋）（ー）ボタンで各建物インスタンスの労働者数プロパティの値を増減できる、と言ったビュー側とロジックのつなぎ目も**jqueryのクッリクイベントハンドラ**で値を書き換えています。いやー恐ろしいです。``game_operate.js``にその愚かさが書いてあります。見てみてください。まあ、当時の私にはそれぐらいでしたビューの変更ができなかったので仕方なしです。jquery地獄を味わいました。

### ロジック側
#### クラスとインスタンス``class.js``
建物、資源というクラスをまず大まかに分けて、建物からは

- 農場・工場
- 商業系
- 生産補助系
- 売買系
- 特殊系

の6つに分けました。登場するインスタンスの数が決まっていたので楽でした。

#### ゲーム操作と処理``game_operate.js``
インスタンスを生成し、また各種イベントハンドラの実装とターン終了後の食糧消費の関数、バットイベント、ゲームオーバー判定などの処理を記述しました。見た目的にはターンが終わっている感じですが、「次のターンへ」を押したら各処理（食糧消費とか資源の生産によるインスタンスの値を変えて、ビューに反映）を実行しているだけです。

見にくいと思いますが詳しくはコードを見てください。



インスタンスを生成し、また各種イベントハンドラの実装とターン終了後の食糧消費の関数、バットイベント、ゲームオーバー判定などの処理を記述しました。見た目的にはターンが終わっている感じですが、「次のターンへ」を押したら各処理を実行しているだけです。


今考えると「恐ろしいことをしていたなぁ。よく実装できたなぁ」と思います。VueやReactも使っていますが、それらのフレームワークの恩恵が本当にわかりました。

ゲームやプログラミングの実装には小難しさを感じることが昔はありましたが、観察して分解して考えると意外と簡単です。

- ユーザーの入力によって各インスタンスの情報が変化する。
- 背後ではプログラムがその値を用いて計算する。またはイベントの処理をする。
- ユーザーに見れる様にビュー側（見える部分の数字とか）を変更する。
- 変更された値を元に、またゲームのルールや流れを考えてさらに変化させる

の繰り返しです。そこにアニメーションが加わったり、緻密なストーリー構成・シミュレーションロジックがあることでゲームのクォリティや面白さが上がります。その




