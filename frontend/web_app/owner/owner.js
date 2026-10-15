/**
 * DATLICHSPORT - YARD OWNER PORTAL LOGIC WITH ROLE-BASED AUTHENTICATION
 * Phân quyền Chủ Sân dựa trên tài khoản do Admin cấp và quản lý
 */

const ownerState = {
    currentOwner: null,
    courts: [],
    bookings: [],
    filterStatus: 'ALL'
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cập nhật đồng hồ
    updateLiveClock();

    // 2. Kiểm tra session đăng nhập hiện tại
    checkOwnerSession();

    // 3. Đăng ký sự kiện Login form
    const loginForm = document.getElementById('formOwnerLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', handleOwnerLoginSubmit);
    }

    // 4. Bắt sự kiện nút Refresh
    const btnRefresh = document.getElementById('btnRefreshOwnerData');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadOwnerData();
            showToast('Đã làm mới dữ liệu từ máy chủ!', 'success');
        });
    }

    // 5. Tự động đồng bộ mỗi 10 giây nếu đã đăng nhập
    setInterval(() => {
        if (ownerState.currentOwner) {
            loadOwnerData();
        }
    }, 10000);
});

function updateLiveClock() {
    const clockEl = document.getElementById('ownerLiveTimeText');
    if (!clockEl) return;
    const now = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const timeStr = `${dayNames[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    clockEl.textContent = timeStr;
}

/**
 * Kiểm tra Session đăng nhập của Chủ Sân
 */
function checkOwnerSession() {
    const saved = sessionStorage.getItem('datlich_owner_user');
    if (saved) {
        try {
            const user = JSON.parse(saved);
            if (user && user.role === 'OWNER') {
                showOwnerDashboard(user);
                return;
            }
        } catch (e) {}
    }
    showOwnerLoginForm();
}

function showOwnerLoginForm() {
    ownerState.currentOwner = null;
    const loginSec = document.getElementById('ownerLoginSection');
    const dashSec = document.getElementById('ownerDashboardApp');
    if (loginSec) loginSec.style.display = 'flex';
    if (dashSec) dashSec.style.display = 'none';
}

function showOwnerDashboard(user) {
    ownerState.currentOwner = user;
    const loginSec = document.getElementById('ownerLoginSection');
    const dashSec = document.getElementById('ownerDashboardApp');
    if (loginSec) loginSec.style.display = 'none';
    if (dashSec) dashSec.style.display = 'block';

    updateOwnerHeaderProfile();
    loadOwnerData();
}

/**
 * Xử lý sự kiện đăng nhập Chủ Sân
 */
async function handleOwnerLoginSubmit(e) {
    if (e) e.preventDefault();
    const userInput = document.getElementById('ownerLoginUser');
    const passInput = document.getElementById('ownerLoginPass');
    const btnSubmit = document.getElementById('btnOwnerLoginSubmit');

    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
        showToast('Vui lòng nhập tên đăng nhập và mật khẩu!', 'error');
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
            if (data.user.role !== 'OWNER') {
                showToast('Tài khoản này không có quyền Chủ Sân (Role: ' + data.user.role + ')!', 'error');
                return;
            }

            // Lưu session
            sessionStorage.setItem('datlich_owner_user', JSON.stringify(data.user));
            showToast(`Đăng nhập thành công! Chào mừng ${data.user.fullName}`, 'success');
            showOwnerDashboard(data.user);
        } else {
            showToast(data.message || 'Sai tên đăng nhập hoặc mật khẩu!', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối máy chủ xác thực!', 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> ĐĂNG NHẬP QUẢN LÝ SÂN';
    }
}

/**
 * Đăng xuất khỏi Cổng Chủ Sân
 */
function logoutOwnerAction() {
    sessionStorage.removeItem('datlich_owner_user');
    showOwnerLoginForm();
    showToast('Đã đăng xuất khỏi Cổng Chủ Sân.', 'info');
}

/**
 * Cập nhật thông tin chủ sân trên Header & Thẻ hồ sơ
 */
function updateOwnerHeaderProfile() {
    const o = ownerState.currentOwner;
    if (!o) return;

    const loggedName = document.getElementById('ownerLoggedNameDisplay');
    const loggedCourtsBadge = document.getElementById('ownerLoggedCourtsBadge');
    const nameEl = document.getElementById('ownerFullNameDisplay');
    const phoneEl = document.getElementById('ownerPhoneDisplay');
    const courtsEl = document.getElementById('ownerCourtsListDisplay');

    if (loggedName) loggedName.textContent = o.fullName || o.username;
    if (loggedCourtsBadge) loggedCourtsBadge.textContent = o.managedCourtIds || 'Chưa gán';
    if (nameEl) nameEl.textContent = o.fullName;
    if (phoneEl) phoneEl.textContent = o.phone || '0900 000 000';
    if (courtsEl) courtsEl.textContent = o.managedCourtIds ? `Sân ${o.managedCourtIds.replace(/,/g, ', Sân ')}` : 'Chưa gán';
}

/**
 * Tải toàn bộ dữ liệu Courts & Bookings từ máy chủ
 */
async function loadOwnerData() {
    if (!ownerState.currentOwner) return;

    try {
        const [courtsRes, bookingsRes] = await Promise.all([
            fetch(`${API_BASE}/courts`),
            fetch(`${API_BASE}/bookings`)
        ]);

        if (courtsRes.ok) ownerState.courts = await courtsRes.json();
        if (bookingsRes.ok) ownerState.bookings = await bookingsRes.json();

        renderOwnerCourts();
        renderOwnerBookings();
    } catch (e) {
        console.error('Lỗi khi tải dữ liệu chủ sân:', e);
    }
}

/**
 * Hiển thị danh sách các sân thuộc quyền quản lý của chủ sân này (dựa trên Admin gán)
 */
function renderOwnerCourts() {
    const grid = document.getElementById('ownerCourtsListGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const managedIds = (ownerState.currentOwner.managedCourtIds || '').split(',').map(s => s.trim());
    const myCourts = ownerState.courts.filter(c => managedIds.includes(c.id));

    const countEl = document.getElementById('statOwnerCourtCount');
    if (countEl) countEl.textContent = `${myCourts.length} sân`;

    if (myCourts.length === 0) {
        grid.innerHTML = '<div style="color:#888; padding:15px;"><i class="fa-solid fa-triangle-exclamation text-gold"></i> Chủ sân này chưa được Admin phân quyền quản lý sân nào. Vui lòng liên hệ Admin để bàn giao quyền sân!</div>';
        return;
    }

    myCourts.forEach(c => {
        const card = document.createElement('div');
        card.className = 'owner-court-card';
        const isActive = (c.status === 'ACTIVE');

        card.innerHTML = `
            <div>
                <div class="occ-title">
                    <i class="fa-solid fa-trophy text-gold"></i> ${escapeHTML(c.name)}
                </div>
                <div class="occ-sub">
                    ${escapeHTML(c.floorType)} • Tiêu chuẩn BWF • <strong>${formatVND(c.basePrice)}/h</strong>
                </div>
            </div>
            <button class="btn-toggle-status ${isActive ? 'active' : 'maintenance'}" onclick="toggleCourtStatus('${c.id}')">
                <i class="fa-solid fa-power-off"></i> ${isActive ? 'ĐANG MỞ ĐÓN KHÁCH' : 'TẠM TẮT BẢO TRÌ'}
            </button>
        `;
        grid.appendChild(card);
    });
}

/**
 * Bật / Tắt trạng thái bảo trì của sân
 */
async function toggleCourtStatus(courtId) {
    try {
        const res = await fetch(`${API_BASE}/owner/toggle-court`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courtId: courtId })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Sân ${courtId} đã chuyển sang trạng thái: ${data.newStatus}`, 'success');
            await loadOwnerData();
        } else {
            showToast(data.message || 'Lỗi khi cập nhật sân', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi đổi trạng thái sân!', 'error');
    }
}

/**
 * Hiển thị danh sách các đơn đặt sân của cụm sân do chủ sân này quản lý
 */
function renderOwnerBookings() {
    const tbody = document.getElementById('ownerBookingsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const managedIds = (ownerState.currentOwner.managedCourtIds || '').split(',').map(s => s.trim());
    
    // Lọc đơn theo các sân thuộc quyền chủ sân
    let myBookings = ownerState.bookings.filter(b => managedIds.includes(b.courtId));

    // Thống kê doanh thu & lượt
    let totalRevenue = 0;
    let checkedInCount = 0;

    myBookings.forEach(b => {
        if (b.status !== 'CANCELLED') totalRevenue += b.totalAmount;
        if (b.status === 'CHECKED_IN') checkedInCount++;
    });

    const revEl = document.getElementById('statOwnerRevenue');
    const bookEl = document.getElementById('statOwnerBookings');
    const checkEl = document.getElementById('statOwnerCheckedIn');

    if (revEl) revEl.textContent = formatVND(totalRevenue);
    if (bookEl) bookEl.textContent = myBookings.length;
    if (checkEl) checkEl.textContent = checkedInCount;

    // Lọc theo bộ lọc trạng thái
    if (ownerState.filterStatus !== 'ALL') {
        myBookings = myBookings.filter(b => b.status === ownerState.filterStatus);
    }

    if (myBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 25px; color:#888;">Không có đơn đặt sân nào trong mục này.</td></tr>';
        return;
    }

    myBookings.forEach(b => {
        const tr = document.createElement('tr');
        const slotsText = (b.slots || []).map(s => `${s.startTime}~${s.endTime}`).join(', ');
        const servicesText = (b.services && b.services.length > 0)
            ? b.services.map(s => s.name).join(', ')
            : '<span style="color:#666">Không có</span>';

        tr.innerHTML = `
            <td>
                <strong class="text-blue" style="cursor:pointer;" onclick="openTicketDetailModal('${b.bookingCode}')">
                    <i class="fa-solid fa-qrcode"></i> ${escapeHTML(b.bookingCode)}
                </strong>
            </td>
            <td><strong>${escapeHTML(b.courtName || b.courtId)}</strong></td>
            <td>${formatDateVN(b.date)}</td>
            <td><span style="color:var(--sport-cyan); font-weight:700;">${slotsText}</span></td>
            <td>
                <strong>${escapeHTML(b.customer ? b.customer.fullName : 'Khách vãng lai')}</strong><br>
                <small style="color:var(--text-muted);"><i class="fa-solid fa-phone"></i> ${escapeHTML(b.customer ? b.customer.phone : '')}</small>
            </td>
            <td><small>${servicesText}</small></td>
            <td><strong style="color:var(--sport-green); font-weight:800;">${formatVND(b.totalAmount)}</strong></td>
            <td><span class="ti-status-tag ${b.status}">${b.status}</span></td>
            <td>
                ${b.status === 'CONFIRMED' ? `
                    <button class="btn-qc-checkin" onclick="checkInBooking('${b.bookingCode}')" style="font-size:11.5px; padding:4px 10px;">
                        <i class="fa-solid fa-circle-check"></i> Check-in
                    </button>
                ` : b.status === 'CHECKED_IN' ? `
                    <span style="color:#00E676; font-weight:700; font-size:11.5px;"><i class="fa-solid fa-check-double"></i> Đã vào sân</span>
                ` : `
                    <span style="color:var(--sport-red); font-size:11.5px;"><i class="fa-solid fa-ban"></i> Đã hủy</span>
                `}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOwnerBookings(status) {
    ownerState.filterStatus = status;
    document.querySelectorAll('.bf-pill').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(
            status === 'ALL' ? 'Tất cả' :
            status === 'CONFIRMED' ? 'Chờ Check-in' :
            status === 'CHECKED_IN' ? 'Đã Check-in' : 'Đã Hủy'
        ));
    });
    renderOwnerBookings();
}

/**
 * Xử lý check-in từ ô nhập nhanh
 */
async function ownerCheckInAction() {
    const input = document.getElementById('inputOwnerCheckInCode');
    if (!input) return;
    const code = input.value.trim();
    if (!code) {
        showToast('Vui lòng nhập mã vé (Ví dụ: BDM-xxx) để check-in!', 'error');
        return;
    }
    await checkInBooking(code);
    input.value = '';
}

/**
 * Gọi API Check-in vào sân
 */
async function checkInBooking(code) {
    try {
        const res = await fetch(`${API_BASE}/checkin?code=${encodeURIComponent(code)}`, {
            method: 'POST'
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Xác nhận Check-in thành công cho vé: ${code}`, 'success');
            await loadOwnerData();
        } else {
            showToast(data.message || 'Không thể check-in vé này!', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi check-in!', 'error');
    }
}

/**
 * Mở modal chi tiết vé
 */
function openTicketDetailModal(bookingCode) {
    const b = ownerState.bookings.find(x => x.bookingCode === bookingCode);
    if (!b) return;

    const modal = document.getElementById('modalTicketDetail');
    const body = document.getElementById('modalTicketDetailBody');
    if (!modal || !body) return;

    const slotsText = (b.slots || []).map(s => `${s.startTime} ~ ${s.endTime}`).join(', ');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(b.bookingCode)}`;

    body.innerHTML = `
        <div style="text-align:center; margin-bottom:15px;">
            <img src="${qrUrl}" alt="QR" style="border: 4px solid #fff; border-radius: 8px; width: 160px; height: 160px; box-shadow: 0 0 20px rgba(0, 229, 255, 0.35);">
            <div style="margin-top:8px; font-size:16px; font-weight:800;" class="text-blue">${escapeHTML(b.bookingCode)}</div>
            <div style="font-size:12px; color:var(--text-muted);">Trạng thái: <span class="ti-status-tag ${b.status}">${b.status}</span></div>
        </div>
        <div style="background:#121214; padding:15px; border-radius:6px; font-size:13px; line-height:1.8; border: 1px solid rgba(255, 255, 255, 0.08);">
            <div>🏸 <strong>Sân:</strong> ${escapeHTML(b.courtName)}</div>
            <div>📅 <strong>Ngày thi đấu:</strong> ${formatDateVN(b.date)}</div>
            <div>⏰ <strong>Khung giờ:</strong> <span style="color:var(--sport-cyan); font-weight:700;">${slotsText}</span></div>
            <div>👤 <strong>Khách hàng:</strong> ${escapeHTML(b.customer ? b.customer.fullName : '')} (${escapeHTML(b.customer ? b.customer.phone : '')})</div>
            <div>💰 <strong>Tổng thanh toán:</strong> <span style="color:var(--sport-green); font-weight:800; font-size:15px;">${formatVND(b.totalAmount)}</span></div>
        </div>
        ${b.status === 'CONFIRMED' ? `
            <div style="margin-top:15px; text-align:center;">
                <button class="btn-qc-checkin" onclick="checkInBooking('${b.bookingCode}'); closeTicketDetailModal();" style="width:100%; padding:10px;">
                    <i class="fa-solid fa-circle-check"></i> XÁC NHẬN CHECK-IN CHO KHÁCH VÀO SÂN
                </button>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
}

function closeTicketDetailModal() {
    const modal = document.getElementById('modalTicketDetail');
    if (modal) modal.classList.remove('active');
}
