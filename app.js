/* ==========================================================================
   ADSALES SYNC ENTERPRISE - RBAC PERMISSIONS & DEPARTMENTS ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const SHARED_DEFAULT_BLOB = '019fcb65-44a7-725c-bb3f-39c8cc55649a';
    const CLOUD_API_BASE = 'https://jsonblob.com/api/jsonBlob';
    let cloudBlobId = getQueryParam('blob') || localStorage.getItem('adsales_blob_id') || SHARED_DEFAULT_BLOB;
    let cachedShortUrl = 'https://clck.ru/3V6AHT';

    const ROLES_CONFIG = {
        viewer: { name: 'زائر (عرض فقط - Read Only)', icon: 'fa-eye', pin: null, canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: false, canEditNotes: false },
        sales: { name: 'مسؤول مبيعات (Sales Rep)', icon: 'fa-headset', pin: '2222', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: true, canEditNotes: true },
        mediabuyer: { name: 'Media Buyer', icon: 'fa-chart-line', pin: '1111', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true },
        admin: { name: 'المدير العام (Admin)', icon: 'fa-crown', pin: '1234', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true }
    };

    let currentRole = localStorage.getItem('adsales_user_role') || 'viewer';

    const initialAds = [
        {
            id: 'ad-101',
            name: 'Ad 01 - Fire Extinguisher Carousel',
            dept: 'clinics',
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
            dept: 'realestate',
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
            dept: 'ecommerce',
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
            dept: 'general',
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
    const cloudStatusText = document.getElementById('cloud-status-text');

    const roleBadge = document.getElementById('role-badge');
    const roleText = document.getElementById('role-text');
    const loginRoleBtn = document.getElementById('login-role-btn');
    const readOnlyBanner = document.getElementById('read-only-banner');
    const bannerLoginLink = document.getElementById('banner-login-link');
    const roleModal = document.getElementById('role-modal');
    const closeRoleModalBtn = document.getElementById('close-role-modal-btn');
    const cancelRoleModalBtn = document.getElementById('cancel-role-modal-btn');
    const roleForm = document.getElementById('role-form');
    const roleSelect = document.getElementById('role-select');
    const rolePinInput = document.getElementById('role-pin');

    const statTotal = document.getElementById('stat-total-ads');
    const statWinning = document.getElementById('stat-winning-ads');
    const statPause = document.getElementById('stat-pause-ads');
    const statTesting = document.getElementById('stat-testing-ads');

    const searchInput = document.getElementById('search-input');
    const filterDept = document.getElementById('filter-dept');
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

    function getDeptLabel(deptKey) {
        switch(deptKey) {
            case 'realestate': return 'عقارات';
            case 'clinics': return 'عيادات وخدمات طبية';
            case 'ecommerce': return 'تجارة إلكترونية';
            case 'general': default: return 'مبيعات عامة';
        }
    }

    async function initCloudSync() {
        localStorage.setItem('adsales_blob_id', cloudBlobId);
        await fetchFromCloud();
        setInterval(fetchFromCloud, 4000);
    }

    async function fetchFromCloud() {
        if (!cloudBlobId) return;
        try {
            const res = await fetch(`${CLOUD_API_BASE}/${cloudBlobId}`);
            if (res.ok) {
                const cloudData = await res.json();
                if (Array.isArray(cloudData) && JSON.stringify(cloudData) !== JSON.stringify(adsState)) {
                    adsState = cloudData;
                    localStorage.setItem('adsales_sync_data', JSON.stringify(adsState));
                    renderAll();
                }
                updateCloudUIStatus(true);
            }
        } catch (e) {
            updateCloudUIStatus(false);
        }
    }

    async function saveToCloud() {
        localStorage.setItem('adsales_sync_data', JSON.stringify(adsState));
        renderAll();

        if (!cloudBlobId) return;
        try {
            await fetch(`${CLOUD_API_BASE}/${cloudBlobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(adsState)
            });
            updateCloudUIStatus(true);
        } catch (e) {
            updateCloudUIStatus(false);
        }
    }

    function updateCloudUIStatus(connected) {
        cloudStatusText.textContent = connected ? '🟢 متصل أونلاين' : '🟡 حفظ محلي';
    }

    function applyRolePermissions() {
        const config = ROLES_CONFIG[currentRole] || ROLES_CONFIG.viewer;
        document.body.className = document.body.className.replace(/role-\w+/g, '');
        document.body.classList.add(`role-${currentRole}`);

        roleBadge.innerHTML = `<i class="fa-solid ${config.icon}"></i> ${config.name}`;
        roleText.textContent = config.name;
        readOnlyBanner.style.display = (currentRole === 'viewer') ? 'flex' : 'none';
    }

    function openRoleModal() {
        roleSelect.value = currentRole;
        rolePinInput.value = '';
        roleModal.classList.remove('hidden');
    }

    loginRoleBtn.addEventListener('click', openRoleModal);
    roleBadge.addEventListener('click', openRoleModal);
    bannerLoginLink.addEventListener('click', (e) => { e.preventDefault(); openRoleModal(); });

    closeRoleModalBtn.addEventListener('click', () => roleModal.classList.add('hidden'));
    cancelRoleModalBtn.addEventListener('click', () => roleModal.classList.add('hidden'));

    roleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selected = roleSelect.value;
        const enteredPin = rolePinInput.value.trim();
        const config = ROLES_CONFIG[selected];

        if (selected === 'viewer') {
            currentRole = 'viewer';
            localStorage.setItem('adsales_user_role', currentRole);
            applyRolePermissions();
            renderAll();
            roleModal.classList.add('hidden');
            return;
        }

        if (config.pin && enteredPin !== config.pin) {
            alert(`❌ رمز الـ PIN غير صحيح لصلاحية "${config.name}". يرجى المحاولة مرة أخرى.`);
            return;
        }

        currentRole = selected;
        localStorage.setItem('adsales_user_role', currentRole);
        applyRolePermissions();
        renderAll();
        roleModal.classList.add('hidden');
        alert(`✅ تم تسجيل الدخول بنجاح بصلاحية "${config.name}".`);
    });

    shareLinkBtn.addEventListener('click', () => {
        const finalUrl = window.location.href;
        navigator.clipboard.writeText(finalUrl).then(() => {
            alert('✅ تم نسخ رابط AdSales Sync Enterprise الرسمي:

' + finalUrl);
        }).catch(() => {
            prompt('رابط AdSales Sync الرسمى:', finalUrl);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetView = btn.getAttribute('data-view');
            document.getElementById(`view-${targetView}`).classList.add('active');
        });
    });

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    });

    function updateSalesFilterOptions() {
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
        statTotal.textContent = adsState.length;
        statWinning.textContent = adsState.filter(a => a.status === 'winning').length;
        statPause.textContent = adsState.filter(a => a.status === 'pause').length;
        statTesting.textContent = adsState.filter(a => a.status === 'testing').length;
    }

    function getFilteredAds() {
        const query = searchInput.value.trim().toLowerCase();
        const deptVal = filterDept.value;
        const statusVal = filterStatus.value;
        const salesVal = filterSales.value;

        return adsState.filter(ad => {
            const matchesQuery = ad.name.toLowerCase().includes(query) ||
                                 ad.campaign.toLowerCase().includes(query) ||
                                 ad.adset.toLowerCase().includes(query) ||
                                 ad.salesRep.toLowerCase().includes(query);
            const matchesDept = (deptVal === 'all') || (ad.dept === deptVal);
            const matchesStatus = (statusVal === 'all') || (ad.status === statusVal);
            const matchesSales = (salesVal === 'all') || (ad.salesRep === salesVal);

            return matchesQuery && matchesDept && matchesStatus && matchesSales;
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
                        <div class="tags-wrapper">
                            <span class="dept-tag"><i class="fa-solid fa-building"></i> ${getDeptLabel(ad.dept)}</span>
                            <span class="campaign-tag"><i class="fa-solid fa-layer-group"></i> ${ad.campaign}</span>
                        </div>
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
        salesTableBody.innerHTML = '';
        salesMobileCards.innerHTML = '';
        const canEditQuality = ROLES_CONFIG[currentRole].canEditQuality;
        const canEditNotes = ROLES_CONFIG[currentRole].canEditNotes;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ad.name}</strong></td>
                <td><span class="dept-tag">${getDeptLabel(ad.dept)}</span></td>
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
                    <span class="meta-sub">${getDeptLabel(ad.dept)} | ${ad.campaign} | ${ad.salesRep}</span>
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
        mediaBuyerTableBody.innerHTML = '';
        const canDelete = ROLES_CONFIG[currentRole].canDelete;
        const canEditStructure = ROLES_CONFIG[currentRole].canEditStructure;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="fa-solid fa-image" style="font-size: 1.3rem; color: var(--primary-color);"></i></td>
                <td><strong>${ad.name}</strong></td>
                <td><span class="dept-tag">${getDeptLabel(ad.dept)}</span></td>
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
        if (!ROLES_CONFIG[currentRole].canEditStructure) return alert('🔒 تتطلب صلاحية Media Buyer أو Admin.');
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.status = newStatus; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.updateAdStatus = function(id, newStatus) {
        if (!ROLES_CONFIG[currentRole].canEditQuality) return alert('🔒 تتطلب صلاحية Sales أو Media Buyer أو Admin.');
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.status = newStatus; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.updateAdQuality = function(id, newQuality) {
        if (!ROLES_CONFIG[currentRole].canEditQuality) return alert('🔒 تتطلب صلاحية Sales أو Media Buyer أو Admin.');
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
        if (!ROLES_CONFIG[currentRole].canEditNotes) return alert('🔒 تتطلب صلاحية Sales أو Media Buyer أو Admin.');
        const ad = adsState.find(a => a.id === id);
        if (ad) { ad.salesNotes = newNote; ad.updatedAt = new Date().toLocaleString('ar-EG'); saveToCloud(); }
    };

    window.deleteAd = function(id) {
        if (!ROLES_CONFIG[currentRole].canDelete) return alert('🔒 متاح فقط لمدير النظام و Media Buyer.');
        if (confirm('هل أنت تأكد من رغبتك في حذف هذا الإعلان؟')) {
            adsState = adsState.filter(a => a.id !== id);
            saveToCloud();
        }
    };

    window.editAdModal = function(id) {
        if (!ROLES_CONFIG[currentRole].canEditStructure) return alert('🔒 متاح فقط لـ Media Buyer و Admin.');
        const ad = adsState.find(a => a.id === id);
        if (ad) {
            adIdInput.value = ad.id;
            document.getElementById('ad-name').value = ad.name;
            document.getElementById('ad-dept').value = ad.dept || 'general';
            document.getElementById('ad-campaign').value = ad.campaign;
            document.getElementById('ad-adset').value = ad.adset;
            document.getElementById('ad-sales').value = ad.salesRep;
            document.getElementById('ad-status').value = ad.status;
            document.getElementById('ad-notes').value = ad.salesNotes || '';
            modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات الإعلان`;
            adModal.classList.remove('hidden');
        }
    };

    addAdBtn.addEventListener('click', () => {
        if (!ROLES_CONFIG[currentRole].canAdd) return alert('🔒 متاح فقط لـ Media Buyer و Admin.');
        adForm.reset();
        adIdInput.value = '';
        modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة إعلان جديد`;
        adModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => adModal.classList.add('hidden'));
    cancelModalBtn.addEventListener('click', () => adModal.classList.add('hidden'));

    adForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = adIdInput.value;
        const name = document.getElementById('ad-name').value.trim();
        const dept = document.getElementById('ad-dept').value;
        const campaign = document.getElementById('ad-campaign').value.trim();
        const adset = document.getElementById('ad-adset').value.trim();
        const salesRep = document.getElementById('ad-sales').value.trim();
        const status = document.getElementById('ad-status').value;
        const salesNotes = document.getElementById('ad-notes').value.trim();

        if (id) {
            const ad = adsState.find(a => a.id === id);
            if (ad) {
                ad.name = name; ad.dept = dept; ad.campaign = campaign; ad.adset = adset;
                ad.salesRep = salesRep; ad.status = status; ad.salesNotes = salesNotes;
                ad.updatedAt = new Date().toLocaleString('ar-EG');
            }
        } else {
            const newAd = {
                id: 'ad-' + Date.now(), name, dept, campaign, adset, salesRep, status,
                quality: 'mixed', salesNotes, updatedAt: new Date().toLocaleString('ar-EG')
            };
            adsState.unshift(newAd);
        }

        adModal.classList.add('hidden');
        saveToCloud();
    });

    searchInput.addEventListener('input', renderAll);
    filterDept.addEventListener('change', renderAll);
    filterStatus.addEventListener('change', renderAll);
    filterSales.addEventListener('change', renderAll);

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = ''; filterDept.value = 'all'; filterStatus.value = 'all'; filterSales.value = 'all'; renderAll();
    });

    applyRolePermissions();
    renderAll();
    initCloudSync();
});
