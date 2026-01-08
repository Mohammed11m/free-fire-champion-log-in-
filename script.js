// --- إعدادات Firebase المركزية ---
const firebaseConfig = {
    // ضع هنا الرابط الخاص بك من Firebase Console
    databaseURL: "https://ff-champion-default-rtdb.firebaseio.com" 
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const SITE_NAME = "Free Fire Champion"; 
const ADMIN_ID = 'MOHAMMEDRAMZIA';
const ADMIN_PASS = 'MOHAMMED#2011';

let currentEditTarget = null;
let authMode = 'login';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('main-logo-text').innerText = SITE_NAME;
    document.getElementById('admin-logo-text').innerText = SITE_NAME;
    document.getElementById('dash-logo-text').innerText = SITE_NAME;
});

function showAlert(msg) {
    const alert = document.getElementById('custom-alert');
    document.getElementById('alert-text').innerText = msg;
    alert.classList.remove('translate-y-40');
    setTimeout(() => alert.classList.add('translate-y-40'), 3000);
}

function switchTab(mode) {
    authMode = mode;
    document.getElementById('login-tab').className = mode === 'login' ? 'flex-1 py-2 rounded font-bold transition-all text-white bg-yellow-500/20' : 'flex-1 py-2 rounded font-bold transition-all text-gray-500';
    document.getElementById('register-tab').className = mode === 'register' ? 'flex-1 py-2 rounded font-bold transition-all text-white bg-yellow-500/20' : 'flex-1 py-2 rounded font-bold transition-all text-gray-500';
    document.getElementById('submit-btn').innerText = mode === 'login' ? "ولوج النظام" : "إنشاء حساب بطل";
}

function handleAuth(e) {
    e.preventDefault();
    const id = document.getElementById('player-id').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (id === ADMIN_ID && pass === ADMIN_PASS) {
        showAdminPanel();
        return;
    }

    db.ref('users/' + id).once('value', (snapshot) => {
        const userData = snapshot.val();

        if (authMode === 'register') {
            if (userData) return showAlert("معرف البطل مسجل مسبقاً!");
            const newAcc = { password: pass, kills: 0, wins: 0, kd: "0.00", hs: 0, matches: 0, accuracy: 0, maxKills: 0 };
            db.ref('users/' + id).set(newAcc);
            showAlert("تم تسجيلك كبطل! يمكنك الدخول الآن.");
            switchTab('login');
        } else {
            if (userData && userData.password === pass) {
                enterDashboard(id, userData);
            } else {
                showAlert("خطأ في بيانات الولوج!");
            }
        }
    });
}

function showAdminPanel() {
    document.getElementById('auth-section').classList.add('hidden-section');
    document.getElementById('admin-section').classList.remove('hidden-section');
    renderAdminList();
}

function renderAdminList() {
    const list = document.getElementById('users-list');
    // التحديث اللحظي: أي جهاز يسجل سيظهر هنا فوراً
    db.ref('users').on('value', (snapshot) => {
        list.innerHTML = '';
        const accounts = snapshot.val() || {};
        Object.keys(accounts).forEach(id => {
            const acc = accounts[id];
            const div = document.createElement('div');
            div.className = 'cyber-card p-5 rounded-xl border-r-2 border-yellow-500/40 transition-all hover:bg-white/[0.03]';
            div.innerHTML = `
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-yellow-500/10 rounded flex items-center justify-center font-bold text-yellow-500 border border-yellow-500/20">${id.charAt(0).toUpperCase()}</div>
                    <div class="flex-1 overflow-hidden">
                        <h4 class="font-black text-white text-sm truncate">بطل: ${id}</h4>
                        <p class="text-[9px] text-green-500 font-mono tracking-tighter">PASS: ${acc.password}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="openEditModal('${id}')" class="flex-1 bg-yellow-500 text-black py-1.5 rounded-lg text-[10px] font-black uppercase">تعديل البيانات</button>
                    <button onclick="deleteAcc('${id}')" class="px-3 bg-red-600/20 text-red-500 rounded-lg text-xs">حذف</button>
                </div>`;
            list.appendChild(div);
        });
    });
}

function openEditModal(id) {
    currentEditTarget = id;
    db.ref('users/' + id).once('value', (snapshot) => {
        const acc = snapshot.val();
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-pass').value = acc.password;
        document.getElementById('edit-kills').value = acc.kills;
        document.getElementById('edit-wins').value = acc.wins;
        document.getElementById('edit-kd').value = acc.kd;
        document.getElementById('edit-hs').value = acc.hs;
        document.getElementById('edit-matches').value = acc.matches;
        document.getElementById('edit-accuracy').value = acc.accuracy;
        document.getElementById('edit-modal').classList.remove('hidden-section');
    });
}

function saveEdit() {
    const newId = document.getElementById('edit-id').value.trim();
    const updated = {
        password: document.getElementById('edit-pass').value,
        kills: parseInt(document.getElementById('edit-kills').value) || 0,
        wins: parseInt(document.getElementById('edit-wins').value) || 0,
        kd: document.getElementById('edit-kd').value || "0.00",
        hs: parseInt(document.getElementById('edit-hs').value) || 0,
        matches: parseInt(document.getElementById('edit-matches').value) || 0,
        accuracy: parseInt(document.getElementById('edit-accuracy').value) || 0
    };

    if (newId !== currentEditTarget) {
        db.ref('users/' + currentEditTarget).remove();
    }
    db.ref('users/' + newId).update(updated);
    
    showAlert("تم تحديث ملف البطل");
    closeModal();
}

function deleteAcc(id) {
    if(confirm("حذف حساب البطل؟")) {
        db.ref('users/' + id).remove();
    }
}

function closeModal() { document.getElementById('edit-modal').classList.add('hidden-section'); }

function enterDashboard(id, data) {
    document.getElementById('auth-section').classList.add('hidden-section');
    document.getElementById('dashboard-section').classList.remove('hidden-section');
    document.getElementById('display-id').innerText = "البطل: " + id;
    document.getElementById('profile-icon').innerText = id.charAt(0).toUpperCase();
    document.getElementById('stat-kills').innerText = data.kills;
    document.getElementById('stat-wins').innerText = data.wins;
    document.getElementById('stat-kd').innerText = data.kd;
    document.getElementById('stat-hs').innerText = data.hs + "%";
    document.getElementById('stat-matches').innerText = data.matches;
    document.getElementById('stat-accuracy').innerText = data.accuracy + "%";
    document.getElementById('stat-max-kills').innerText = data.maxKills || 0;
}

function logout() { location.reload(); }