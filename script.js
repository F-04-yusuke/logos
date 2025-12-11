import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// (中略: Firebase Config, App Initialization, Utility Functions)

// Firebaseの設定（元のコードから流用）
const firebaseConfig = {
    apiKey: "",
    authDomain: "chat202512061300.firebaseapp.com",
    projectId: "chat202512061300",
    storageBucket: "chat202512061300.firebasestorage.app",
    messagingSenderId: "582481968056",
    appId: "1:582481968056:web:d0fcb4de9e06defb006d4d"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 日時をいい感じの形式にする関数
function convertTimestampToDatetime(timestamp) {
    const _d = timestamp ? new Date(timestamp * 1000) : new Date();
    const Y = _d.getFullYear();
    const m = (_d.getMonth() + 1).toString().padStart(2, '0');
    const d = _d.getDate().toString().padStart(2, '0');
    const H = _d.getHours().toString().padStart(2, '0');
    const i = _d.getMinutes().toString().padStart(2, '0');
    const s = _d.getSeconds().toString().padStart(2, '0');
    return `${Y}/${m}/${d} ${H}:${i}:${s}`;
}


// Firestore 形式のデータを配列形式に出力する関数
function documentConverter(fireStoreDocs) {
    const documents = [];
    fireStoreDocs.forEach(function (doc) {
        documents.push({
            id: doc.id,
            data: doc.data(),
        });
    });
    return documents;
}

// 分類コードを日本語表示名に変換する関数を定義
function getSourceDisplayName(code) {
    switch (code) {
        case 'youtube':
            return 'YouTube';
        case 'x':
            return 'X (旧Twitter)'; // Xは旧Twitterと併記
        case 'article':
            return '記事';
        case 'qa':
            return '知恵袋/Q&A';
        case 'book':
            return '本';
        default:
            return code;
    }
}

// データをHTMLの行（<tr>）として出力する関数
function rowElements(documents) {
    const elements = [];
    documents.forEach(function (document) {
        const data = document.data;
        const datetime = data.time ? convertTimestampToDatetime(data.time.seconds) : '処理中...';
        
        // ★分類コードを日本語名に変換
        const displayName = getSourceDisplayName(data.source_type);

        elements.push(`
            <tr id="${document.id}">
                <td><a href="${data.url}" target="_blank">${data.url}</a></td>
                <td>${displayName}</td> <td>${data.time_page}</td>
                <td>${data.summary}</td>
                
                <td>${datetime}</td>
                <td><button class="delete-btn" data-id="${document.id}">削除</button></td>
            </tr>
        `);
    });
    return elements;
}

// (中略: 投稿ボタンの処理、データのリアルタイム取得処理、削除ボタンのクリックイベント処理)

// 投稿ボタンの処理
$("#send").on("click", function () {
    const postData = {
        url: $("#url").val(),
        source_type: $("#source_type").val(),
        time_page: $("#time_page").val(),
        summary: $("#summary").val(),
        time: serverTimestamp(), // 投稿日時
    };

    if (!postData.url || !postData.summary) {
        alert("URLと抜粋内容を必ず入力してください。");
        return;
    }

    addDoc(collection(db, "logos_sources"), postData)
        .then(() => {
            $("#url").val("");
            $("#time_page").val("");
            $("#summary").val("");
            $("#source_type").val("youtube"); 
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert("投稿中にエラーが発生しました。");
        });
});

// データのリアルタイム取得処理
const q = query(collection(db, "logos_sources"), orderBy("time", "desc"));

onSnapshot(q, (querySnapshot) => {
    const documents = documentConverter(querySnapshot.docs);
    const elements = rowElements(documents);
    $("#output tbody").html(elements);
});


// 削除ボタンのクリックイベント処理（動的に生成される要素に対応するため、documentにイベントを委譲）
$(document).on("click", ".delete-btn", function() {
    const deleteId = $(this).data("id");
    
    if (confirm("本当にこの投稿を削除しますか？")) {
        const docRef = doc(db, "logos_sources", deleteId);
        
        deleteDoc(docRef)
            .then(() => {
                console.log("Document successfully deleted! ID:", deleteId);
            })
            .catch((error) => {
                console.error("Error removing document: ", error);
                alert("削除中にエラーが発生しました。");
            });
    }
});