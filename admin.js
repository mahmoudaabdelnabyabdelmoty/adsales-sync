/* ==========================================================================
   ADSALES SYNC ENTERPRISE - ADMIN USER MANAGEMENT ENGINE (admin.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const MASTER_USER = 'admin';
    const MASTER_PASS = 'admin123';

    const adminAuthGate = document.getElementById('admin-auth-gate');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminUserInput = document.getElementById('admin-user-input');
    const adminPassInput = document.getElementById('admin-pass-input');
    const adminMainDashboard = document.getElementById('admin-main-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    const statUsers = document.getElementById('stat-users-count');
    const statMB = document.getElementById('stat-mb-count');
    const statSales = document.getElementById('stat-sales-count');

    const usersTableBody = document.getElementById('users-table-body');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserModalBtn = document.getElementById('close-user-modal-btn');
    const cancelUserModalBtn = document.getElementById('cancel-user-modal-btn');
    const userForm = document.getElementById('user-form');
    const userModalTitle = document.getElementById('user-modal-title');
    const userIdInput = document.getElementById('user-id');

    const defaultUsers = [
        { id: 'u-1', name: 'المدير العام (Admin Desk)', username: 'admin', password: 'admin123', dept: 'general', role: 'admin', active: true },
        { id: 'u-2', name: 'أحمد محمود (Media Buyer)', username: 'media', password: 'media123', dept: 'clinics', role: 'mediabuyer', active: true },
        { id: 'u-3', name: 'سارة علي (Sales Rep)', username: 'sales', password: 'sales123', dept: 'realestate', role: 'sales', active: true }
    ];

    let usersState = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;

    if (!localStorage.getItem('adsales_registered_users')) {
        localStorage.setItem('adsales_registered_users', JSON.stringify(defaultUsers));
    }

    if (sessionStorage.getItem('admin_authenticated') === 'true') {
        adminAuthGate.style.display = 'none';
        adminMainDashboard.style.display = 'block';
        renderAdminDashboard();
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = adminUserInput.value.trim();
            const p = adminPassInput.value.trim();

            if (u === MASTER_USER && p === MASTER_PASS) {
                sessionStorage.setItem('admin_authenticated', 'true');
                adminAuthGate.style.display = 'none';
                adminMainDashboard.style.display = 'block';
                renderAdminDashboard();
            } else {
                alert('❌ اسم المستخدم أو كلمة المرور الخاصة بالمدير غير صحيحة!');
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_authenticated');
            window.location.reload();
        });
    }

    function getDeptLabel(deptKey) {
        switch(deptKey) {
            case 'realestate': return 'قسم العقارات';
            case 'clinics': return 'قسم العيادات والخدمات الطبية';
            case 'ecommerce': return 'قسم التجارة الإلكترونية';
            case 'general': default: return 'قسم المبيعات العامة';
        }
    }

    function getRoleBadge(role) {
        switch(role) {
            case 'admin': return `<span class="badge-role badge-admin"><i class="fa-solid fa-crown"></i> المدير العام</span>`;
            case 'mediabuyer': return `<span class="badge-role badge-mediabuyer"><i class="fa-solid fa-chart-line"></i> Media Buyer</span>`;
            case 'sales': default: return `<span class="badge-role badge-sales"><i class="fa-solid fa-headset"></i> مسؤول مبيعات</span>`;
        }
    }

    function renderAdminDashboard() {
        if (statUsers) statUsers.textContent = usersState.length;
        if (statMB) statMB.textContent = usersState.filter(u => u.role === 'mediabuyer').length;
        if (statSales) statSales.textContent = usersState.filter(u => u.role === 'sales').length;

        if (!usersTableBody) return;
        usersTableBody.innerHTML = '';

        usersState.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td><span class="user-tag-display">@${user.username}</span></td>
                <td><code>${user.password}</code></td>
                <td><span class="dept-tag">${getDeptLabel(user.dept)}</span></td>
                <td>${getRoleBadge(user.role)}</td>
                <td>
                    <span class="status-badge ${user.active ? 'badge-winning' : 'badge-pause'}">
                        ${user.active ? '🟢 مفعل' : '🔴 معطل'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')" title="تعديل الحساب"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus('${user.id}')" title="تفعيل / تعطيل"><i class="fa-solid fa-power-off"></i></button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteUser('${user.id}')" style="color: #ef4444;" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    function saveUsers() {
        localStorage.setItem('adsales_registered_users', JSON.stringify(usersState));
        renderAdminDashboard();
    }

    window.editUser = function(id) {
        const user = usersState.find(u => u.id === id);
        if (user) {
            userIdInput.value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-password').value = user.password;
            document.getElementById('user-dept').value = user.dept;
            document.getElementById('user-role').value = user.role;
            userModalTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> تعديل بيانات الحساب وكلمة المرور`;
            userModal.classList.remove('hidden');
        }
    };

    window.toggleUserStatus = function(id) {
        const user = usersState.find(u => u.id === id);
        if (user) {
            user.active = !user.active;
            saveUsers();
        }
    };

    window.deleteUser = function(id) {
        if (confirm('هل أنت تأكد من رغبتك في حذف هذا الحساب؟')) {
            usersState = usersState.filter(u => u.id !== id);
            saveUsers();
        }
    };

    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            userForm.reset();
            userIdInput.value = '';
            userModalTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> إنشاء حساب عضو جديد`;
            userModal.classList.remove('hidden');
        });
    }

    if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', () => userModal.classList.add('hidden'));
    if (cancelUserModalBtn) cancelUserModalBtn.addEventListener('click', () => userModal.classList.add('hidden'));

    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = userIdInput.value;
            const name = document.getElementById('user-name').value.trim();
            const username = document.getElementById('user-username').value.trim().toLowerCase();
            const password = document.getElementById('user-password').value.trim();
            const dept = document.getElementById('user-dept').value;
            const role = document.getElementById('user-role').value;

            const existingUser = usersState.find(u => u.username === username && u.id !== id);
            if (existingUser) {
                alert(`⚠️ تنبيه: اسم المستخدم (@${username}) مستخدم بالفعل من قبل الحساب "${existingUser.name}". يرجى اختيار اسم مستخدم آخر.`);
                return;
            }

            if (id) {
                const user = usersState.find(u => u.id === id);
                if (user) {
                    user.name = name;
                    user.username = username;
                    user.password = password;
                    user.dept = dept;
                    user.role = role;
                }
            } else {
                const newUser = {
                    id: 'u-' + Date.now(),
                    name, username, password, dept, role, active: true
                };
                usersState.push(newUser);
            }

            userModal.classList.add('hidden');
            saveUsers();
            alert(`✅ تم حفظ حساب (@${username}) وكلمة المرور بنجاح!`);
        });
    }

    renderAdminDashboard();
});
