/* ==========================================================================
   ADSALES SYNC ENTERPRISE - ADMIN USER MANAGEMENT ENGINE (admin.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const MASTER_PIN = '1234';
    const SHARED_DEFAULT_BLOB = '019fcb65-44a7-725c-bb3f-39c8cc55649a';
    const CLOUD_API_BASE = 'https://jsonblob.com/api/jsonBlob';
    let cloudBlobId = localStorage.getItem('adsales_blob_id') || SHARED_DEFAULT_BLOB;

    const adminAuthGate = document.getElementById('admin-auth-gate');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPinInput = document.getElementById('admin-pin-input');
    const adminMainDashboard = document.getElementById('admin-main-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    const statUsers = document.getElementById('stat-users-count');
    const statMB = document.getElementById('stat-mb-count');
    const statSales = document.getElementById('stat-sales-count');
    const statDepts = document.getElementById('stat-depts-count');

    const usersTableBody = document.getElementById('users-table-body');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserModalBtn = document.getElementById('close-user-modal-btn');
    const cancelUserModalBtn = document.getElementById('cancel-user-modal-btn');
    const userForm = document.getElementById('user-form');
    const userModalTitle = document.getElementById('user-modal-title');
    const userIdInput = document.getElementById('user-id');

    const defaultUsers = [
        { id: 'u-1', name: 'المدير العام (Admin Desk)', dept: 'general', role: 'admin', pin: '1234', active: true, createdAt: '2026-08-01' },
        { id: 'u-2', name: 'أحمد محمود (Media Buyer)', dept: 'clinics', role: 'mediabuyer', pin: '1111', active: true, createdAt: '2026-08-02' },
        { id: 'u-3', name: 'سارة علي (Sales Rep)', dept: 'realestate', role: 'sales', pin: '2222', active: true, createdAt: '2026-08-03' }
    ];

    let usersState = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;

    if (sessionStorage.getItem('admin_authenticated') === 'true') {
        adminAuthGate.style.display = 'none';
        adminMainDashboard.style.display = 'block';
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = adminPinInput.value.trim();
            if (pin === MASTER_PIN) {
                sessionStorage.setItem('admin_authenticated', 'true');
                adminAuthGate.style.display = 'none';
                adminMainDashboard.style.display = 'block';
                renderAdminDashboard();
            } else {
                alert('❌ رمز الـ Master PIN غير صحيح! يرجى إدخال الرمز الصحيح.');
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
                <td><span class="dept-tag">${getDeptLabel(user.dept)}</span></td>
                <td>${getRoleBadge(user.role)}</td>
                <td><span class="pin-display"><code>${user.pin}</code></span></td>
                <td>
                    <span class="status-badge ${user.active ? 'badge-winning' : 'badge-pause'}">
                        ${user.active ? '🟢 مفعل' : '🔴 معطل'}
                    </span>
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${user.createdAt || '2026-08-04'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')" title="تعديل الحساب والـ PIN"><i class="fa-solid fa-pen"></i></button>
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
            document.getElementById('user-dept').value = user.dept;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-pin').value = user.pin;
            userModalTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> تعديل بيانات الحساب والـ PIN`;
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
            userModalTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> إضافة حساب عضو جديد`;
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
            const dept = document.getElementById('user-dept').value;
            const role = document.getElementById('user-role').value;
            const pin = document.getElementById('user-pin').value.trim();

            const existingPinUser = usersState.find(u => u.pin === pin && u.id !== id);
            if (existingPinUser) {
                alert(`⚠️ تنبيه: رمز الـ PIN (${pin}) مستخدم بالفعل من قبل الحساب "${existingPinUser.name}". يرجى اختيار رمز PIN آخر.`);
                return;
            }

            if (id) {
                const user = usersState.find(u => u.id === id);
                if (user) {
                    user.name = name;
                    user.dept = dept;
                    user.role = role;
                    user.pin = pin;
                }
            } else {
                const newUser = {
                    id: 'u-' + Date.now(),
                    name, dept, role, pin, active: true,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                usersState.push(newUser);
            }

            userModal.classList.add('hidden');
            saveUsers();
            alert('✅ تم حفظ الحساب والرمز السري بنجاح!');
        });
    }

    renderAdminDashboard();
});
