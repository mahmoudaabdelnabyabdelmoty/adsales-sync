/* ==========================================================================
   ADSALES SYNC ENTERPRISE - REAL MEDIA BUYER VS SALES WORKFLOW (app.js)
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

    function normalizeRole(role) {
        if (!role) return 'viewer';
        const r = String(role).toLowerCase().trim();
        if (r === 'media' || r === 'mediabuyer' || r === 'media_buyer' || r === 'mb' || r.includes('media')) return 'mediabuyer';
        if (r === 'sales' || r === 'sales_rep' || r === 'salesrep' || r.includes('sales')) return 'sales';
        if (r === 'admin' || r === 'manager' || r.includes('admin')) return 'admin';
        return 'viewer';
    }

    const ROLES_CONFIG = {
        viewer: { name: '\u0632\u0627\u0626\u0631 (\u0639\u0631\u0636 \u0641\u0642\u0637 - Read Only)', icon: 'fa-eye', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: false, canEditNotes: false },
        sales: { name: '\u0645\u0633\u0624\u0648\u0644 \u0645\u0628\u064a\u0639\u0627\u062a (Sales Rep)', icon: 'fa-headset', canAdd: false, canDelete: false, canEditStructure: false, canEditQuality: true, canEditNotes: true },
        mediabuyer: { name: 'Media Buyer', icon: 'fa-chart-line', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: false, canEditNotes: false },
        admin: { name: '\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u0639\u0627\u0645 (Admin)', icon: 'fa-crown', canAdd: true, canDelete: true, canEditStructure: true, canEditQuality: true, canEditNotes: true }
    };
    ROLES_CONFIG.media = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.media_buyer = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.mb = ROLES_CONFIG.mediabuyer;
    ROLES_CONFIG.sales_rep = ROLES_CONFIG.sales;

    const defaultUsers = [
        { id: 'u-1', name: '\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u0639\u0627\u0645 (Admin Desk)', username: 'admin', password: 'admin123', role: 'admin', active: true },
        { id: 'u-2', name: '\u0623\u062d\u0645\u062f \u0645\u062d\u0645\u0648\u062f (Media Buyer)', username: 'media', password: 'media123', role: 'mediabuyer', active: true },
        { id: 'u-3', name: '\u0633\u0627\u0631\u0629 \u0639\u0644\u064a (Sales Rep)', username: 'sales', password: 'sales123', role: 'sales', active: true }
    ];

    if (!localStorage.getItem('adsales_registered_users')) {
        localStorage.setItem('adsales_registered_users', JSON.stringify(defaultUsers));
    }

    let loggedUser = JSON.parse(localStorage.getItem('adsales_logged_user')) || null;
    let currentRole = loggedUser ? normalizeRole(loggedUser.role) : 'viewer';

    const initialAds = [
        {
            id: 'ad-101',
            name: 'Ad 01 - Fire Extinguisher Carousel',
            platform: 'meta',
            objective: '\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u062a\u0633\u0627\u0628 \u0645\u0628\u0627\u0634\u0631\u0629',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Business_Owners',
            salesRep: '\u0623\u062d\u0645\u062f \u0645\u062d\u0645\u0648\u062f',
            status: 'active',
            quality: 'qualified',
            salesNotes: '\u0625\u0639\u0644\u0627\u0646 \u0645\u0645\u062a\u0627\u0632 \u062c\u062f\u0627\u064b\u060c \u0645\u0639\u0638\u0645 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0639\u0645\u0644\u0627\u0621 \u062c\u0627\u062f\u064a\u0646 \u0628\u064a\u0637\u0644\u0628\u0648\u0627 \u0639\u0631\u0648\u0636 \u0623\u0633\u0639\u0627\u0631 \u0644\u0644\u0645\u0635\u0627\u0646\u0639.',
            updatedAt: new Date(Date.now() - 3600000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-102',
            name: 'Ad 02 - Safety Alarm Systems Video',
            platform: 'tiktok',
            objective: '\u0635\u0641\u062d\u0629 \u0647\u0628\u0648\u0637 + \u0632\u0631 \u0648\u0627\u062a\u0633\u0627\u0628',
            campaign: 'Campaign_FireSafety_Cairo',
            adset: 'AdSet_Factory_Managers',
            salesRep: '\u0633\u0627\u0631\u0629 \u0639\u0644\u064a',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0643\u062a\u064a\u0631 \u062c\u062f\u0627\u064b \u0628\u0633 \u0643\u0644\u0647\u0645 \u0628\u064a\u0633\u0623\u0644\u0648\u0627 \u0639\u0646 \u0634\u063a\u0644 \u0623\u0648 \u0648\u0638\u0627\u0626\u0641\u060c \u0645\u0634 \u0639\u0645\u0644\u0627\u0621 \u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0646\u0638\u0627\u0645!',
            updatedAt: new Date(Date.now() - 7200000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-103',
            name: 'Ad 03 - Emergency Smoke Detector Offer',
            platform: 'google',
            objective: '\u0645\u0643\u0627\u0644\u0645\u0627\u062a \u0647\u0627\u062a\u0641\u064a\u0629 \u0645\u0628\u0627\u0634\u0631\u0629',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_RealEstate_Devs',
            salesRep: '\u0645\u062d\u0645\u0648\u062f \u062d\u0633\u0646',
            status: 'active',
            quality: 'mixed',
            salesNotes: '\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0645\u062a\u0648\u0633\u0637\u060c \u062c\u0627\u0631\u064a \u0645\u062a\u0627\u0628\u0639\u0629 4 \u0639\u0645\u0644\u0627\u0621 \u0645\u062d\u062a\u0645\u0644\u064a\u0646.',
            updatedAt: new Date(Date.now() - 1800000).toLocaleString('ar-EG')
        },
        {
            id: 'ad-104',
            name: 'Ad 04 - VIP Maintenance Package',
            platform: 'snapchat',
            objective: '\u0646\u0645\u0648\u0630\u062c \u062a\u0633\u062c\u064a\u0644 \u0628\u062a\u0627\u0646\u0627\u062a (Lead Form)',
            campaign: 'Campaign_Emergency_Offers',
            adset: 'AdSet_Hotel_Managers',
            salesRep: '\u0623\u062d\u0645\u062f \u0645\u062d\u0645\u0648\u062f',
            status: 'pause',
            quality: 'unqualified',
            salesNotes: '\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0647\u0645 \u063a\u0627\u0644\u064a\u0629 \u0648\u0628\u064a\u0642\u0641\u0644\u0648\u0627 \u0627\u0644\u0633\u0643\u0629 \u0641\u0643 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u062f\u0647 \u0641\u0627\u0634\u0644.',
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
    const filterPlatform = document.getElementById('filter-platform');
    const filterStatus = document.getElementById('filter-status');
    const filterSales = document.getElementById('filter-sales');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    const liveAdsGrid = document.getElementById('live-ads-grid');
    const salesTableBody = document.getElementById('sales-table-body');
    const salesMobileCards = document.getElementById('sales-mobile-cards');
    const mediaBuyerTableBody = document.getElementById('media-buyer-table-body');

    const adModal = document.getElementById('ad-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const adForm = document.getElementById('ad-form');
    const modalTitle = document.getElementById('modal-title');
    const adIdInput = document.getElementById('ad-id');
    const adSalesSelect = document.getElementById('ad-sales');
    const adPlatformSelect = document.getElementById('ad-platform');
    const adObjectiveInput = document.getElementById('ad-objective');

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

        adSalesSelect.innerHTML = '<option value="" disabled selected>-- \u0627\u062e\u062a\u0631 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u0628\u0639 --</option>';
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
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-headset"></i> \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0648\u062a\u0648\u062c\u064a\u0647\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a (\u062e\u0627\u0635 \u0628\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a)</h2><p>\u062a\u0627\u0628\u0639 \u062d\u0627\u0644\u0629 \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u0643 \u0648\u0642\u0645 \u0628\u062a\u0642\u064a\u064a\u0645 \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0648\u062a\u062f\u0648\u064a\u0640\u0646 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643 \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631 \u0645\u0628\u0627\u0634\u0631\u0629.</p>';
            } else if (currentRole === 'mediabuyer' || currentRole === 'admin') {
                liveBoardHeader.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; width: 100%;"><div><h2><i class="fa-solid fa-fire-flame-curved"></i> \u0642\u0631\u0627\u0631\u0627\u062a \u0627\u0644\u0640 Media Buyer \u0627\u0644\u0641\u0648\u0631\u064a\u0629</h2><p>\u0639\u0631\u0636 \u062a\u0641\u0627\u0639\u0644\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u0627\u062a\u062e\u0627\u0630 \u0642\u0631\u0627\u0631\u0627\u062a \u0625\u064a\u0642\u0627\u0641 \u0648\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u062d\u064a\u0629.</p></div><button class="btn btn-primary btn-md open-add-ad-modal-btn"><i class="fa-solid fa-plus-circle"></i> + \u0625\u0636\u0627\u0641\u0629 \u0625\u0639\u0644\u0627\u0646 \u062c\u062f\u064a\u062f</button></div>';
            } else {
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-border-all"></i> \u0627\u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u0641\u0627\u0639\u0644\u064a\u0629 \u0627\u0644\u0639\u0627\u0645\u0629</h2><p>\u0639\u0631\u0636 \u062a\u0641\u0627\u0639\u0644\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0648\u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0639\u0625\u0631 \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u0635\u0627\u062a.</p>';
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

    // Global Event Delegation for ALL Add Ad buttons (100% immune to innerHTML updates!)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-add-ad-modal-btn');
        if (btn) {
            e.preventDefault();
            const config = ROLES_CONFIG[normalizeRole(currentRole)] || ROLES_CONFIG.viewer;
            if (!config.canAdd) {
                return window.openRoleModal();
            }
            if (adForm) adForm.reset();
            if (adIdInput) adIdInput.value = '';
            populateAdSalesSelect();
            if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> \u0625\u0636\u0627\u0641\u0629 \u0625\u0639\u0644\u0627\u0646 \u062c\u062f\u064a\u062f';
            if (adModal) adModal.classList.remove('hidden');
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
            alert('\ud83d\udd12 \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c \u0648\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0648\u0636\u0639 \u0627\u0644\u0632\u0627\u0626\u0631 (Read-Only).');
        });
    }

    if (closeRoleModalBtn) closeRoleModalBtn.addEventListener('click', () => adModal ? adModal.classList.add('hidden') : null);
    if (cancelRoleModalBtn) cancelRoleModalBtn.addEventListener('click', () => adModal ? adModal.classList.add('hidden') : null);

    if (roleForm) {
        roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const uInput = loginUsernameInput.value.trim().toLowerCase();
            const pInput = loginPasswordInput.value.trim();

            const registeredUsers = JSON.parse(localStorage.getItem('adsales_registered_users')) || defaultUsers;
            const match = registeredUsers.find(u => u.username.toLowerCase() === uInput && u.password === pInput && u.active);

            if (!match) {
                alert('\u274c \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629!');
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

            alert('\u2705 \u0623\u0647\u0644\u0623\u064b \u0628\u0643 \u064a\u0627 ' + match.name + '! \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0646\u062c\u0627\u062d \u0628\u0635\u0644\u0627\u062d\u064a\u0629 (' + ROLES_CONFIG[currentRole].name + ').');
        });
    }

    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const finalUrl = window.location.href;
            navigator.clipboard.writeText(finalUrl).then(() => {
                alert('\u2705 \u062a\u0645 \u0646\u0633\u062e \u0631\u0627\u0628\u0637 AdSales Sync Enterprise \u0627\u0644\u0631\u0633\u0645\u064a:\n\n' + finalUrl);
            }).catch(() => {
                prompt('\u0631\u0627\u0628\u0637 AdSales Sync \u0627\u0644\u0631\u0633\u0645\u064a:', finalUrl);
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
        filterSales.innerHTML = '<option value="all">\u0627\u0644\u062c\u0645\u064a\u0639</option>';
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
            return '<span class="status-badge badge-pause"><i class="fa-solid fa-circle-xmark"></i> \ud83d\udd34 \u0645\u062a\u0648\u0642\u0641</span>';
        }
        return '<span class="status-badge badge-winning"><i class="fa-solid fa-circle-check"></i> \ud83d\udfe2 \u0634\u063a\u0627\u0644</span>';
    }

    function getQualityBadgeHTML(quality) {
        switch(quality) {
            case 'qualified': return '<span class="status-badge badge-winning" style="font-size:0.75rem;"><i class="fa-solid fa-star"></i> \ud83d\udfe2 \u0639\u0645\u0644\u0627\u0621 \u0645\u0645\u062a\u0627\u0632\u064a\u0646</span>';
            case 'unqualified': return '<span class="status-badge badge-pause" style="font-size:0.75rem;"><i class="fa-solid fa-circle-exclamation"></i> \ud83d\udd34 \u0639\u0645\u0644\u0627\u0621 \u063a\u064a\u0631 \u0645\u0647\u062a\u0645\u064a\u0646 / \u0633\u064a\u0621</span>';
            case 'mixed': default: return '<span class="status-badge badge-testing" style="font-size:0.75rem;"><i class="fa-solid fa-hourglass-half"></i> \ud83d\udfe1 \u0645\u062a\u0648\u0633\u0637 / \u0642\u064a\u062f \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629</span>';
        }
    }
    function renderLiveBoard(filteredAds) {
        if (!liveAdsGrid) return;
        liveAdsGrid.innerHTML = '';

        const liveBoardHeader = document.querySelector('#view-live-board .panel-header');
        if (liveBoardHeader) {
            if (currentRole === 'sales') {
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-headset"></i> \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0648\u062a\u0648\u062c\u064a\u0647\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a (\u062e\u0627\u0635 \u0628\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a)</h2><p>\u062a\u0627\u0628\u0639 \u062d\u0627\u0644\u0629 \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u0643 \u0648\u0642\u0645 \u0628\u062a\u0642\u064a\u064a\u0645 \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0648\u062a\u062f\u0648\u064a\u0640\u0646 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643 \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631 \u0645\u0628\u0627\u0634\u0631\u0629.</p>';
            } else if (currentRole === 'mediabuyer' || currentRole === 'admin') {
                liveBoardHeader.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; width: 100%;"><div><h2><i class="fa-solid fa-fire-flame-curved"></i> \u0642\u0631\u0627\u0631\u0627\u062a \u0627\u0644\u0640 Media Buyer \u0627\u0644\u0641\u0648\u0631\u064a\u0629</h2><p>\u0639\u0631\u0636 \u062a\u0641\u0627\u0639\u0644\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u0627\u062a\u062e\u0627\u0630 \u0642\u0631\u0627\u0631\u0627\u062a \u0625\u064a\u0642\u0627\u0641 \u0648\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u062d\u064a\u0629.</p></div><button class="btn btn-primary btn-md open-add-ad-modal-btn"><i class="fa-solid fa-plus-circle"></i> + \u0625\u0636\u0627\u0641\u0629 \u0625\u0639\u0644\u0627\u0646 \u062c\u062f\u064a\u062f</button></div>';
            } else {
                liveBoardHeader.innerHTML = '<h2><i class="fa-solid fa-border-all"></i> \u0627\u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u0641\u0627\u0639\u0644\u064a\u0629 \u0627\u0644\u0639\u0627\u0645\u0629</h2><p>\u0639\u0631\u0636 \u062a\u0641\u0627\u0639\u0644\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0648\u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0639\u0625\u0631 \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u0635\u0627\u062a.</p>';
            }
        }

        if (filteredAds.length === 0) {
            liveAdsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629.</div>';
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
                        '<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus(\'' + ad.id + '\', \'pause\')" style="color: var(--status-pause-text); border-color: var(--status-pause-border); background: rgba(239,68,68,0.12);"><i class="fa-solid fa-pause"></i> \ud83d\udd34 \u0623\u0648\u0642\u0641 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 (Pause)</button>' : 
                        '<button class="btn btn-secondary ad-action-btn" onclick="quickToggleStatus(\'' + ad.id + '\', \'active\')" style="color: var(--status-winning-text); border-color: var(--status-winning-border); background: rgba(16,185,129,0.12);"><i class="fa-solid fa-play"></i> \ud83d\udfe2 \u0625\u0639\u0644\u0627\u0646 \u0634\u063a\u0627\u0644 (Active)</button>'
                    ) + 
                    '<button class="btn btn-secondary ad-action-btn" onclick="editAdModal(\'' + ad.id + '\')"><i class="fa-solid fa-pen-to-square"></i> \u062a\u0639\u062f\u064a\u0644</button></div>';
            } else if (currentRole === 'sales') {
                cardActionHTML = '<div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 12px; margin-top: 10px;">' +
                    '<label style="font-size:0.8rem; font-weight:800; color:var(--accent-blue); display:block; margin-bottom:6px;"><i class="fa-solid fa-headset"></i> \u062d\u062f\u062f \u062a\u0642\u064a\u064a\u0645\u0643 \u0644\u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a:</label>' +
                    '<select class="quality-select" onchange="updateAdQuality(\'' + ad.id + '\', this.value)" style="width:100%; font-size:0.85rem; padding:6px 10px; margin-bottom:8px;">' +
                    '<option value="qualified" ' + (ad.quality === 'qualified' ? 'selected' : '') + '>\ud83d\udfe2 \u0639\u0645\u0644\u0627\u0621 \u0645\u0645\u062a\u0627\u0627\u0632\u064a\u0646 (Qualified)</option>' +
                    '<option value="mixed" ' + (ad.quality === 'mixed' ? 'selected' : '') + '>\ud83d\udfe1 \u0639\u0645\u0644\u0627\u0621 \u0645\u062a\u0648\u0633\u0637\u064a\u0646 / \u0645\u062a\u0627\u0628\u0639\u0629</option>' +
                    '<option value="unqualified" ' + (ad.quality === 'unqualified' ? 'selected' : '') + '>\ud83d\udd34 \u063a\u064a\u0631 \u0645\u0647\u062a\u0645\u064a\u0646 / \u0633\u064a\u0621 (\u0637\u0644\u0628 \u0625\u064a\u0642\u0627\u0641)</option></select>' +
                    '<label style="font-size:0.78rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;"><i class="fa-solid fa-comment-dots"></i> \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643 \u0644\u0644\u0645\u064a\u062f\u062a\u0627 \u0628\u0627\u064a\u0631:</label>' +
                    '<input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="\u0623\u0636\u0641 \u0623\u064a \u0645\u0644\u0627\u062d\u0638\u0629 \u062a\u0647\u0645 \u0627\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631..." onchange="updateAdNote(\'' + ad.id + '\', this.value)" style="width:100%; font-size:0.8rem; padding:6px 10px;"></div>';
            } else {
                cardActionHTML = '<div style="text-align:center; padding:6px; font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-lock"></i> \u0643\u0627\u0631\u062a \u0644\u0644\u0639\u0631\u0636 \u0641\u0642\u0637 (\u0633\u062c\u0651\u0644 \u062f\u062e\u0648\u0644 \u0644\u0644\u062a\u0642\u064a\u064a\u0645)</div>';
            }

            card.innerHTML = '<div class="ad-card-header"><div class="ad-card-top-bar"><div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">' +
                getPlatformBadgeHTML(ad.platform) +
                '<span class="campaign-tag"><i class="fa-solid fa-layer-group"></i> ' + ad.campaign + '</span></div>' +
                getStatusBadgeHTML(ad.status) + '</div><div class="ad-title-area"><h4>' + ad.name + '</h4>' +
                (ad.objective ? '<span style="font-size:0.8rem; color:var(--primary-color); display:block; margin-top:3px;"><i class="fa-solid fa-bullseye"></i> \u0627\u0644\u0647\u062f\u0641: ' + ad.objective + '</span>' : '') +
                '</div></div><div class="ad-meta-list"><div class="meta-item"><span class="meta-label">\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629:</span><span class="meta-val">' + ad.adset + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0640 Sales:</span><span class="meta-val"><i class="fa-solid fa-user-tag"></i> ' + ad.salesRep + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0640 Sales \u0644\u0644\u062c\u0648\u062f\u0629:</span><span class="meta-val">' + getQualityBadgeHTML(ad.quality) + '</span></div>' +
                '<div class="meta-item"><span class="meta-label">\u0627\u0644\u062a\u062d\u062f\u064a\u062b:</span><span class="meta-val" style="font-size:0.78rem;">' + ad.updatedAt + '</span></div></div>' +
                ((currentRole === 'mediabuyer' || currentRole === 'admin') && isBadQuality && !isPaused ? '<div style="background: rgba(239,68,68,0.18); border: 1px solid #ef4444; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; color: #fca5a5; font-size: 0.85rem; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> \u062a\u0646\u0628\u064a\u0647: \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u062a\u0642\u064a\u0645 \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0628\u0640 (\u063a\u064a\u0631 \u0645\u0647\u062a\u0645\u064a\u0646/\u0633\u064a\u0621) \u0648\u062a\u0637\u0644\u0628 \u0625\u064a\u0642\u0627\u0641\u0647!</div>' : '') +
                (currentRole !== 'sales' ? '<div class="sales-note-box"><strong><i class="fa-solid fa-comment-dots"></i> \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0640 Sales \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631:</strong> ' + (ad.salesNotes ? ad.salesNotes : '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0645\u062f\u0648\u0646\u0629 \u0628\u0639\u062f.') + '</div>' : '') +
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
                '<option value="qualified" ' + (ad.quality === 'qualified' ? 'selected' : '') + '>\ud83d\udfe2 \u0639\u0645\u0644\u0627\u0621 \u0645\u0645\u062a\u0627\u0632\u064a\u0646 (Qualified)</option>' +
                '<option value="mixed" ' + (ad.quality === 'mixed' ? 'selected' : '') + '>\ud83d\udfe1 \u0639\u0645\u0644\u0627\u0621 \u0645\u062a\u0648\u0633\u0637\u064a\u0646 / \u0645\u062a\u0627\u0628\u0639\u0629</option>' +
                '<option value="unqualified" ' + (ad.quality === 'unqualified' ? 'selected' : '') + '>\ud83d\udd34 \u063a\u064a\u0631 \u0645\u0647\u062a\u0645\u064a\u0646 / \u0633\u064a\u0621 (\u0637\u0644\u0628 \u0625\u064a\u0642\u0627\u0641)</option></select>' :
                getQualityBadgeHTML(ad.quality) + '<small style="display:block; color:var(--text-muted); font-size:0.75rem; margin-top:2px;"><i class="fa-solid fa-lock"></i> \u062a\u0642\u064a\u064a\u0645 \u062e\u0627\u0635 \u0628\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0648\u0627\u0644\u0645\u062f\u064a\u0631</small>';

            tr.innerHTML = '<td>' + getPlatformBadgeHTML(ad.platform) + '</td><td><strong>' + ad.name + '</strong>' +
                (ad.objective ? '<br><small style="color:var(--primary-color); font-size:0.75rem;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</small>' : '') +
                '</td><td>' + ad.campaign + '<br><small style="color:var(--text-muted);">' + ad.adset + '</small></td>' +
                '<td><i class="fa-solid fa-user-tag"></i> ' + ad.salesRep + '</td><td>' + qualityCellHTML + '</td><td>' + getStatusBadgeHTML(ad.status) + '</td>' +
                '<td><input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="' + (canEditNotes ? '\u0623\u0636\u0641 \u0645\u0644\u0627\u062d\u0638\u0629 \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631...' : '\u0645\u0634\u0627\u0647\u062f \u0641\u0642\u0637') + '" onchange="updateAdNote(\'' + ad.id + '\', this.value)" ' + (!canEditNotes ? 'disabled' : '') + '></td>' +
                '<td style="font-size:0.78rem; color: var(--text-muted);">' + ad.updatedAt + '</td>';
            salesTableBody.appendChild(tr);

            const mCard = document.createElement('div');
            mCard.className = 'sales-mobile-card';
            mCard.innerHTML = '<div><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;"><div>' +
                getPlatformBadgeHTML(ad.platform) + '<h4 style="display:inline-block; margin-right:6px;">' + ad.name + '</h4></div>' +
                getStatusBadgeHTML(ad.status) + '</div>' + (ad.objective ? '<span style="font-size:0.78rem; color:var(--primary-color); display:block; margin-bottom:4px;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</span>' : '') +
                '<span class="meta-sub">' + ad.campaign + ' | ' + ad.salesRep + '</span></div><div class="form-group" style="margin-top: 10px;"><label>\u062a\u0642\u064a\u064a\u0645 \u062c\u0648\u062f\u0629 \u0627\u0644\u0640 Leads:</label>' + qualityCellHTML +
                '</div><div class="form-group"><label>\u0645\u0644\u0627\u062d\u0638\u0629 \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631:</label><input type="text" class="note-input" value="' + (ad.salesNotes || '') + '" placeholder="' + (canEditNotes ? '\u0623\u0636\u0641 \u0645\u0644\u0627\u062d\u0638\u0629 \u0644\u0644\u0645\u064a\u062f\u064a\u0627 \u0628\u0627\u064a\u0631...' : '\u0645\u0634\u0627\u0647\u062f \u0641\u0642\u0637') + '" onchange="updateAdNote(\'' + ad.id + '\', this.value)" ' + (!canEditNotes ? 'disabled' : '') + '></div>';
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
            const isPaused = ad.status === 'pause';

            tr.innerHTML = '<td>' + getPlatformBadgeHTML(ad.platform) + '</td><td><strong>' + ad.name + '</strong>' +
                (ad.objective ? '<br><small style="color:var(--primary-color); font-size:0.75rem;"><i class="fa-solid fa-bullseye"></i> ' + ad.objective + '</small>' : '') +
                '</td><td>' + ad.adset + '</td><td>' + ad.campaign + '</td><td>' + ad.salesRep + '</td><td>' + getQualityBadgeHTML(ad.quality) + '</td><td>' + getStatusBadgeHTML(ad.status) + '</td>' +
                '<td>' + (!isPaused ? 
                    '<button class="btn btn-secondary btn-sm" onclick="quickToggleStatus(\'' + ad.id + '\', \'pause\')" style="color:#ef4444; border-color:rgba(239,68,68,0.4);" ' + (!canEditStructure ? 'disabled' : '') + '><i class="fa-solid fa-pause"></i> \u062a\u0639\u0637\u064a\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646</button>' : 
                    '<button class="btn btn-secondary btn-sm" onclick="quickToggleStatus(\'' + ad.id + '\', \'active\')" style="color:#10b981; border-color:rgba(16,185,129,0.4);" ' + (!canEditStructure ? 'disabled' : '') + '><i class="fa-solid fa-play"></i> \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646</button>'
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
        if (!ROLES_CONFIG[currentRole].canEditQuality) {
            alert('\u26a0\ufe0f \u062a\u0646\u0628\u064a\u0647: \u062a\u0642\u064a\u064a\u0645 \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u062e\u0627\u0635 \u0628\u0645\u0633\u0624\u0648\u0644\u064a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a (Sales Rep) \u0648\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u0639\u0627\u0645 \u0641\u0642\u0637!');
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
        if (confirm('\u0647\u0644 \u0623\u0646\u062a \u062a\u0623\u064a\u064f\u062f \u0645\u0646 \u0631\u063a\u0628\u062a\u0643 \u0641\u064a \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\uff1f')) {
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
            modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> \u062a\u0639\u062f\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0625\u0639\u0644\u0627\u0646';
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
                alert('\u26a0\ufe0f \u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u0628\u0639 \u0644\u0644\u0625\u0639\u0644\u0627\u0646 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629.');
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
                    updatedAt: new Date().toLocaleString('ar-EG')
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
            renderAll();
        });
    }

    applyRolePermissions();
    renderAll();
    initCloudSync();
});
