/**
 * DATLICHSPORT - SHARED ECOSYSTEM UTILITIES & UNIVERSAL HUB NAVIGATION
 * Chia sẻ tiện ích và thanh điều hướng liên kết thống nhất giữa 3 web (Khách Hàng, Chủ Sân, Admin)
 */

// 1. Xác định API BASE và ROOT PATH
var isFileProtocol = window.location.protocol === 'file:';
var IS_DATLICH_PREFIX = window.location.pathname.includes('/datlichsport');
window.API_BASE = isFileProtocol ? 'http://localhost:8088/api' : (IS_DATLICH_PREFIX ? '/datlichsport/api' : '/api');
var API_BASE = window.API_BASE;

/**
 * Trả về URL điều hướng chính xác giữa 3 Web App
 * @param {'customer' | 'owner' | 'admin'} target
 */
function getEcosystemUrl(target) {
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        // Mở file offline từ ổ đĩa
        const path = window.location.pathname;
        const inSubDir = path.includes('/owner/') || path.includes('/admin/') || path.includes('\\owner\\') || path.includes('\\admin\\');
        const prefix = inSubDir ? '../' : './';
        if (target === 'customer') return prefix + 'index.html';
        if (target === 'owner') return prefix + 'owner/index.html';
        if (target === 'admin') return prefix + 'admin/index.html';
    }

    // Chạy qua máy chủ Web Java HTTP Server
    const basePrefix = IS_DATLICH_PREFIX ? '/datlichsport' : '';
    if (target === 'customer') return (basePrefix || '') + '/';
    if (target === 'owner') return basePrefix + '/owner/';
    if (target === 'admin') return basePrefix + '/admin/';
    return '/';
}

/**
 * Khởi tạo Thanh Điều Hướng Hệ Sinh Thái (Universal Hub Bar) trên cả 3 trang
 * @param {'CUSTOMER' | 'OWNER' | 'ADMIN'} activeRole 
 * @param {string} userNameText
 */
function initUniversalHub(activeRole, userNameText) {
    const container = document.getElementById('universalHubBar');
    if (container) container.remove();
}

/**
 * Kiểm tra kết nối Live tới Java Server
 */
async function checkServerConnection() {
    try {
        const res = await fetch(`${API_BASE}/courts`);
        const badge = document.getElementById('hubServerStatusBadge');
        if (badge) {
            if (res.ok) {
                badge.innerHTML = '<span class="dot-live"></span> Java 8088 Live';
                badge.classList.remove('offline');
            } else {
                badge.innerHTML = '<span class="dot-live offline"></span> Đang kết nối...';
            }
        }
    } catch (e) {
        const badge = document.getElementById('hubServerStatusBadge');
        if (badge) {
            badge.innerHTML = '<span class="dot-live offline"></span> Mất kết nối Java';
        }
    }
}

// ==========================================================================
// TIỆN ÍCH DÙNG CHUNG (FORMATTER & UI HELPERS)
// ==========================================================================

function formatVND(amount) {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function formatDateVN(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            return `${dayNames[d.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    } catch (e) {}
    return dateStr;
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Hiển thị Toast thông báo Glassmorphic sang trọng
 */
function showToast(message, type = 'info') {
    let toastWrap = document.getElementById('toastWrapper');
    if (!toastWrap) {
        toastWrap = document.createElement('div');
        toastWrap.id = 'toastWrapper';
        toastWrap.className = 'toast-wrapper';
        document.body.appendChild(toastWrap);
    }

    const toast = document.createElement('div');
    toast.className = `toast-card toast-${type}`;
    const icon = type === 'success' 
        ? '<i class="fa-solid fa-circle-check text-green"></i>' 
        : type === 'error' 
            ? '<i class="fa-solid fa-triangle-exclamation text-cgv-red"></i>' 
            : '<i class="fa-solid fa-circle-info text-blue"></i>';

    toast.innerHTML = `
        <span class="t-icon">${icon}</span>
        <span class="t-msg">${escapeHTML(message)}</span>
    `;

    toastWrap.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}
