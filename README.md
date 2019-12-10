# Deeparture
[鈴木プロジェクト2019](http://www.ne.senshu-u.ac.jp/~proj2019-25/)

## キーボードショートカットについて
以下のキーボードショートカットに対応しています。

#### アーティスト・キー・リズムパターン選択画面
- **space** : デモ音源の再生/停止
- **esc** : チュートリアル非表示

#### DAW画面（メロディ入力画面）
- **⌘S** : 保存ウィンドウ表示
- **esc** : チュートリアル・保存ウィンドウ非表示
- **⏎** : 再生位置を先頭へ
- **space** : 再生/停止
- **⌘Z** : アンドゥ/取り消し (100まで)
- **⌘Y** : リドゥ/やり直し (100まで)
- **→** : 再生位置を進める
- **←** : 再生位置を戻す

## 動かし方
以下、全てコマンドライン上で実行

```
$ git clone https://github.com/suzupro2019/Deeparture.git
$ cd Deeparture
$ python manage.py migrate
$ python manage.py createsuperuser
$ python manage.py runserver
```

- `createsuperuser`で管理者権限を持つアカウントが作成できる。管理者権限を持つアカウントは管理サイト [`http://127.0.0.1:8000/admin/`] にアクセスすることができる。必要ない場合は実行しなくてもよい。

- `runserver`とすると開発用サーバが起動する。`http://127.0.0.1:8000/`にアクセスするとページが表示される。

<br>

*注）関連パッケージのインストールが済んでいない場合はインストールする。関連パッケージ は`requirements.txt`を参照。以下コマンドの実行により一括でインストールすることができる。*

```
$ pip install -r requirements.txt
```

<br>

(c) 2019 Suzuki Project, School of Network and Information, Senshu University
