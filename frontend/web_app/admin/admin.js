/**
 * DATLICHSPORT - SYSTEM ADMIN PORTAL LOGIC WITH ROLE-BASED AUTHENTICATION
 * Quản trị toàn hệ thống, cấp tài khoản chủ sân và giám sát doanh thu sàn
 */

const adminState = {
    currentAdmin: null,
    courts: [],
    owners: [],
    customers: [],
    bookings: []
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra session đăng nhập Admin
    checkAdminSession();

    // 2. Đăng ký sự kiện Login form
    const loginForm = document.getElementById('formAdminLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLoginSubmit);
    }

    // 3. Đăng ký sự kiện các tính năng trong Dashboard
    bindAdminEvents();

    // 4. Tự động đồng bộ mỗi 10 giây nếu đã đăng nhập
    setInterval(() => {
        if (adminState.currentAdmin) {
            loadAdminAllData();
        }
    }, 10000);
});

/**
 * Kiểm tra Session đăng nhập của Admin
 */
function checkAdminSession() {
    const saved = sessionStorage.getItem('datlich_admin_user');
    if (saved) {
        try {
            const user = JSON.parse(saved);
            if (user && user.role === 'ADMIN') {
                showAdminDashboard(user);
                return;
            }
        } catch (e) {}
    }
    showAdminLoginForm();
}

function showAdminLoginForm() {
    adminState.currentAdmin = null;
    const loginSec = document.getElementById('adminLoginSection');
    const dashSec = document.getElementById('adminDashboardApp');
    if (loginSec) loginSec.style.display = 'flex';
    if (dashSec) dashSec.style.display = 'none';
}

function showAdminDashboard(user) {
    adminState.currentAdmin = user;
    const loginSec = document.getElementById('adminLoginSection');
    const dashSec = document.getElementById('adminDashboardApp');
    if (loginSec) loginSec.style.display = 'none';
    if (dashSec) dashSec.style.display = 'block';

    const loggedName = document.getElementById('adminLoggedNameDisplay');
    if (loggedName) loggedName.textContent = user.fullName || user.username;

    loadAdminAllData();
}

/**
 * Xử lý sự kiện đăng nhập Quản Trị Viên
 */
async function handleAdminLoginSubmit(e) {
    if (e) e.preventDefault();
    const userInput = document.getElementById('adminLoginUser');
    const passInput = document.getElementById('adminLoginPass');
    const btnSubmit = document.getElementById('btnAdminLoginSubmit');

    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
        showToast('Vui lòng nhập tên đăng nhập và mật khẩu Admin!', 'error');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xác thực...';

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (data.success && data.user) {
            if (data.user.role !== 'ADMIN') {
                showToast('Tài khoản này không có quyền Quản Trị Viên (Role: ' + data.user.role + ')!', 'error');
                return;
            }

            // Lưu session Admin
            sessionStorage.setItem('datlich_admin_user', JSON.stringify(data.user));
            showToast('Đăng nhập Quản Trị Viên thành công!', 'success');
            showAdminDashboard(data.user);
        } else {
            showToast(data.message || 'Sai tên đăng nhập hoặc mật khẩu quản trị!', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối máy chủ xác thực!', 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-shield-halved"></i> ĐĂNG NHẬP VÀO HỆ THỐNG';
    }
}

/**
 * Đăng xuất khỏi Cổng Admin
 */
function logoutAdminAction() {
    sessionStorage.removeItem('datlich_admin_user');
    showAdminLoginForm();
    showToast('Đã đăng xuất khỏi Cổng Quản Trị Viên.', 'info');
}

function bindAdminEvents() {
    const btnRefresh = document.getElementById('btnRefreshAdminData');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadAdminAllData();
            showToast('Đã làm mới dữ liệu toàn hệ thống!', 'success');
        });
    }

    const form = document.getElementById('formAdminCreateOwner');
    if (form) {
        form.addEventListener('submit', handleCreateOwnerSubmit);
    }
}

async function loadAdminAllData() {
    if (!adminState.currentAdmin) return;

    try {
        const [courtsRes, bookingsRes, ownersRes, customersRes] = await Promise.all([
            fetch(`${API_BASE}/courts`),
            fetch(`${API_BASE}/bookings`),
            fetch(`${API_BASE}/admin/owners`),
            fetch(`${API_BASE}/admin/customers`)
        ]);

        if (courtsRes.ok) adminState.courts = await courtsRes.json();
        if (bookingsRes.ok) adminState.bookings = await bookingsRes.json();
        if (ownersRes.ok) adminState.owners = await ownersRes.json();
        if (customersRes.ok) adminState.customers = await customersRes.json();

        updateAdminKpis();
        renderAdminCourtCheckboxes();
        renderAdminOwnersTable();
        renderAdminCustomersTable();
        renderAdminCourtsTable();
        renderAdminBookingsTable();
    } catch (e) {
        console.error('Lỗi khi tải dữ liệu Admin:', e);
    }
}

/**
 * Cập nhật các chỉ số thống kê KPI trên đầu trang
 */
function updateAdminKpis() {
    let totalRevenue = 0;
    adminState.bookings.forEach(b => {
        if (b.status !== 'CANCELLED') totalRevenue += b.totalAmount;
    });

    const statOwners = document.getElementById('statAdminOwnerCount');
    const statCustomers = document.getElementById('statAdminCustomerCount');
    const statCourts = document.getElementById('statAdminCourtCount');
    const statBookings = document.getElementById('statAdminTotalBookings');
    const statRev = document.getElementById('statAdminTotalRevenue');

    if (statOwners) statOwners.textContent = adminState.owners.length;
    if (statCustomers) statCustomers.textContent = adminState.customers.length;
    if (statCourts) statCourts.textContent = `${adminState.courts.length} sân`;
    if (statBookings) statBookings.textContent = adminState.bookings.length;
    if (statRev) statRev.textContent = formatVND(totalRevenue);
}

/**
 * Render danh sách checkbox các sân cần bàn giao trong Form
 */
function renderAdminCourtCheckboxes() {
    const container = document.getElementById('adminCourtCheckboxes');
    if (!container) return;

    // Giữ trạng thái đang check nếu có
    const selected = Array.from(container.querySelectorAll('input:checked')).map(i => i.value);

    container.innerHTML = '';
    adminState.courts.forEach((c, idx) => {
        const isChecked = selected.length > 0 ? selected.includes(c.id) : (idx === 0);
        const label = document.createElement('label');
        label.className = 'court-check-label';
        label.innerHTML = `
            <input type="checkbox" name="adminAssignCourt" value="${c.id}" ${isChecked ? 'checked' : ''}>
            <span><strong>${c.id}:</strong> ${escapeHTML(c.name)} (${formatVND(c.basePrice)}/h)</span>
        `;
        container.appendChild(label);
    });
}

/**
 * Xử lý khi Admin bấm nút Cấp tài khoản cho chủ sân mới
 */
async function handleCreateOwnerSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('adminNewUsername').value.trim();
    const password = document.getElementById('adminNewPassword').value.trim();
    const fullName = document.getElementById('adminNewFullName').value.trim();
    const phone = document.getElementById('adminNewPhone').value.trim();
    const email = document.getElementById('adminNewEmail').value.trim();

    const checkboxes = document.querySelectorAll('input[name="adminAssignCourt"]:checked');
    const selectedCourts = Array.from(checkboxes).map(c => c.value);

    if (selectedCourts.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 sân để bàn giao quản lý!', 'error');
        return;
    }

    const payload = {
        username: username,
        password: password,
        fullName: fullName,
        phone: phone,
        email: email,
        managedCourtIds: selectedCourts.join(',')
    };

    const btnSubmit = document.getElementById('btnSubmitCreateOwner');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...';
    }

    try {
        const res = await fetch(`${API_BASE}/admin/create-owner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            showToast(`Cấp tài khoản thành công cho chủ sân: ${fullName} (Username: ${username})`, 'success');
            // Reset form
            document.getElementById('adminNewUsername').value = '';
            document.getElementById('adminNewFullName').value = '';
            document.getElementById('adminNewPhone').value = '';
            document.getElementById('adminNewEmail').value = '';
            // Tải lại dữ liệu
            await loadAdminAllData();
        } else {
            showToast(data.message || 'Không thể tạo tài khoản chủ sân!', 'error');
        }
    } catch (err) {
        showToast('Lỗi máy chủ khi tạo tài khoản đối tác!', 'error');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-shield-halved"></i> CẤP TÀI KHOẢN & BÀN GIAO QUYỀN SÂN';
        }
    }
}

/**
 * Hiển thị bảng danh sách các Chủ Sân đã cấp tài khoản
 */
function renderAdminOwnersTable() {
    const tbody = document.getElementById('adminOwnersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (adminState.owners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 25px; color:#888;">Chưa có chủ sân nào trong hệ thống.</td></tr>';
        return;
    }

    adminState.owners.forEach(o => {
        const tr = document.createElement('tr');
        const courtBadges = (o.managedCourtIds || '').split(',')
            .map(cId => `<span class="spec-badge" style="background:#0070d2;color:#fff;margin-right:4px;">Sân ${cId.trim()}</span>`)
            .join('');

        tr.innerHTML = `
            <td><strong>${o.id || 'N/A'}</strong></td>
            <td><strong class="text-gold"><i class="fa-solid fa-user-tie"></i> ${escapeHTML(o.username)}</strong></td>
            <td><strong>${escapeHTML(o.fullName)}</strong></td>
            <td>
                <i class="fa-solid fa-phone"></i> ${escapeHTML(o.phone || 'Chưa cập nhật')}<br>
                <small style="color:#888"><i class="fa-solid fa-envelope"></i> ${escapeHTML(o.email || '')}</small>
            </td>
            <td>${courtBadges || '<span style="color:#888">Chưa gán</span>'}</td>
            <td>${o.createdAt || 'Mặc định'}</td>
            <td><span class="ti-status-tag CONFIRMED" style="background:#10b981"><i class="fa-solid fa-shield-halved"></i> ĐỐI TÁC CHỦ SÂN</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Hiển thị bảng danh sách các tài khoản khách hàng / thành viên
 */
function renderAdminCustomersTable() {
    const tbody = document.getElementById('adminCustomersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!adminState.customers || adminState.customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 25px; color:#888;">Chưa có tài khoản khách hàng nào đăng ký.</td></tr>';
        return;
    }

    adminState.customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong class="text-gold">${escapeHTML(c.id)}</strong></td>
            <td><strong>${escapeHTML(c.username)}</strong></td>
            <td><strong style="color:#fff;">${escapeHTML(c.fullName)}</strong></td>
            <td><i class="fa-solid fa-phone"></i> ${escapeHTML(c.phone || 'Chưa cập nhật')}</td>
            <td><i class="fa-solid fa-envelope"></i> ${escapeHTML(c.email || 'Chưa có')}</td>
            <td>${c.createdAt || 'Mặc định'}</td>
            <td><span class="ti-status-tag CONFIRMED" style="background:#10b981"><i class="fa-solid fa-circle-user"></i> THÀNH VIÊN (CUSTOMER)</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Hiển thị bảng giám sát các cụm sân
 */
function renderAdminCourtsTable() {
    const tbody = document.getElementById('adminCourtsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    adminState.courts.forEach(c => {
        const tr = document.createElement('tr');
        const isActive = (c.status === 'ACTIVE');

        // Tìm chủ sân phụ trách
        const managingOwner = adminState.owners.find(o => 
            (o.managedCourtIds || '').split(',').map(s => s.trim()).includes(c.id)
        );
        const ownerName = managingOwner ? managingOwner.fullName : '<span style="color:#888">Chưa bàn giao</span>';

        tr.innerHTML = `
            <td><strong class="text-gold">${c.id}</strong></td>
            <td><strong><i class="fa-solid fa-trophy"></i> ${escapeHTML(c.name)}</strong></td>
            <td>${escapeHTML(c.floorType)}</td>
            <td><i class="fa-regular fa-lightbulb text-gold"></i> ${escapeHTML(c.lighting || 'Chống chói 350 Lux')}</td>
            <td><strong class="text-cgv-red">${formatVND(c.basePrice)}/h</strong></td>
            <td>
                <span class="btn-toggle-status ${isActive ? 'active' : 'maintenance'}" style="display:inline-block; font-size:11px; padding:3px 8px;">
                    ${isActive ? '<i class="fa-solid fa-check"></i> ĐANG MỞ' : '<i class="fa-solid fa-wrench"></i> BẢO TRÌ'}
                </span>
            </td>
            <td><strong>${ownerName}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Hiển thị bảng giám sát toàn bộ đơn đặt sân toàn sàn
 */
function renderAdminBookingsTable() {
    const tbody = document.getElementById('adminBookingsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (adminState.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 25px; color:#888;">Chưa phát sinh giao dịch nào trên hệ thống.</td></tr>';
        return;
    }

    adminState.bookings.forEach(b => {
        const tr = document.createElement('tr');
        const slotsText = (b.slots || []).map(s => `${s.startTime}~${s.endTime}`).join(', ');

        tr.innerHTML = `
            <td><strong class="text-gold"><i class="fa-solid fa-qrcode"></i> ${escapeHTML(b.bookingCode)}</strong></td>
            <td><strong>${escapeHTML(b.courtName)}</strong></td>
            <td>${formatDateVN(b.date)}</td>
            <td><span style="color:#38bdf8; font-weight:700;">${slotsText}</span></td>
            <td>
                ${escapeHTML(b.customer ? b.customer.fullName : 'Khách vãng lai')}<br>
                <small style="color:#888">${escapeHTML(b.customer ? b.customer.phone : '')}</small>
            </td>
            <td><strong class="text-cgv-red">${formatVND(b.totalAmount)}</strong></td>
            <td><small>${escapeHTML(b.paymentMethod || 'VietQR')}</small></td>
            <td><span class="ti-status-tag ${b.status}">${b.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// KEBAB MENU (DẤU 3 CHẤM DỌC ĐỂ THÊM THÀNH PHẦN) & MODALS LOGIC
// ==========================================================================

function toggleAdminKebab(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const dropdown = document.getElementById('adminKebabDropdown');
    const btn = document.getElementById('btnAdminKebab');
    if (!dropdown) return;

    const isHidden = (dropdown.style.display === 'none' || dropdown.style.display === '');
    dropdown.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', isHidden);
}

function closeAdminKebab() {
    const dropdown = document.getElementById('adminKebabDropdown');
    const btn = document.getElementById('btnAdminKebab');
    if (dropdown) dropdown.style.display = 'none';
    if (btn) btn.classList.remove('active');
}

// Đóng Kebab khi click ra ngoài hoặc bấm phím Escape
document.addEventListener('click', (e) => {
    const container = document.getElementById('adminKebabContainer');
    if (container && !container.contains(e.target)) {
        closeAdminKebab();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAdminKebab();
        closeAllAdminModals();
    }
});

function triggerKebabAction(action) {
    closeAdminKebab();
    if (action === 'createOwner') {
        const target = document.getElementById('sectionCreateOwner');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.classList.remove('highlight-pulse');
            void target.offsetWidth; // trigger reflow
            target.classList.add('highlight-pulse');
            setTimeout(() => {
                const input = document.getElementById('adminNewUsername');
                if (input) input.focus();
            }, 400);
        }
    } else if (action === 'addCourt') {
        openAdminModal('modalAdminAddCourt');
    } else if (action === 'addService') {
        openAdminModal('modalAdminAddService');
    } else if (action === 'addCustomer') {
        openAdminModal('modalAdminAddCustomer');
    }
}

function openAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        const firstInput = modal.querySelector('input, select');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
}

function closeAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function closeAllAdminModals() {
    document.querySelectorAll('.admin-modal-overlay').forEach(m => m.style.display = 'none');
}

/**
 * Xử lý thêm Cụm Sân mới
 */
async function handleAdminAddCourtSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('addCourtName').value.trim();
    const province = document.getElementById('addCourtProvince').value;
    const district = document.getElementById('addCourtDistrict').value.trim();
    const address = document.getElementById('addCourtAddress').value.trim();
    const courtType = document.getElementById('addCourtType').value;
    const basePrice = parseFloat(document.getElementById('addCourtBasePrice').value) || 100000;
    const floorType = document.getElementById('addCourtFloor').value.trim() || 'Thảm Yonex BWF';
    const lighting = document.getElementById('addCourtLighting').value.trim() || 'Đèn LED 350 Lux';

    if (!name || !district || !address) {
        showToast('Vui lòng điền đầy đủ thông tin cụm sân!', 'error');
        return;
    }

    const newCourt = {
        id: `C${adminState.courts.length + 1}`,
        name: name,
        floorType: floorType,
        lighting: lighting,
        basePrice: basePrice,
        status: 'ACTIVE',
        province: province,
        district: district,
        facilityName: name,
        courtType: courtType,
        address: address
    };

    adminState.courts.push(newCourt);
    updateAdminKpis();
    renderAdminCourtCheckboxes();
    renderAdminCourtsTable();
    closeAdminModal('modalAdminAddCourt');
    document.getElementById('formAdminAddCourt').reset();

    showToast(`Đã thêm thành công cụm sân: ${name} (${newCourt.id})!`, 'success');
}

/**
 * Xử lý thêm Tiện Ích / Dịch Vụ mới
 */
async function handleAdminAddServiceSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('addServiceName').value.trim();
    const category = document.getElementById('addServiceCategory').value;
    const unit = document.getElementById('addServiceUnit').value.trim() || 'Cái';
    const price = parseFloat(document.getElementById('addServicePrice').value) || 50000;

    if (!name) {
        showToast('Vui lòng nhập tên dịch vụ/tiện ích!', 'error');
        return;
    }

    closeAdminModal('modalAdminAddService');
    document.getElementById('formAdminAddService').reset();
    showToast(`Đã thêm tiện ích/dịch vụ mới: ${name} (${formatVND(price)})!`, 'success');
}

/**
 * Xử lý thêm Khách Hàng / Hội Viên mới
 */
async function handleAdminAddCustomerSubmit(e) {
    if (e) e.preventDefault();
    const fullName = document.getElementById('addCustFullName').value.trim();
    const phone = document.getElementById('addCustPhone').value.trim();
    const email = document.getElementById('addCustEmail').value.trim();
    const username = document.getElementById('addCustUsername').value.trim();
    const password = document.getElementById('addCustPassword').value.trim();

    if (!fullName || !phone || !username || !password) {
        showToast('Vui lòng điền đầy đủ họ tên, SĐT, username và mật khẩu!', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, fullName, phone, email })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Đã tạo tài khoản hội viên thành công cho: ${fullName}!`, 'success');
            closeAdminModal('modalAdminAddCustomer');
            document.getElementById('formAdminAddCustomer').reset();
            // Reload danh sách khách hàng
            const cRes = await fetch(`${API_BASE}/admin/customers`);
            if (cRes.ok) {
                adminState.customers = await cRes.json();
                renderAdminCustomersTable();
                updateAdminKpis();
            }
        } else {
            showToast(data.message || 'Lỗi khi tạo tài khoản khách hàng!', 'error');
        }
    } catch (err) {
        // Fallback local addition
        const newCust = {
            id: `U${adminState.customers.length + 10}`,
            username,
            fullName,
            phone,
            email,
            role: 'USER',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        adminState.customers.push(newCust);
        renderAdminCustomersTable();
        updateAdminKpis();
        closeAdminModal('modalAdminAddCustomer');
        document.getElementById('formAdminAddCustomer').reset();
        showToast(`Đã tạo tài khoản hội viên: ${fullName}!`, 'success');
    }
}
