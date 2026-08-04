/* ==========================================================================
   ADSALES SYNC ENTERPRISE - STREAMLINED CORE ENGINE (app.js)
   ========================================================================== */

window.openRoleModal = function() {
    const modal = document.getElementById('role-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const SHARED_DEFAULT_BLOB = '019fcb65-44a7-725c-bb3f-39c8cc55649a';
    const CLOUD_API_BASE = 'https://jsonblob.com/api/jsonBlob';
    let cloudBlobId = getQueryParam('blob') || localStorage.getItem('adsales_blob_id') || SHARED_DEFAULT_BLOB;

    const ROLES_CONFIG = {
        viewer: { name: 'زائر (عرض فقط - Read Only)', icon: 'fa-eye', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: false, canEditNotes: false },
        sales: { name: 'مسؤول مبيعات (Sales Rep)', icon: 'fa-headset', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: true, canEditNotes: true },
        mediabuyer: { name: 'Media Buyer', icon: 'fa-chart-line', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true },
        admin: { name: 'المدير العام (Admin)', icon: 'fa-crown', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true }
    };

    const defaultUsers = [
        { id: 'u-1', name: 'المدير العام (Admin Desk)', username: 'admin', password: 'admin123', role: 'admin', active: true },
        { id: 'u-2', name: 'أحمد محمود (Media Buyer)', username: 'media', password: 'media123', role: 'mediabuyer', active: true },
        { id: 'u-3', name: 'سارة علي (Sales Rep)', username: 'sales', password: 'sales123', role: 'sales', active: true }
    ];

    if (!localStorage.getItem('adsales_registered_users')) {
        localStorage.setItem('adsales_registered_users', JSON.stringify(defaultUsers));
    }

    let loggedUser = JSON.parse(localStorage.getItem('adsales_logged_user')) || null;
    let currentRole = loggedUser ? loggedUser.role : 'viewer';

    const initialAds = [
        {
            id: 'ad-101',
            name: 'Ad 01 - Fire Extinguisher Carousel',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Business_Owners',
            salesRep: 'أحمد محمود',
            status: 'winning',
            quality: 'qualified',
            salesNotes: 'إعلان ممتاز جداً، معظم المحادثات عملاء جادين بيطلبوا عروض أسعار للمصانع.',
            updatedAt: new Date(Date.now() - 3600000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-102',
            name: 'Ad 02 - Safety Alarm Systems Video',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Factory_Managers',
            salesRep: 'سارة علي',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: 'الرسائل كتير جداً بس كلهم بيسألوا عن شغل أو وظائف، مش عملاء لشراء النظام!',
            updatedAt: new Date(Date.now() - 7200000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-103',
            name: 'Ad 03 - Emergency Smoke Detector Offer',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_RealEstate_Devs',
            salesRep: 'محمود حسن',
            status: 'testing',
            quality: 'mixed',
            salesNotes: 'مستوى الرسائل متوسط، جاري متابعة 4 عملاء محتملين.',
            updatedAt: new Date(Date.now() - 1800000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-104',
            name: 'Ad 04 - VIP Maintenance Package',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_Hotel_Managers',
            salesRep: 'أحمد محمود',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: 'الأسعار بالنسبة لهم غالية وبيقفلوا السكة فك الإعلان ده فاشل.',
            updatedAt: new Date(Date.now() - 5400000).toLocaleString('ar-EG')
        }
    ];

    let adsState = JSON.parse(localStorage.getItem('adsales_sync_data')) || initialAds;

    const viewButtons = document.querySelectorAll('.nav-btn');
    const viewPanels = document.querySelectorAll('.view-panel');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const shareLinkBtn = document.getElementById('share-link-btn');

    const roleBadge = document.getElementById('role-badge');
    const roleText = document.getElementById('role-text');
    const loginRoleBtn = document.getElementById('login-role-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const roleModal = document.getElementById('role-modal');
    const closeRoleModalBtn = document.getElementById('close-role-modal-btn');
    const cancelRoleModalBtn = document.getElementById('cancel-role-modal-btn');
    const roleForm = document.getElementById('role-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');

    const statTotal = document.getElementById('stat-total-ads');
    const statWinning = document.getElementById('stat-winning-ads');
    const statPause = document.getElementById('stat-pause-ads');
    const statTesting = document.getElementById('stat-testing-ads');

    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterSales = document.getElementById('filter-sales');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    const liveAdsGrid = document.getElementById('live-ads-grid');
    const salesTableBody = document.getElementById('sales-table-body');
    const salesMobileCards = document.getElementById('sales-mobile-cards');
    const mediaBuyerTableBody = document.getElementById('media-buyer-table-body');

    const addAdBtn = document.getElementById('add-ad-btn');
    const adModal = document.getElementById('ad-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const adForm = document.getElementById('ad-form');
    const modalTitle = document.getElementById('modal-title');
    const adIdInput = document.getElementById('ad-id');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async function initCloudSync() {
        localStorage.setItem('adsales_blob_id', cloudBlobId);
        await fetchFromCloud();
        setInterval(fetchFromCloud, 3000);
    }

    async function fetchFromCloud() {
        if (!cloudBlobId) return;
        try {
            const res = await fetch(`${CLOUD_API_BASE}/${cloudBlobId}`);
            if (res.ok) {
                const cloudData = await res.json();
                
                let remoteAds = Array.isArray(cloudData) ? cloudData : (cloudData.ads || adsState);
                let remoteUsers = Array.isArray(cloudData) ? null : cloudData.users;

                if (Array.isArray(remoteAds) && JSON.stringify(remoteAds) !== JSON.stringify(adsState)) {
                    adsState = remoteAds;
                    localStorage.setItem('adsales_sync_data', JSON.stringify(adsState));
                    renderAll();
                }

                if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
                    localStorage.setItem('adsales_registered_users', JSON.stringify(remoteUsers));
                }
            }
        } catch (e) {}
    }

    async function saveToCloud() {
        localStorage.setItem('adsales_sync_data', JSON.stringify(adsState));
        renderAll();

        if (!cloudBlobId) return;
        try {
            const registeredUsers = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;
            const newPayload = { ads: adsState, users: registeredUsers };

            await fetch(`${CLOUD_API_BASE}/${cloudBlobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(newPayload)
            });
        } catch (e) {}
    }

    function applyRolePermissions() {
        const config = ROLES_CONFIG[currentRole] || ROLES_CONFIG.viewer;
        document.body.className = document.body.className.replace(/role-\w+/g, '');
        document.body.classList.add(`role-${currentRole}`);

        if (loggedUser) {
            roleBadge.innerHTML = `<i class="fa-solid ${config.icon}"></i> <span id="role-text">${loggedUser.name} (${config.name})</span>`;
            if (loginRoleBtn) loginRoleBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            roleBadge.innerHTML = `<i class="fa-solid ${config.icon}"></i> <span id="role-text">${config.name}</span>`;
            if (loginRoleBtn) loginRoleBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    }

    if (loginRoleBtn) loginRoleBtn.addEventListener('click', window.openRoleModal);
    if (roleBadge) roleBadge.addEventListener('click', () => { if (!loggedUser) window.openRoleModal(); });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            loggedUser = null;
            currentRole = 'viewer';
            localStorage.removeItem('adsales_logged_user');
            applyRolePermissions();
            renderAll();
            alert('🔒 تم تسجيل الخروج والعودة لوضع الزائر (Read-Only).');
        });
    }

    if (closeRoleModalBtn) closeRoleModalBtn.addEventListener('click', () => roleModal.classList.add('hidden'));
    if (cancelRoleModalBtn) cancelRoleModalBtn.addEventListener('click', () => roleModal.classList.add('hidden'));

    if (roleForm) {
        roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const uInput = loginUsernameInput.value.trim().toLowerCase();
            const pInput = loginPasswordInput.value.trim();

            const registeredUsers = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;
            const match = registeredUsers.find(u => u.username.toLowerCase() === uInput && u.password === pInput && u.active);

            if (!match) {
                alert('❌ اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التأكد من اسم المستخدم وكلمة المرور المسجلة في لوحة التحكم.');
                return;
            }

            loggedUser = match;
            currentRole = match.role;
            localStorage.setItem('adsales_logged_user', JSON.stringify(loggedUser));

            roleForm.reset();
            roleModal.classList.add('hidden');
            applyRolePermissions();
            renderAll();

            alert(`✅ أهلاً بك يا ${match.name}! تم تسجيل الدخول بنجاح بصلاحية (${ROLES_CONFIG[currentRole].name}).`);
        });
    }

    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const finalUrl = window.location.href;
            navigator.clipboard.writeText(finalUrl).then(() => {
                alert('✅ تم نسخ رابط AdSales Sync Enterprise الرسمي:\n\n' + finalUrl);
            }).catch(() => {
                prompt('رابط AdSales Sync الرسمي:', finalUrl);
            });
        });
    }

    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetView = btn.getAttribute('data-view');
            const targetEl = document.getElementById(`view-${targetView}`);
            if (targetEl) targetEl.classList.add('active');
        });
    });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });
    }

    function updateSalesFilterOptions() {
        if (!filterSales) return;
        const salesReps = [...new Set(adsState.map(ad => ad.salesRep))];
        const currentVal = filterSales.value;
        filterSales.innerHTML = '<option value="all">الجميع</option>';
        salesReps.forEach(rep => {
            const opt = document.createElement('option');
            opt.value = rep;
            opt.textContent = rep;
            if (rep === currentVal) opt.selected = true;
            filterSales.appendChild(opt);
        });
    }

    function updateMetrics() {
        if (statTotal) statTotal.textContent = adsState.length;
        if (statWinning) statWinning.textContent = adsState.filter(a => a.status === 'winning').length;
        if (statPause) statPause.textContent = adsState.filter(a => a.status === 'pause').length;
        if (statTesting) statTesting.textContent = adsState.filter(a => a.status === 'testing').length;
    }

    function getFilteredAds() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const statusVal = filterStatus ? filterStatus.value : 'all';
        const salesVal = filterSales ? filterSales.value : 'all';

        return adsState.filter(ad => {
            const matchesQuery = ad.name.toLowerCase().includes(query) ||
                                 ad.campaign.toLowerCase().includes(query) ||
                                 ad.adset.toLowerCase().includes(query) ||
                                 ad.salesRep.toLowerCase().includes(query);
            const matchesStatus = (statusVal === 'all') || (ad.status === statusVal);
            const matchesSales = (salesVal === 'all') || (ad.salesRep === salesVal);

            return matchesQuery && matchesStatus && matchesSales;
        });
    }

    function getStatusBadgeHTML(status) {
        switch(status) {
            case 'winning': return `<span class="status-badge badge-winning"><i class="fa-solid fa-circle-check"></i> شغال تمام (Scale)</span>`;
            case 'pause': return `<span class="status-badge badge-pause"><i class="fa-solid fa-circle-xmark"></i> أوقف الإعلان (Pause)</span>`;
            case 'testing': default: return `<span class="status-badge badge-testing"><i class="fa-solid fa-vial"></i> قيد الاختبار</span>`;
        }
    }

    function renderLiveBoard(filteredAds) {
        if (!liveAdsGrid) return;
        liveAdsGrid.innerHTML = '';
        if (filteredAds.length === 0) {
            liveAdsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>لا توجد إعلانات مطابقة.</div>`;
            return;
        }
        const isLocked = !ROLES_CONFIG[currentRole].canEditStructure;

        filteredAds.forEach(ad => {
            const card = document.createElement('div');
            card.className = `ad-card status-${ad.status}`;
            card.innerHTML = `
                <div class="ad-card-header">
                    <div class="ad-card-top-bar">
                        <span class="campaign-tag"><i class="fa-solid fa-layer-group"></i> ${ad.campaign}</span>
                        ${getStatusBadgeHTML(ad.status)}
                    </div>
                    <div class="ad-title-area"><h4>${ad.name}</h4></div>
                </div>
                <div class="ad-meta-list">
                    <div class="meta-item"><span class="meta-label">المجموعة الإعلانية:</span><span class="meta-val">${ad.adset}</span></div>
                    <div class="meta-item"><span class="meta-label">مسؤول الـ Sales:</span><span class="meta-val"><i class="fa-solid fa-user-tag"></i> ${ad.salesRep}</span></div>
                    <div class="meta-item"><span class="meta-label">التحديث:</span><span class="meta-val" style="font-size:0.78rem;">${ad.updatedAt}</span></div>
                </div>
                <div class="sales-note-box">
                    <strong><i class="fa-solid fa-comment-dots"></i> ملاحظة الـ Sales الحالية:</strong>
                    ${ad.salesNotes ? ad.salesNotes : 'لا توجد ملاحظات بعد.'}
                </div>
                <div class="ad-card-actions ${isLocked ? 'action-locked' : ''}">
                    ${ad.status !== 'pause' ? 
                        `<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus('${ad.id}', 'pause')" style="color: var(--status-pause-text); border-color: var(--status-pause-border);" ${isLocked ? 'disabled' : ''}><i class="fa-solid fa-pause"></i> علم للإيقاف</button>` : 
                        `<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus('${ad.id}', 'winning')" style="color: var(--status-winning-text); border-color: var(--status-winning-border);" ${isLocked ? 'disabled' : ''}><i class="fa-solid fa-play"></i> إعلان شغال تمام</button>`
                    }
                    <button class="btn btn-secondary ad-action-btn" onclick="editAdModal('${ad.id}')" ${isLocked ? 'disabled' : ''}><i class="fa-solid fa-pen-to-square"></i> تعديل</button>
                </div>
            `;
            liveAdsGrid.appendChild(card);
        });
    }

    function renderSalesView(filteredAds) {
        if (!salesTableBody || !salesMobileCards) return;
        salesTableBody.innerHTML = '';
        salesMobileCards.innerHTML = '';
        const canEditQuality = ROLES_CONFIG[currentRole].canEditQuality;
        const canEditNotes = ROLES_CONFIG[currentRole].canEditNotes;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ad.name}</strong></td>
                <td>${ad.campaign}</td>
                <td>${ad.adset}</td>
                <td><i class="fa-solid fa-user-tag"></i> ${ad.salesRep}</td>
                <td>
                    <select class="quality-select" onchange="updateAdQuality('${ad.id}', this.value)" ${!canEditQuality ? 'disabled' : ''}>
                        <option value="qualified" ${ad.quality === 'qualified' ? 'selected' : ''}>🟢 عملاء ممتازين (Qualified)</option>
                        <option value="mixed" ${ad.quality === 'mixed' ? 'selected' : ''}>🟡 عملاء متوسطين (Mixed)</option>
                        <option value="unqualified" ${ad.quality === 'unqualified' ? 'selected' : ''}>🔴 غير مهتمين / سيء</option>
                    </select>
                </td>
                <td>
                    <select class="status-select" onchange="updateAdStatus('${ad.id}', this.value)" ${!canEditQuality ? 'disabled' : ''}>
                        <option value="winning" ${ad.status === 'winning' ? 'selected' : ''}>🟢 شغال تمام (Scale)</option>
                        <option value="testing" ${ad.status === 'testing' ? 'selected' : ''}>🟡 قيد الاختبار (Testing)</option>
                        <option value="pause" ${ad.status === 'pause' ? 'selected' : ''}>🔴 أوقف الإعلان (Pause)</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="note-input" value="${ad.salesNotes || ''}" placeholder="${canEditNotes ? 'أضف ملاحظة...' : 'مشاهد فقط'}" onchange="updateAdNote('${ad.id}', this.value)" ${!canEditNotes ? 'disabled' : ''}>
                </td>
                <td style="font-size:0.78rem; color: var(--text-muted);">${ad.updatedAt}</td>
            `;
            salesTableBody.appendChild(tr);

            const mCard = document.createElement('div');
            mCard.className = 'sales-mobile-card';
            mCard.innerHTML = `
                <div>
                    <h4>${ad.name}</h4>
                    <span class="meta-sub">${ad.campaign} | ${ad.salesRep}</span>
                </div>
                <div class="form-group">
                    <label>جودة الـ Leads:</label>
                    <select class="quality-select" onchange="updateAdQuality('${ad.id}', this.value)" ${!canEditQuality ? 'disabled' : ''}>
                        <option value="qualified" ${ad.quality === 'qualified' ? 'selected' : ''}>🟢 عملاء ممتازين (Qualified)</option>
                        <option value="mixed" ${ad.quality === 'mixed' ? 'selected' : ''}>🟡 عملاء متوسطين (Mixed)</option>
                        <option value="unqualified" ${ad.quality === 'unqualified' ? 'selected' : ''}>🔴 غير مهتمين / سيء</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>حالة الإعلان:</label>
                    <select class="status-select" onchange="updateAdStatus('${ad.id}', this.value)" ${!canEditQuality ? 'disabled' : ''}>
                        <option value="winning" ${ad.status === 'winning' ? 'selected' : ''}>🟢 شغال تمام (Scale)</option>
                        <option value="testing" ${ad.status === 'testing' ? 'selected' : ''}>🟡 قيد الاختبار (Testing)</option>
                        <option value="pause" ${ad.status === 'pause' ? 'selected' : ''}>🔴 أوقف الإعلان (Pause)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>ملاحظة للـ Media Buyer:</label>
                    <input type="text" class="note-input" value="${ad.salesNotes || ''}" placeholder="${canEditNotes ? 'أضف ملاحظة...' : 'مشاهد فقط'}" onchange="updateAdNote('${ad.id}', this.value)" ${!canEditNotes ? 'disabled' : ''}>
                </div>
            `;
            salesMobileCards.appendChild(mCard);
        });
    }

    function renderMediaBuyerTable(filteredAds) {
        if (!mediaBuyerTableBody) return;
        mediaBuyerTableBody.innerHTML = '';
        const canDelete = ROLES_CONFIG[currentRole].canDelete;
        const canEditStructure = ROLES_CONFIG[currentRole].canEditStructure;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="fa-solid fa-image" style="font-size: 1.3rem; color: var(--primary-color);"></i></td>
                <td><strong>${ad.name}</strong></td>
                <td>${ad.adset}</td>
                <td>${ad.campaign}</td>
                <td>${ad.salesRep}</td>
                <td>${getStatusBadgeHTML(ad.status)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editAdModal('${ad.id}')" ${!canEditStructure ? 'disabled' : ''}><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteAd('${ad.id}')" style="color:#ef4444;" ${!canDelete ? 'disabled' : ''}><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            mediaBuyerTableBody.appendChild(tr);
        });
    }

    function renderAll() {
        applyRolePermissions();
        updateSalesFilterOptions();
        updateMetrics();
        const filtered = getFilteredAds();
        renderLiveBoard(filtered);
        renderSalesView(filtered);
        renderMediaBuyerTable(filtered);
    }

    window.quickToggleStatus = function(id, newStatus) {
        if (!ROLES_CONFIG[currentRole].canEditStructure) return window.openRoleModal();
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.status = newStatus; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.updateAdStatus = function(id, newStatus) {
        if (!ROLES_CONFIG[currentRole].canEditQuality) return window.openRoleModal();
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.status = newStatus; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.updateAdQuality = function(id, newQuality) {
        if (!ROLES_CONFIG[currentRole].canEditQuality) return window.openRoleModal();
        const ad = adsState.find(a => a.id === id);
        if (ad) {
            ad.quality = newQuality;
            if (newQuality === 'unqualified') ad.status = 'pause';
            else if (newQuality === 'qualified') ad.status = 'winning';
            ad.updatedAt = new Date().toLocaleString('ar-EG');
            saveToCloud();
        }
    };

    window.updateAdNote = function(id, newNote) {
        if (!ROLES_CONFIG[currentRole].canEditNotes) return window.openRoleModal();
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.salesNotes = newNote; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.deleteAd = function(id) {
        if (!ROLES_CONFIG[currentRole].canDelete) return window.openRoleModal();
        if (confirm('هل أنت تأكد من رغبتك في حذف هذا الإعلان؟')) {
            adsState = adsState.filter(a => a.id !== id);
            saveToCloud();
        }
    };

    window.editAdModal = function(id) {
        if (!ROLES_CONFIG[currentRole].canEditStructure) return window.openRoleModal();
        const ad = adsState.find(a => a.id === id);
        if (ad) {
            adIdInput.value = ad.id;
            document.getElementById('ad-name').value = ad.name;
            document.getElementById('ad-campaign').value = ad.campaign;
            document.getElementById('ad-adset').value = ad.adset;
            document.getElementById('ad-sales').value = ad.salesRep;
            document.getElementById('ad-status').value = ad.status;
            document.getElementById('ad-notes').value = ad.salesNotes || '';
            modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات الإعلان`;
            adModal.classList.remove('hidden');
        }
    };

    if (addAdBtn) {
        addAdBtn.addEventListener('click', () => {
            if (!ROLES_CONFIG[currentRole].canAdd) return window.openRoleModal();
            adForm.reset();
            adIdInput.value = '';
            modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة إعلان جديد`;
            adModal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => adModal.classList.add('hidden'));
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => adModal.classList.add('hidden'));

    if (adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = adIdInput.value;
            const name = document.getElementById('ad-name').value.trim();
            const campaign = document.getElementById('ad-campaign').value.trim();
            const adset = document.getElementById('ad-adset').value.trim();
            const salesRep = document.getElementById('ad-sales').value.trim();
            const status = document.getElementById('ad-status').value;
            const salesNotes = document.getElementById('ad-notes').value.trim();

            if (id) {
                const ad = adsState.find(a => a.id === id);
                if (ad) {
                    ad.name = name; ad.campaign = campaign; ad.adset = adset;
                    ad.salesRep = salesRep; ad.status = status; ad.salesNotes = salesNotes;
                    ad.updatedAt = new Date().toLocaleString('ar-EG');
                }
            } else {
                const newAd = {
                    id: 'ad-' + Date.now(), name, campaign, adset, salesRep, status,
                    quality: 'mixed', salesNotes, updatedAt: new Date().toLocaleString('ar-EG')
                };
                adsState.unshift(newAd);
            }

            adModal.classList.add('hidden');
            saveToCloud();
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderAll);
    if (filterStatus) filterStatus.addEventListener('change', renderAll);
    if (filterSales) filterSales.addEventListener('change', renderAll);

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterStatus) filterStatus.value = 'all';
            if (filterSales) filterSales.value = 'all';
            renderAll();
        });
    }

    applyRolePermissions();
    renderAll();
    initCloudSync();
});
