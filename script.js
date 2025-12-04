document.addEventListener('DOMContentLoaded', () => {
    const loadVideoBtn = document.getElementById('load-video-btn');
    const videoDetails = document.getElementById('video-details');
    const videoTitle = document.getElementById('video-title');
    const videoThumbnail = document.getElementById('video-thumbnail');
    
    const addRowBtn = document.getElementById('add-row-btn');
    const notesTableBody = document.querySelector('#notes-table tbody');

    // ★ localStorageのキーを定義
    const STORAGE_KEY = 'youtubeMemoNotes';

    // --- 1. 動画情報の読み込み（モックアップ） ---
    loadVideoBtn.addEventListener('click', () => {
        const urlInput = document.getElementById('video-url').value;
        if (urlInput.includes('youtube.com')) {
            const dummyTitle = "【ガジェット】最新スマホ開封！驚きの新機能と欠点も正直レビュー";
            const dummyThumbnail = "https://img.youtube.com/vi/SAMPLEID/default.jpg"; // ダミーURL

            videoTitle.textContent = dummyTitle;
            videoThumbnail.src = dummyThumbnail;
            videoDetails.style.display = 'flex'; // 詳細情報を表示
        } else {
            alert('有効なYouTube URLを入力してください。');
        }
    });

    // ★ データをlocalStorageに保存する関数
    function saveNotes() {
        const rows = notesTableBody.querySelectorAll('tr');
        const notesData = [];

        rows.forEach(row => {
            const text = row.querySelector('textarea').value;
            const type = row.querySelector('select').value;
            const time = row.querySelectorAll('input[type="text"]')[0].value;
            const memo = row.querySelectorAll('input[type="text"]')[1].value;
            
            notesData.push({ text, type, time, memo });
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(notesData));
    }

    // --- 2. メモ行の追加・削除機能 ---

    /**
     * 新しいテーブル行 (メモ行) を作成する関数 (初期データを受け取るように修正)
     */
    function createNewRow(data = {}) {
        const row = notesTableBody.insertRow();
        
        // デフォルト値と渡されたデータをマージ
        const defaults = { text: '', type: 'video', time: '', memo: '' };
        const rowData = { ...defaults, ...data };
        
        row.innerHTML = `
            <td><textarea rows="3" placeholder="お気に入りの発言やコメントを記入">${rowData.text}</textarea></td>
            <td>
                <select>
                    <option value="video" ${rowData.type === 'video' ? 'selected' : ''}>動画</option>
                    <option value="comment" ${rowData.type === 'comment' ? 'selected' : ''}>コメント</option>
                </select>
            </td>
            <td><input type="text" placeholder="00:00:00 または 日時" value="${rowData.time}"></td>
            <td><input type="text" placeholder="メモ" value="${rowData.memo}"></td>
            <td><button class="delete-btn">🗑️</button></td>
        `;

        // 削除ボタンにイベントリスナーを設定
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            row.remove();
            saveNotes(); // 削除時にも保存
        });
        
        // ★ 入力要素すべてにイベントリスナーを設定し、変更があったら保存
        const inputElements = row.querySelectorAll('textarea, select, input[type="text"]');
        inputElements.forEach(el => {
            // 入力中(input)とフォーカスが外れた時(change)の両方で保存
            el.addEventListener('input', saveNotes);
            el.addEventListener('change', saveNotes);
        });
    }
    
    // ★ localStorageからデータを読み込む関数
    function loadNotes() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const notes = JSON.parse(savedData);
                
                // データが存在する場合は、既存の行をクリアしてから復元
                if (notes && notes.length > 0) {
                    notesTableBody.innerHTML = ''; 
                    notes.forEach(note => {
                        createNewRow(note);
                    });
                    return; // 読み込みが成功したら終了
                }
            } catch (e) {
                console.error('Error parsing notes from localStorage:', e);
                // エラー時は何もしない
            }
        }
        
        // データがない、またはパースエラーの場合は初期の空行を作成
        createNewRow();
    }
    
    // ページの読み込み完了時にデータをロード
    loadNotes();

    // 行追加ボタンのイベントリスナー
    addRowBtn.addEventListener('click', () => {
        createNewRow();
        saveNotes(); // 行追加時にも保存
    });

    // --- 3. ユーザーメモ列の追加（未実装の機能として案内） ---
    const addColumnBtn = document.querySelector('.add-column-btn');
    addColumnBtn.addEventListener('click', () => {
        alert('この機能は高度なDOM操作とデータ構造の変更が必要です。後のフェーズで実装しましょう！');
    });

});