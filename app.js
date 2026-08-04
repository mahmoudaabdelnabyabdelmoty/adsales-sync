/* ==========================================================================
   ADSALES SYNC ENTERPRISE - REAL MEDIA BUYER VS SALES WORKFLOW (app.js v13.0)
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

    function getTodayISODate() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function normalizeRole(role) {
        if (!role) return 'viewer';
        const r = String(role).toLowerCase().trim();
        if (r === 'media' || r === 'mediabuyer' || r === 'media_buyer' || r === 'mb' || r.includes('media')) return 'mediabuyer';
        if (r === 'sales' || r === 'sales_rep' || r === 'salesrep' || r.includes('sales')) return 'sales';
        if (r === 'admin' || r === 'manager' || r.includes('admin')) return 'admin';
        return 'viewer';
    }

    const ROLES_CONFIG = {
        viewer: { name: 'زائر (عرض فقط - Read Only)', icon: 'fa-eye', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: false, canEditNotes: false, canEditResults: false },
        sales: { name: 'مسؤول مبيعات (Sales Rep)', icon: 'fa-headset', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: true, canEditNotes: true, canEditResults: false },
        mediabuyer: { name: 'Media Buyer', icon: 'fa-chart-line', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: false, canEditNotes: false, canEditResults: true },
        admin: { name: 'المدير العام (Admin)', icon: 'fa-crown', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true, canEditResults: true }
    };
    ROLES_CONFIG.media = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.media_buyer = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.mb = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.sales_rep = ROLES_CONFIG.sales;

    const defaultUsers = [
        { id: 'u-1', name: 'المدير العام (Admin Desk)', username: 'admin', password: 'admin123', role: 'admin', active: true },
        { id: 'u-2', name: 'أحمد محمود (Media Buyer)', username: 'media', password: 'media123', role: 'mediabuyer', active: true },
        { id: 'u-3', name: 'سارة علي (Sales Rep)', username: 'sales', password: 'sales123', role: 'sales', active: true }
    ];

    if (!localStorage.getItem('adsales_registered_users')) {
        localStorage.setItem('adsales_registered_users', JSON.stringify(defaultUsers));
    }

    let loggedUser = JSON.parse(localStorage.getItem('adsales_logged_user')) || null;
    let currentRole = loggedUser ? normalizeRole(loggedUser.role) : 'viewer';

    const todayStr = getTodayISODate();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth()+1).padStart(2,'0')}-${String(yesterdayDate.getDate()).padStart(2,'0')}`;

    const defaultMetricsConfig = [
        { id: 'results', label: 'عدد الرسائل / النتائج', unit: '' },
        { id: 'cpr', label: 'تكلفة الرسالة', unit: 'ج.م' },
        { id: 'spend', label: 'إجمالي المصروف', unit: 'ج.م' }
    ];

    const initialAds = [
        {
            id: 'ad-101',
            name: 'Ad 01 - Fire Extinguisher Carousel',
            platform: 'meta',
            objective: 'رسائل واتساب مباشرة',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Business_Owners',
            salesRep: 'أحمد محمود',
            status: 'active',
            quality: 'qualified',
            salesNotes: 'إعلان ممتاز جداً، معظم المحادثات عملاء جادين بيطلبوا عروض أسعار للمصانع.',
            updatedAt: new Date(Date.now() - 3600000).toLocaleString('ar-EG'),
            metricsConfig: [
                { id: 'results', label: 'عدد الرسائل / النتائج', unit: 'محادثة' },
                { id: 'cpr', label: 'تكلفة الرسالة', unit: 'ج.م' },
                { id: 'spend', label: 'إجمالي المصروف', unit: 'ج.م' }
            ],
            dailyResults: {
                [todayStr]: { results: 15, cpr: 12.5, spend: 187.5 },
                [yesterdayStr]: { results: 18, cpr: 11.0, spend: 198.0 }
            }
        },
        {
            id: 'ad-102',
            name: 'Ad 02 - Safety Alarm Systems Video',
            platform: 'tiktok',
            objective: 'صفحة هبوط + زر واتساب',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Factory_Managers',
            salesRep: 'سارة علي',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: 'الرسائل كتير جداً بس كلهم بيسألوا عن شغل أو وظائف، مش عملاء لشراء النظام!',
            updatedAt: new Date(Date.now() - 7200000).toLocaleString('ar-EG'),
            metricsConfig: [
                { id: 'results', label: 'عدد الرسائل / النتائج', unit: 'رسالة' },
                { id: 'cpr', label: 'تكلفة الرسالة', unit: 'ج.م' },
                { id: 'spend', label: 'إجمالي المصروف', unit: 'ج.م' }
            ],
            dailyResults: {
                [todayStr]: { results: 24, cpr: 6.2, spend: 148.8 },
                [yesterdayStr]: { results: 30, cpr: 5.5, spend: 165.0 }
            }
        },
        {
            id: 'ad-103',
            name: 'Ad 03 - Emergency Smoke Detector Offer',
            platform: 'google',
            objective: 'مكالمات هاتفية مباشرة',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_RealEstate_Devs',
            salesRep: 'محمود حسن',
            status: 'active',
            quality: 'mixed',
            salesNotes: 'مستوى الرسائل متوسط، جاري متابعة 4 عملاء محتملين.',
            updatedAt: new Date(Date.now() - 1800000).toLocaleString('ar-EG'),
            metricsConfig: [
                { id: 'results', label: 'عدد المكالمات', unit: 'مكالمة' },
                { id: 'cpr', label: 'تكلفة المكالمة', unit: 'ج.م' },
                { id: 'spend', label: 'إجمالي المصروف', unit: 'ج.م' }
            ],
            dailyResults: {
                [todayStr]: { results: 8, cpr: 32.0, spend: 256.0 },
                [yesterdayStr]: { results: 10, cpr: 28.0, spend: 280.0 }
            }
        },
        {
            id: 'ad-104',
            name: 'Ad 04 - VIP Maintenance Package',
            platform: 'snapchat',
            objective: 'نموذج تسجيل بيانات (Lead Form)',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_Hotel_Managers',
            salesRep: 'أحمد محمود',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: 'الأسعار بالنسبة لهم غالية وبيقفلوا السكة فك الإعلان ده فاشل.',
            updatedAt: new Date(Date.now() - 5400000).toLocaleString('ar-EG'),
            metricsConfig: [
                { id: 'results', label: 'عدد النماذج (Leads)', unit: 'عميل' },
                { id: 'cpr', label: 'تكلفة الـ Lead', unit: 'ج.م' },
                { id: 'spend', label: 'إجمالي المصروف', unit: 'ج.م' }
            ],
            dailyResults: {
                [todayStr]: { results: 5, cpr: 45.0, spend: 225.0 },
                [yesterdayStr]: { results: 6, cpr: 40.0, spend: 240.0 }
            }
        }
    ];

    let adsState = JSON.parse(localStorage.getItem('adsales_sync_data')) || initialAds;

    // Ensure all ads have default metricsConfig and dailyResults
    adsState.forEach(ad => {
        if (!ad.metricsConfig || !Array.isArray(ad.metricsConfig) || ad.metricsConfig.length === 0) {
            ad.metricsConfig = JSON.parse(JSON.stringify(defaultMetricsConfig));
        }
        if (!ad.dailyResults || typeof ad.dailyResults !== 'object') {
            ad.dailyResults = {};
        }
    });

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
    const statResultsToday = document.getElementById('stat-results-today');

    const searchInput = document.getElementById('search-input');
    const filterPlatform = document.getElementById('filter-platform');
    const filterStatus = document.getElementById('filter-status');
    const filterSales = document.getElementById('filter-sales');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const resultsDatePicker = document.getElementById('results-date-picker');

    if (resultsDatePicker && !resultsDatePicker.value) {
        resultsDatePicker.value = todayStr;
    }

    const liveAdsGrid = document.getElementById('live-ads-grid');
    const salesTableBody = document.getElementById('sales-table-body');
    const salesMobileCards = document.getElementById('sales-mobile-cards');
    const mediaBuyerTableBody = document.getElementById('media-buyer-table-body');
    const resultsTableBody = document.getElementById('results-table-body');
    const resultsMobileCards = document.getElementById('results-mobile-cards');

    const adModal = document.getElementById('ad-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const adForm = document.getElementById('ad-form');
    const modalTitle = document.getElementById('modal-title');
    const adIdInput = document.getElementById('ad-id');
    const adSalesSelect = document.getElementById('ad-sales');
    const adPlatformSelect = document.getElementById('ad-platform');
    const adObjectiveInput = document.getElementById('ad-objective');

    const dailyResultModal = document.getElementById('daily-result-modal');
    const dailyResultForm = document.getElementById('daily-result-form');
    const entryAdIdInput = document.getElementById('entry-ad-id');
    const entryDateInput = document.getElementById('entry-date');
    const dynamicMetricsInputsContainer = document.getElementById('dynamic-metrics-inputs-container');

    const customMetricModal = document.getElementById('custom-metric-modal');
    const customMetricForm = document.getElementById('custom-metric-form');
    const metricAdIdInput = document.getElementById('metric-ad-id');
    const metricLabelInput = document.getElementById('metric-label');
    const metricUnitInput = document.getElementById('metric-unit');

    const historyModal = document.getElementById('history-modal');
    const historyModalTitle = document.getElementById('history-modal-title');
    const historyTableHeader = document.getElementById('history-table-header');
    const historyTableBody = document.getElementById('history-table-body');
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function getPlatformBadgeHTML(platform) {
        switch(platform) {
            case 'google': return '<span class="status-badge" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4);"><i class="fa-brands fa-google"></i> Google</span>';
            case 'tiktok': return '<span class="status-badge" style="background:rgba(236,72,153,0.15); color:#f472b6; border:1px solid rgba(236,72,153,0.4);"><i class="fa-brands fa-tiktok"></i> TikTok</span>';
            case 'snapchat': return '<span class="status-badge" style="background:rgba(234,179,8,0.15); color:#facc15; border:1px solid rgba(234,179,8,0.4);"><i class="fa-brands fa-snapchat"></i> Snapchat</span>';
            case 'linkedin': return '<span class="status-badge" style="background:rgba(2,132,199,0.15); color:#38bdf8; border:1px solid rgba(2,132,199,0.4);"><i class="fa-brands fa-linkedin"></i> LinkedIn</span>';
            case 'twitter': return '<span class="status-badge" style="background:rgba(148,163,184,0.15); color:#cbd5e1; border:1px solid rgba(148,163,184,0.4);"><i class="fa-brands fa-x-twitter"></i> X (Twitter)</span>';
            case 'meta': default: return '<span class="status-badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.4);"><i class="fa-brands fa-facebook"></i> Meta</span>';
        }
    }

    function populateAdSalesSelect(selectedVal) {
        if (!adSalesSelect) return;
        const registeredUsers = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;
        const salesUsers = registeredUsers.filter(u => u.active);

        adSalesSelect.innerHTML = '<option value="" disabled selected>-- اختر مسؤول المبيعات المتابع --</option>';
        salesUsers.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user.name;
            opt.textContent = user.name + ' (@' + user.username + ')';
            if (selectedVal && (user.name === selectedVal || user.username === selectedVal)) {
                opt.selected = true;
            }
            adSalesSelect.appendChild(opt);
        });

        if (selectedVal && !salesUsers.some(u => u.name === selectedVal)) {
            const opt = document.createElement('option');
            opt.value = selectedVal;
            opt.textContent = selectedVal;
            opt.selected = true;
            adSalesSelect.appendChild(opt);
        }
    }

    async function initCloudSync() {
        localStorage.setItem('adsales_blob_id', cloudBlobId);
        await fetchFromCloud();
        setInterval(fetchFromCloud, 3000);
    }

    async function fetchFromCloud() {
        if (!cloudBlobId) return;
        try {
            const res = await fetch(CLOUD_API_BASE + '/' + cloudBlobId);
            if (res.ok) {
                const cloudData = await res.json();
                
                let remoteAds = Array.isArray(cloudData) ? cloudData : (cloudData.ads || adsState);
                let remoteUsers = Array.isArray(cloudData) ? null : cloudData.users;

                if (Array.isArray(remoteAds) && JSON.stringify(remoteAds) !== JSON.stringify(adsState)) {
                    adsState = remoteAds;
                    adsState.forEach(ad => {
                        if (!ad.metricsConfig || !Array.isArray(ad.metricsConfig)) ad.metricsConfig = JSON.parse(JSON.stringify(defaultMetricsConfig));
                        if (!ad.dailyResults || typeof ad.dailyResults !== 'object') ad.dailyResults = {};
                    });
                    localStorage.setItem('adsales_sync_data', JSON.stringify(adsState));
                    renderAll();
                }

                if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
                    localStorage.setItem('adsales_registered_users', JSON.stringify(remoteUsers));
                    populateAdSalesSelect(adSalesSelect ? adSalesSelect.value : '');
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

            await fetch(CLOUD_API_BASE + '/' + cloudBlobId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(newPayload)
            });
        } catch (e) {}
    }

    function applyRolePermissions() {
        currentRole = normalizeRole(currentRole);
        const config = ROLES_CONFIG[currentRole] || ROLES_CONFIG.viewer;
        document.body.className = document.body.className.replace(/role-\w+/g, '');
        document.body.classList.add('role-' + currentRole);

        const liveBoardHeader = document.querySelector('#view-live-board .panel-header');
        if (liveBoardHeader) {
            if (currentRole === 'sales') {
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-headset"></i> متابعة الإعلانات وتوجيهات الحملات (خاص بالمبيعات)</h2><p>تابع حالة إعلاناتك وقم بتقييم جودة المحادثات وتدويـن ملاحظاتك للميديا باير مباشرة.</p>';
            } else if (currentRole === 'mediabuyer' || currentRole === 'admin') {
                liveBoardHeader.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; width: 100%;"><div><h2><i class="fa-solid fa-fire-flame-curved"></i> قرارات الـ Media Buyer الفورية</h2><p>عرض تفاعلي مباشر لاتخاذ قرارات إيقاف وتعديل الإعلانات بناءً على تنبيهات المبيعات الحية.</p></div><button class="btn btn-primary btn-md open-add-ad-modal-btn"><i class="fa-solid fa-plus-circle"></i> + إضافة إعلان جديد</button></div>';
            } else {
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-border-all"></i> اللوحة التفاعلية العامة</h2><p>عرض تفاعلي مباشر لحالة الإعلانات وتقييمات المبيعات عبر كافة المنصات.</p>';
            }
        }

        const adminMbElements = document.querySelectorAll('.admin-mb-only');

        if (currentRole === 'mediabuyer' || currentRole === 'admin') {
            adminMbElements.forEach(el => {
                el.style.removeProperty('display');
                el.style.setProperty('display', 'inline-flex', 'important');
                el.classList.remove('hidden');
            });
        } else {
            adminMbElements.forEach(el => {
                el.style.setProperty('display', 'none', 'important');
                el.classList.add('hidden');
            });

            const mbPanel = document.getElementById('view-media-buyer-view');
            if (mbPanel && mbPanel.classList.contains('active')) {
                const targetView = currentRole === 'sales' ? 'sales-view' : 'live-board';
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

                const targetBtn = document.querySelector('.nav-btn[data-view="' + targetView + '"]');
                const targetPanel = document.getElementById('view-' + targetView);
                if (targetBtn) targetBtn.classList.add('active');
                if (targetPanel) targetPanel.classList.add('active');
            }
        }

        if (loggedUser) {
            roleBadge.innerHTML = '<i class="fa-solid ' + config.icon + '"></i> <span id="role-text">' + loggedUser.name + ' (' + config.name + ')</span>';
            if (loginRoleBtn) loginRoleBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            roleBadge.innerHTML = '<i class="fa-solid ' + config.icon + '"></i> <span id="role-text">' + config.name + '</span>';
            if (loginRoleBtn) loginRoleBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    }

    // Global Event Delegation for Add Ad, Daily Entry, Custom Metric, & History Modals
    document.addEventListener('click', (e) => {
        const addAdBtn = e.target.closest('.open-add-ad-modal-btn');
        if (addAdBtn) {
            e.preventDefault();
            const config = ROLES_CONFIG[normalizeRole(currentRole)] || ROLES_CONFIG.viewer;
            if (!config.canAdd) {
                return window.openRoleModal();
            }
            if (adForm) adForm.reset();
            if (adIdInput) adIdInput.value = '';
            populateAdSalesSelect();
            if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> إضافة إعلان جديد';
            if (adModal) adModal.classList.remove('hidden');
            return;
        }

        const entryBtn = e.target.closest('.open-daily-entry-btn');
        if (entryBtn) {
            e.preventDefault();
            const config = ROLES_CONFIG[normalizeRole(currentRole)] || ROLES_CONFIG.viewer;
            if (!config.canEditResults) return window.openRoleModal();
            const adId = entryBtn.getAttribute('data-ad-id');
            const targetDate = resultsDatePicker ? (resultsDatePicker.value || todayStr) : todayStr;
            openDailyEntryModal(adId, targetDate);
            return;
        }

        const metricBtn = e.target.closest('.open-custom-metric-btn');
        if (metricBtn) {
            e.preventDefault();
            const config = ROLES_CONFIG[normalizeRole(currentRole)] || ROLES_CONFIG.viewer;
            if (!config.canEditResults) return window.openRoleModal();
            const adId = metricBtn.getAttribute('data-ad-id');
            openCustomMetricModal(adId);
            return;
        }

        const historyBtn = e.target.closest('.open-history-btn');
        if (historyBtn) {
            e.preventDefault();
            const adId = historyBtn.getAttribute('data-ad-id');
            openHistoryModal(adId);
            return;
        }
    });
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

    if (closeRoleModalBtn) closeRoleModalBtn.addEventListener('click', () => roleModal ? roleModal.classList.add('hidden') : null);
    if (cancelRoleModalBtn) cancelRoleModalBtn.addEventListener('click', () => roleModal ? roleModal.classList.add('hidden') : null);

    if (roleForm) {
        roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const uInput = loginUsernameInput.value.trim().toLowerCase();
            const pInput = loginPasswordInput.value.trim();

            const registeredUsers = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;
            const match = registeredUsers.find(u => u.username.toLowerCase() === uInput && u.password === pInput && u.active);

            if (!match) {
                alert('❌ اسم المستخدم أو كلمة المرور غير صحيحة!');
                return;
            }

            loggedUser = match;
            currentRole = normalizeRole(match.role);
            loggedUser.role = currentRole;
            localStorage.setItem('adsales_logged_user', JSON.stringify(loggedUser));

            roleForm.reset();
            roleModal.classList.add('hidden');
            applyRolePermissions();
            renderAll();

            alert('✅ أهلاً بك يا ' + match.name + '! تم تسجيل الدخول بنجاح بصلاحية (' + ROLES_CONFIG[currentRole].name + ').');
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
            const targetEl = document.getElementById('view-' + targetView);
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
        if (statWinning) statWinning.textContent = adsState.filter(a => a.status === 'active' || a.status === 'winning').length;
        if (statPause) statPause.textContent = adsState.filter(a => a.status === 'pause').length;
        if (statTesting) statTesting.textContent = adsState.filter(a => a.quality === 'unqualified' && a.status !== 'pause').length;

        const selDate = resultsDatePicker ? (resultsDatePicker.value || todayStr) : todayStr;
        let sumResults = 0;
        adsState.forEach(ad => {
            if (ad.dailyResults && ad.dailyResults[selDate] && ad.dailyResults[selDate].results) {
                sumResults += Number(ad.dailyResults[selDate].results) || 0;
            }
        });
        if (statResultsToday) statResultsToday.textContent = sumResults;
    }

    function getFilteredAds() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const platformVal = filterPlatform ? filterPlatform.value : 'all';
        const statusVal = filterStatus ? filterStatus.value : 'all';
        const salesVal = filterSales ? filterSales.value : 'all';

        return adsState.filter(ad => {
            const matchesQuery = ad.name.toLowerCase().includes(query) ||
                                 ad.campaign.toLowerCase().includes(query) ||
                                 ad.adset.toLowerCase().includes(query) ||
                                 ad.salesRep.toLowerCase().includes(query) ||
                                 (ad.objective || '').toLowerCase().includes(query) ||
                                 (ad.platform || '').toLowerCase().includes(query);
            
            const isAdActive = ad.status === 'active' || ad.status === 'winning';
            const matchesPlatform = (platformVal === 'all') || (ad.platform === platformVal);
            const matchesStatus = (statusVal === 'all') || 
                                  (statusVal === 'active' && isAdActive) || 
                                  (statusVal === 'pause' && ad.status === 'pause');
            const matchesSales = (salesVal === 'all') || (ad.salesRep === salesVal);

            return matchesQuery && matchesPlatform && matchesStatus && matchesSales;
        });
    }

    function getStatusBadgeHTML(status) {
        if (status === 'pause') {
            return '<span class="status-badge badge-pause"><i class="fa-solid fa-circle-xmark"></i> 🔴 متوقف</span>';
        }
        return '<span class="status-badge badge-winning"><i class="fa-solid fa-circle-check"></i> 🟢 شغال</span>';
    }

    function getQualityBadgeHTML(quality) {
        switch(quality) {
            case 'qualified': return '<span class="status-badge badge-winning" style="font-size:0.75rem;"><i class="fa-solid fa-star"></i> 🟢 عملاء ممتازين</span>';
            case 'unqualified': return '<span class="status-badge badge-pause" style="font-size:0.75rem;"><i class="fa-solid fa-circle-exclamation"></i> 🔴 عملاء غير مهتمين / سيء</span>';
            case 'mixed': default: return '<span class="status-badge badge-testing" style="font-size:0.75rem;"><i class="fa-solid fa-hourglass-half"></i> 🟡 متوسط / قيد المتابعة</span>';
        }
    }

    function renderLiveBoard(filteredAds) {
        if (!liveAdsGrid) return;
        liveAdsGrid.innerHTML = '';

        if (filteredAds.length === 0) {
            liveAdsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>لا توجد إعلانات مطابقة.</div>';
            return;
        }

        filteredAds.forEach(ad => {
            const card = document.createElement('div');
            const isPaused = ad.status === 'pause';
            const isBadQuality = ad.quality === 'unqualified';

            card.className = 'ad-card ' + (isPaused ? 'status-pause' : 'status-winning');

            let cardActionHTML = '';
            if (currentRole === 'mediabuyer' || currentRole === 'admin') {
                cardActionHTML = '<div class="ad-card-actions">' + 
                    (!isPaused ? 
                        '<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus(\'' + ad.id + '\', \'pause\')" style="color: var(--status-pause-text); border-color: var(--status-pause-border); background: rgba(239,68,68,0.12);"><i class="fa-solid fa-pause"></i> 🔴 أوقف الإعلان (Pause)</button>' : 
                        '<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus(\'' + ad.id + '\', \'active\')" style="color: var(--status-winning-text); border-color: var(--status-winning-border); background: rgba(16,185,129,0.12);"><i class="fa-solid fa-play"></i> 🟢 إعلان شغال (Active)</button>'
                    ) + 
                    '<button class="btn btn-secondary ad-action-btn" onclick="editAdModal(\'' + ad.id + '\')"><i class="fa-solid fa-pen-to-square"></i> تعديل</button></div>';
            } else if (currentRole === 'sales') {
                cardActionHTML = '<div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 12px; margin-top: 10px;">' +
                    '<label style="font-size:0.8rem; font-weight:800; color:var(--accent-blue); display:block; margin-bottom:6px;"><i class="fa-solid fa-headset"></i> حدد تقييمك لجودة المحادثات:</label>' +
                    '<select class="quality-select" onchange="updateAdQuality(\'' + ad.id + '\', this.value)" style="width:100%; font-size:0.85rem; padding:6px 10px; margin-bottom:8px;">' +
                    '<option value="qualified" ' + (ad.quality === 'qualified' ? 'selected' : '') + '>🟢 عملاء ممتازين (Qualified)</option>' +
                    '<option value="mixed" ' + (ad.quality === 'mixed' ? 'selected' : '') + '>🟡 عملاء متوسطين / متابعة</option>' +
                    '<option value="unqualified" ' + (ad.quality === 'unqualified' ? 'selected' : '') + '>🔴 غير مهتمين / سيء (طلب إيقاف)</option></select>' +
                    '<label style="font-size:0.78rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;"><i class="fa-solid fa-comment-dots"></i> ملاحظاتك للميديا باير:</label>' +
                    '<input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="أضف أي ملاحظة تهم الميديا باير..." onchange="updateAdNote(\'' + ad.id + '\', this.value)" style="width:100%; font-size:0.8rem; padding:6px 10px;"></div>';
            } else {
                cardActionHTML = '<div style="text-align:center; padding:6px; font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-lock"></i> كارت للعرض فقط (سجّل دخول للتقييم)</div>';
            }

            card.innerHTML = '<div class="ad-card-header"><div class="ad-card-top-bar"><div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">' +
                getPlatformBadgeHTML(ad.platform) +
                '<span class="campaign-tag"><i class="fa-solid fa-layer-group"></i> ' + ad.campaign + '</span></div>' +
                getStatusBadgeHTML(ad.status) + '</div><div class="ad-title-area"><h4>' + ad.name + '</h4>' +
                (ad.objective ? '<span style="font-size:0.8rem; color:var(--primary-color); display:block; margin-top:3px;"><i class="fa-solid fa-bullseye"></i> الهدف: ' + ad.objective + '</span>' : '') +
                '</div></div><div class="ad-meta-list"><div class="meta-item"><span class="meta-label">المجموعة الإعلانية:</span><span class="meta-val">' + ad.adset + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">مسؤول الـ Sales:</span><span class="meta-val"><i class="fa-solid fa-user-tag"></i> ' + ad.salesRep + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">تقييم الـ Sales للجودة:</span><span class="meta-val">' + getQualityBadgeHTML(ad.quality) + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">التحديث:</span><span class="meta-val" style="font-size:0.78rem;">' + ad.updatedAt + '</span></div></div>' +
                ((currentRole === 'mediabuyer' || currentRole === 'admin') && isBadQuality && !isPaused ? '<div style="background: rgba(239,68,68,0.18); border: 1px solid #ef4444; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; color: #fca5a5; font-size: 0.85rem; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> تنبيه: المبيعات تقيم هذا الإعلان بـ (غير مهتمين/سيء) وتطلب إيقافه!</div>' : '') +
                (currentRole !== 'sales' ? '<div class="sales-note-box"><strong><i class="fa-solid fa-comment-dots"></i> ملاحظات الـ Sales للميديا باير:</strong> ' + (ad.salesNotes ? ad.salesNotes : 'لا توجد ملاحظات مدونة بعد.') + '</div>' : '') +
                cardActionHTML;
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
            
            const qualityCellHTML = canEditQuality ? 
                '<select class="quality-select" onchange="updateAdQuality(\'' + ad.id + '\', this.value)">' +
                '<option value="qualified" ' + (ad.quality === 'qualified' ? 'selected' : '') + '>🟢 عملاء ممتازين (Qualified)</option>' +
                '<option value="mixed" ' + (ad.quality === 'mixed' ? 'selected' : '') + '>🟡 عملاء متوسطين / متابعة</option>' +
                '<option value="unqualified" ' + (ad.quality === 'unqualified' ? 'selected' : '') + '>🔴 غير مهتمين / سيء (طلب إيقاف)</option></select>' :
                getQualityBadgeHTML(ad.quality) + '<small style="display:block; color:var(--text-muted); font-size:0.75rem; margin-top:2px;"><i class="fa-solid fa-lock"></i> تقييم خاص بالمبيعات والمدير</small>';

            tr.innerHTML = '<td>' + getPlatformBadgeHTML(ad.platform) + '</td><td><strong>' + ad.name + '</strong>' +
                (ad.objective ? '<br><small style="color:var(--primary-color); font-size:0.75rem;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</small>' : '') +
                '</td><td>' + ad.campaign + '<br><small style="color:var(--text-muted);">' + ad.adset + '</small></td>' +
                '<td><i class="fa-solid fa-user-tag"></i> ' + ad.salesRep + '</td><td>' + qualityCellHTML + '</td><td>' + getStatusBadgeHTML(ad.status) + '</td>' +
                '<td><input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="' + (canEditNotes ? 'أضف ملاحظة للميديا باير...' : 'مشاهد فقط') + '" onchange="updateAdNote(\'' + ad.id + '\', this.value)" ' + (!canEditNotes ? 'disabled' : '') + '></td>' +
                '<td style="font-size:0.78rem; color: var(--text-muted);">' + ad.updatedAt + '</td>';
            salesTableBody.appendChild(tr);

            const mCard = document.createElement('div');
            mCard.className = 'sales-mobile-card';
            mCard.innerHTML = '<div><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;"><div>' +
                getPlatformBadgeHTML(ad.platform) + '<h4 style="display:inline-block; margin-right:6px;">' + ad.name + '</h4></div>' +
                getStatusBadgeHTML(ad.status) + '</div>' + (ad.objective ? '<span style="font-size:0.78rem; color:var(--primary-color); display:block; margin-bottom:4px;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</span>' : '') +
                '<span class="meta-sub">' + ad.campaign + ' | ' + ad.salesRep + '</span></div><div class="form-group" style="margin-top: 10px;"><label>تقييم جودة الـ Leads:</label>' + qualityCellHTML +
                '</div><div class="form-group"><label>ملاحظة للميديا باير:</label><input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="' + (canEditNotes ? 'أضف ملاحظة للميديا باير...' : 'مشاهد فقط') + '" onchange="updateAdNote(\'' + ad.id + '\', this.value)" ' + (!canEditNotes ? 'disabled' : '') + '></div>';
            salesMobileCards.appendChild(mCard);
        });
    }

    /* RENDER RESULTS & DAILY METRICS BOARD (NEW TAB 3) */
    function renderResultsView(filteredAds) {
        if (!resultsTableBody || !resultsMobileCards) return;
        resultsTableBody.innerHTML = '';
        resultsMobileCards.innerHTML = '';

        const selDate = resultsDatePicker ? (resultsDatePicker.value || todayStr) : todayStr;
        const canEditResults = ROLES_CONFIG[currentRole].canEditResults;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            const dayEntry = (ad.dailyResults && ad.dailyResults[selDate]) ? ad.dailyResults[selDate] : {};

            const resultsVal = dayEntry.results !== undefined ? dayEntry.results : 0;
            const cprVal = dayEntry.cpr !== undefined ? dayEntry.cpr : 0;
            const spendVal = dayEntry.spend !== undefined ? dayEntry.spend : 0;

            let customMetricsHTML = '';
            if (ad.metricsConfig && ad.metricsConfig.length > 3) {
                const customFields = ad.metricsConfig.slice(3);
                customMetricsHTML = customFields.map(m => {
                    const val = dayEntry[m.id] !== undefined ? dayEntry[m.id] : 0;
                    return '<span class="metric-pill" title="' + m.label + '">' + m.label + ': ' + val + ' ' + (m.unit || '') + '</span>';
                }).join(' ');
            } else {
                customMetricsHTML = '<small style="color:var(--text-muted); font-size:0.75rem;">لا توجد مؤشرات إضافية</small>';
            }

            let inlineEditHTML = '';
            if (canEditResults) {
                inlineEditHTML = '<div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">' +
                    '<button class="btn btn-primary btn-sm open-daily-entry-btn" data-ad-id="' + ad.id + '"><i class="fa-solid fa-pen"></i> أدخل/تحديث الرقم (' + selDate + ')</button>' +
                    '<button class="btn btn-secondary btn-sm open-custom-metric-btn" data-ad-id="' + ad.id + '" title="إضافة مؤشر مخصص كـ CPR أو Frequency"><i class="fa-solid fa-plus"></i> + مؤشر مخصص</button>' +
                    '<button class="btn btn-secondary btn-sm open-history-btn" data-ad-id="' + ad.id + '" title="سجل التواريخ والتقويم"><i class="fa-solid fa-clock-rotate-left"></i> سجل التواريخ</button>' +
                    '</div>';
            } else {
                inlineEditHTML = '<button class="btn btn-secondary btn-sm open-history-btn" data-ad-id="' + ad.id + '"><i class="fa-solid fa-eye"></i> عرض سجل التواريخ بالتقويم</button>';
            }

            tr.innerHTML = '<td>' + getPlatformBadgeHTML(ad.platform) + '</td>' +
                '<td><strong>' + ad.name + '</strong>' + (ad.objective ? '<br><small style="color:var(--primary-color); font-size:0.75rem;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</small>' : '') + '</td>' +
                '<td>' + ad.campaign + '<br><small style="color:var(--text-muted);">' + ad.adset + '</small></td>' +
                '<td><span class="date-badge"><i class="fa-solid fa-calendar-day"></i> ' + selDate + '</span></td>' +
                '<td><strong style="color:var(--status-winning-text); font-size:1.1rem;">' + resultsVal + '</strong></td>' +
                '<td><span style="font-weight:700;">' + cprVal + ' ج.م</span></td>' +
                '<td><span style="font-weight:700;">' + spendVal + ' ج.م</span></td>' +
                '<td>' + customMetricsHTML + '</td>' +
                '<td>' + inlineEditHTML + '</td>';
            resultsTableBody.appendChild(tr);

            const mCard = document.createElement('div');
            mCard.className = 'sales-mobile-card';
            mCard.innerHTML = '<div><div style="display:flex; justify-content:space-between; align-items:center;">' +
                getPlatformBadgeHTML(ad.platform) + '<span class="date-badge">' + selDate + '</span></div>' +
                '<h4 style="margin-top:6px;">' + ad.name + '</h4>' +
                '<span class="meta-sub">' + ad.campaign + ' | ' + ad.adset + '</span></div>' +
                '<div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; text-align:center;">' +
                '<div><small style="color:var(--text-muted); display:block;">النتائج</small><strong style="color:var(--status-winning-text); font-size:1.1rem;">' + resultsVal + '</strong></div>' +
                '<div><small style="color:var(--text-muted); display:block;">تكلفة الرسالة</small><strong>' + cprVal + ' ج.م</strong></div>' +
                '<div><small style="color:var(--text-muted); display:block;">المصروف</small><strong>' + spendVal + ' ج.م</strong></div>' +
                '</div>' +
                '<div style="margin-top:6px;">' + inlineEditHTML + '</div>';
            resultsMobileCards.appendChild(mCard);
        });
    }

    function renderMediaBuyerTable(filteredAds) {
        if (!mediaBuyerTableBody) return;
        mediaBuyerTableBody.innerHTML = '';
        const canDelete = ROLES_CONFIG[currentRole].canDelete;
        const canEditStructure = ROLES_CONFIG[currentRole].canEditStructure;

        filteredAds.forEach(ad => {
            const tr = document.createElement('tr');
            const isPaused = ad.status === 'pause';

            tr.innerHTML = '<td>' + getPlatformBadgeHTML(ad.platform) + '</td><td><strong>' + ad.name + '</strong>' +
                (ad.objective ? '<br><small style="color:var(--primary-color); font-size:0.75rem;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</small>' : '') +
                '</td><td>' + ad.adset + '</td><td>' + ad.campaign + '</td><td>' + ad.salesRep + '</td><td>' + getQualityBadgeHTML(ad.quality) + '</td><td>' + getStatusBadgeHTML(ad.status) + '</td>' +
                '<td>' + (!isPaused ? 
                    '<button class="btn btn-secondary btn-sm" onclick="quickToggleStatus(\'' + ad.id + '\', \'pause\')" style="color:#ef4444; border-color:rgba(239,68,68,0.4);" ' + (!canEditStructure ? 'disabled' : '') + '><i class="fa-solid fa-pause"></i> تعطيل الإعلان</button>' : 
                    '<button class="btn btn-secondary btn-sm" onclick="quickToggleStatus(\'' + ad.id + '\', \'active\')" style="color:#10b981; border-color:rgba(16,185,129,0.4);" ' + (!canEditStructure ? 'disabled' : '') + '><i class="fa-solid fa-play"></i> تشغيل الإعلان</button>'
                ) +
                '<button class="btn btn-secondary btn-sm" onclick="editAdModal(\'' + ad.id + '\')" ' + (!canEditStructure ? 'disabled' : '') + '><i class="fa-solid fa-pen"></i></button>' +
                '<button class="btn btn-secondary btn-sm" onclick="deleteAd(\'' + ad.id + '\')" style="color:#ef4444;" ' + (!canDelete ? 'disabled' : '') + '><i class="fa-solid fa-trash"></i></button></td>';
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
        renderResultsView(filtered);
        renderMediaBuyerTable(filtered);
    }

    window.openDailyEntryModal = function(adId, targetDate) {
        const ad = adsState.find(a => a.id === adId);
        if (!ad) return;
        entryAdIdInput.value = ad.id;
        entryDateInput.value = targetDate || todayStr;

        const dayData = (ad.dailyResults && ad.dailyResults[entryDateInput.value]) ? ad.dailyResults[entryDateInput.value] : {};
        dynamicMetricsInputsContainer.innerHTML = '';

        ad.metricsConfig.forEach(metric => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.style.marginBottom = '12px';

            const val = dayData[metric.id] !== undefined ? dayData[metric.id] : 0;
            div.innerHTML = '<label><i class="fa-solid fa-gauge"></i> ' + metric.label + ' ' + (metric.unit ? '(' + metric.unit + ')' : '') + '</label>' +
                '<input type="number" step="any" class="metric-input-field" data-metric-id="' + metric.id + '" value="' + val + '" placeholder="أدخل الرقم هنا...">';
            dynamicMetricsInputsContainer.appendChild(div);
        });

        dailyResultModal.classList.remove('hidden');
    };

    window.openCustomMetricModal = function(adId) {
        const ad = adsState.find(a => a.id === adId);
        if (!ad) return;
        metricAdIdInput.value = ad.id;
        metricLabelInput.value = '';
        metricUnitInput.value = '';
        customMetricModal.classList.remove('hidden');
    };

    window.openHistoryModal = function(adId) {
        const ad = adsState.find(a => a.id === adId);
        if (!ad) return;
        historyModalTitle.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> سجل نتائج الإعلان: ' + ad.name;
        
        let customHeadersHTML = '';
        if (ad.metricsConfig && ad.metricsConfig.length > 3) {
            customHeadersHTML = ad.metricsConfig.slice(3).map(m => '<th>' + m.label + '</th>').join('');
        }
        historyTableHeader.innerHTML = '<th>التاريخ (Date)</th><th>عدد الرسائل / Results</th><th>تكلفة الرسالة (CPR)</th><th>إجمالي المصروف</th>' + customHeadersHTML;

        historyTableBody.innerHTML = '';
        const dates = Object.keys(ad.dailyResults || {}).sort().reverse();

        if (dates.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:var(--text-muted);">لا يوجد سجل نتائج مسجل لهذا الإعلان بعد.</td></tr>';
        } else {
            dates.forEach(d => {
                const day = ad.dailyResults[d] || {};
                let customColsHTML = '';
                if (ad.metricsConfig && ad.metricsConfig.length > 3) {
                    customColsHTML = ad.metricsConfig.slice(3).map(m => '<td>' + (day[m.id] !== undefined ? day[m.id] : 0) + ' ' + (m.unit || '') + '</td>').join('');
                }
                const tr = document.createElement('tr');
                tr.innerHTML = '<td><span class="date-badge"><i class="fa-solid fa-calendar-day"></i> ' + d + '</span></td>' +
                    '<td><strong style="color:var(--status-winning-text);">' + (day.results || 0) + '</strong></td>' +
                    '<td>' + (day.cpr || 0) + ' ج.م</td>' +
                    '<td>' + (day.spend || 0) + ' ج.م</td>' +
                    customColsHTML;
                historyTableBody.appendChild(tr);
            });
        }

        historyModal.classList.remove('hidden');
    };

    if (dailyResultForm) {
        dailyResultForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adId = entryAdIdInput.value;
            const dateVal = entryDateInput.value;
            const ad = adsState.find(a => a.id === adId);
            if (!ad) return;

            if (!ad.dailyResults) ad.dailyResults = {};
            if (!ad.dailyResults[dateVal]) ad.dailyResults[dateVal] = {};

            const fields = dynamicMetricsInputsContainer.querySelectorAll('.metric-input-field');
            fields.forEach(field => {
                const metricId = field.getAttribute('data-metric-id');
                const val = Number(field.value) || 0;
                ad.dailyResults[dateVal][metricId] = val;
            });

            ad.updatedAt = new Date().toLocaleString('ar-EG');
            dailyResultModal.classList.add('hidden');
            saveToCloud();
            alert('✅ تم حفظ وتحديث نتائج تاريخ (' + dateVal + ') للإعلان بنجاح!');
        });
    }

    if (customMetricForm) {
        customMetricForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adId = metricAdIdInput.value;
            const label = metricLabelInput.value.trim();
            const unit = metricUnitInput.value.trim();
            const ad = adsState.find(a => a.id === adId);
            if (!ad) return;

            const metricId = 'm_' + Date.now();
            if (!ad.metricsConfig) ad.metricsConfig = JSON.parse(JSON.stringify(defaultMetricsConfig));
            ad.metricsConfig.push({ id: metricId, label, unit });

            customMetricModal.classList.add('hidden');
            saveToCloud();
            alert('✅ تم إضافة المؤشر المخصص (' + label + ') للإعلان بنجاح!');
        });
    }

    if (resultsDatePicker) {
        resultsDatePicker.addEventListener('change', renderAll);
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
        if (!ROLES_CONFIG[currentRole].canEditQuality) {
            alert('⚠️ تنبيه: تقييم جودة المحادثات خاص بمسؤولي المبيعات (Sales Rep) والمدير العام فقط!');
            renderAll();
            return;
        }
        const ad = adsState.find(a => a.id === id);
        if (ad) {
            ad.quality = newQuality;
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
            if (adPlatformSelect) adPlatformSelect.value = ad.platform || 'meta';
            if (adObjectiveInput) adObjectiveInput.value = ad.objective || '';
            document.getElementById('ad-campaign').value = ad.campaign;
            document.getElementById('ad-adset').value = ad.adset;
            populateAdSalesSelect(ad.salesRep);
            document.getElementById('ad-notes').value = ad.salesNotes || '';
            modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات الإعلان';
            adModal.classList.remove('hidden');
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => adModal ? adModal.classList.add('hidden') : null);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => adModal ? adModal.classList.add('hidden') : null);

    if (adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = adIdInput.value;
            const name = document.getElementById('ad-name').value.trim();
            const platform = adPlatformSelect ? adPlatformSelect.value : 'meta';
            const objective = adObjectiveInput ? adObjectiveInput.value.trim() : '';
            const campaign = document.getElementById('ad-campaign').value.trim();
            const adset = document.getElementById('ad-adset').value.trim();
            const salesRep = document.getElementById('ad-sales').value;
            const salesNotes = document.getElementById('ad-notes').value.trim();

            if (!salesRep) {
                alert('⚠️ يرجى اختيار مسؤول المبيعات المتابع للإعلان من القائمة.');
                return;
            }

            if (id) {
                const ad = adsState.find(a => a.id === id);
                if (ad) {
                    ad.name = name; ad.platform = platform; ad.objective = objective;
                    ad.campaign = campaign; ad.adset = adset;
                    ad.salesRep = salesRep; ad.salesNotes = salesNotes;
                    ad.updatedAt = new Date().toLocaleString('ar-EG');
                }
            } else {
                const newAd = {
                    id: 'ad-' + Date.now(),
                    name, platform, objective, campaign, adset, salesRep,
                    status: 'active',
                    quality: 'mixed',
                    salesNotes,
                    updatedAt: new Date().toLocaleString('ar-EG'),
                    metricsConfig: JSON.parse(JSON.stringify(defaultMetricsConfig)),
                    dailyResults: {
                        [todayStr]: { results: 0, cpr: 0, spend: 0 }
                    }
                };
                adsState.unshift(newAd);
            }

            adModal.classList.add('hidden');
            saveToCloud();
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderAll);
    if (filterPlatform) filterPlatform.addEventListener('change', renderAll);
    if (filterStatus) filterStatus.addEventListener('change', renderAll);
    if (filterSales) filterSales.addEventListener('change', renderAll);
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterPlatform) filterPlatform.value = 'all';
            if (filterStatus) filterStatus.value = 'all';
            if (filterSales) filterSales.value = 'all';
            if (resultsDatePicker) resultsDatePicker.value = todayStr;
            renderAll();
        });
    }

    applyRolePermissions();
    renderAll();
    initCloudSync();
});
