$(function () {
    // 画像読み込み完了後に実行   // ※1
    $(window).on('load', function () {
        // カラムのwidthを設定する
        colWidth = $('.grid').outerWidth() + offsetX * 2;

        // 最初にgridArrayを初期化
        gridArray = [];
        // 空のgridArrayを作成する
        for (var i = 0; i < numOfCol; i++) {
            pushGridArray(i, 0, 1, -offsetY);
        }

        $('.grid').each(function (index) {
            setPosition($(this));
        });
    });

    var gridArray = [], // ※2
        colWidth,
        offsetX = 5,
        offsetY = 5,
        numOfCol = 5;

    // gridArrayに新しいgridを追加
    function pushGridArray(x, y, size, height) {
        for (var i = 0; i < size; i++) {
            var grid = [];
            grid.x = x + i;
            grid.endY = y + height + offsetY * 2;

            gridArray.push(grid);
        }
    }

    // gridArrayから指定したx位置にあるgridを削除
    function removeGridArray(x, size) {
        for (var i = 0; i < size; i++) {
            var idx = getGridIndex(x + i);
            gridArray.splice(idx, 1);
        }
    }

    // gridArray内にある高さの最小値と最大値および最小値のあるx値を取得
    function getHeightArray(x, size) {
        var heightArray = [];
        var temps = [];
        for (var i = 0; i < size; i++) {
            var idx = getGridIndex(x + i);
            temps.push(gridArray[idx].endY);
        }
        heightArray.min = Math.min.apply(Math, temps);
        heightArray.max = Math.max.apply(Math, temps);
        heightArray.x = temps.indexOf(heightArray.min);

        return heightArray;
    }

    // gridのx値を基準にgridのインデックスを検索
    function getGridIndex(x) {
        for (var i = 0; i < gridArray.length; i++) {
            var obj = gridArray[i];
            if (obj.x === x) {
                return i;
            }
        }
    }

    // gridを配置
    function setPosition(grid) {
        if (!grid.data('size') || grid.data('size') < 0) {
            grid.data('size', 1);
        }

        // gridの情報を定義
        var pos = [];
        var tempHeight = getHeightArray(0, gridArray.length);
        pos.x = tempHeight.x;
        pos.y = tempHeight.min;

        var gridWidth = colWidth - (grid.outerWidth() - grid.width());

        // gridのスタイルを更新   // ※3
        grid.css({
            'left': pos.x * colWidth,
            'top': pos.y,
            'position': 'absolute'
        });

        // gridArrayを新しいgridで更新
        removeGridArray(pos.x, grid.data('size'));
        pushGridArray(pos.x, pos.y, grid.data('size'), grid.outerHeight());
    }

    //IE用にArray.indexOfメソッドを追加  // ※4
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/) {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) {
                from += len;
            }

            for (; from < len; from++) {
                if (from in this && this[from] === elt) {
                    return from;
                }
            }
            return -1;
        };
    }
});
[/javascript]
    < p > カラム数が固定の為にウィンドウリサイズへの対応はまだですが、とりあえずここまででPinterest風のレイアウトは実現できました。結構ややこしいことになっているので、補足説明を入れておきます。</p >

<h4>※1) loadイベント発火後に処理を実行する</h4>
<p>上記に書かれているJavaScriptコードは全体を<span class="bold">$(function(){});</span>で囲っていることから、<span class="bold">onloadイベント</span>のタイミングで処理が実行されています。しかしonloadイベントとは<span class="bold red">HTMLコードがひと通り読み込まれ、JavaScriptが実行可能な状態になったタイミング</span>で発火するイベントであり、この時点ではまだ画像ファイルは読み込みが完了していません。したがってこのタイミングで実行してしまうと各グリッドの最終的なheight値が得られないまま処理が走ってしまうため、期待通りのレイアウトにならなくなります。上記コードはすべての画像ファイルの読み込みが完了してから実行する必要があるため、<span class="cybercyan bold">windowオブジェクトのloadイベント発火時</span>に実行させる必要があります。</p>

<h4>※2) 配置済みのグリッドの情報を配列で管理する</h4>
<p>このレイアウトを実現する上で一番のキーポイントです。まず<span class="bold">gridArray</span>という配列を定義します。</p>
<dl>
    <dt>gridArray:Array</dt>
    <dd>1. カラム数ぶんの長さを持つ。</dd>
    <dd>2. 配列には配置済みのグリッドのうち、各カラムの一番下に位置しているグリッドの情報が格納される</dd>
    <dd>3. 配列の各要素には以下の情報が格納される
    <ul>
            <li><span class="bold">x</span>: 自分<span class="ash">(※グリッド)</span>が格納されている配列のインデックス</li>
            <li><span class="bold">endY</span>: 自分<span class="ash">(※グリッド)</span>が配置されているカラムの上から下までの長さ<span class="ash">(※距離)</span></li>
        </ul>
    </dd>
</dl>
<p><img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2013/01/img-pin_logic1-640x288.png" alt="図3" width="640" height="288" class="custom-img size-medium wp-image-42242" /> <span class="bold ash">図3</span></p> <!--logic1 -->
<p>配列は図3のような構造をしています。5つのグリッド情報が配列に格納されており、これに6個目のグリッドを格納したいとします。<span class="ash">（※図4）</span></p>
<p><img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2013/01/img-pin_logic2-640x288.png" alt="図4" width="640" height="288" class="custom-img alignnone size-medium wp-image-42243" /> <span class="bold ash">図4</span></p> <!--logic2 -->
<p>すでに格納されている5つのグリッド情報のうち、<span class="bold">endY</span>の値が最も小さく且つ順番が若いのはgridArray[0]であり、グリッド6はここに格納します。</p>
<p><img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2013/01/img-pin_logic3-640x288.png" alt="img-pin_logic3" width="640" height="288" class="custom-img alignnone size-medium wp-image-42244" /> <span class="bold ash">図5</span></p> <!--logic3 -->
<p>よって図5のようにgridArray[0]には新たにグリッド6が格納され、endYの値も更新されます。このルーチンをひたすら繰り返すことで、次に来るグリッドがどのカラムのどの位置に配置されるかを算出していきます。</p>

<h4>※3) グリッドを絶対配置する</h4>
<p>※2の処理から取得したx値とy値でグリッドを絶対配置します。</p>

<h4>※4) IEにArray.indexOfメソッドを追加する</h4>
<p>なんとビックリ、InternetExplorerには<span class="bold red">Array.indexOfメソッドが実装されていません。</span>そこで上記のコードを記述することでIEにindexOfメソッドを追加させます。</p>
<ul>
    <li><a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf" target="_blank">Array indexOf method - JavaScript | MDN</a></li>
</ul>

<h3>4 | JavaScriptの実装2 - ウィンドウリサイズに対応</h3>
<p>ウィンドウ幅をリサイズした際にカラム数がウィンドウ幅に合わせて可変し、都度レイアウトが最適化されるような処理を追加していきます。</p>
<p class="code-summary bold">コードを以下のように編集、追記します。</p>

<p>ウィンドウのリサイズイベントにて<span class="bold">Container要素</span>と<span class="bold">Windowオブジェクト</span>の幅を取得します。そしてそこから表示可能なカラム数を算出して、レイアウトを適用します。</p>

<h3>4 | jQueryプラグイン化する</h3>
<p>最後にJavaScriptコードをjQueryプラグインとして外出しします。オプションとして渡せるパラメータは以下にしました。</p>
<ol>
    <li>offsetX</li>
    <li>offsetY</li>
    <li>gridElement</li>
</ol>
<p class="code-summary bold">jquery.pinterestGrid.js</p>

<p>これでプラグイン化できました。jQueryプラグインについては以下の記事にて詳しく解説しています。</p>
<ul>
    <li><a href="https://dev.classmethod.jp/client-side/html5-x-css3-x-jquery-8-jqplugin/" target="_blank">jQueryプラグインについて詳しく</a></li>
</ul>
<p>最後に呼び出し部分です。以下のようにオプション指定して呼び出します。</p>
<p class="code-summary bold">pinterestgrid.html <span class="ash">（※JS部分のみ）</span></p>
 
$(function () {
    $(window).on('load', function () {
        $('#container').pinterestGrid({
            offsetX: 8,
            offsetY: 8,
            gridElement: '.grid'
        });
    });
});