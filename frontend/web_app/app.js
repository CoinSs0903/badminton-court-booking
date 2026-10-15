/**
 * DATLICHSPORT - CGV CINEMA CONCEPT CLIENT LOGIC
 */

var API_BASE = window.API_BASE || (window.location.protocol === 'file:' ? 'http://localhost:8088/api' : (window.location.pathname.startsWith('/datlichsport') ? '/datlichsport/api' : '/api'));

// Application State
const state = {
    courts: [],
    selectedDate: new Date().toISOString().split('T')[0],
    courtSlotsMap: {}, // courtId -> array of slots
    selectedCourt: null,
    selectedSlotIds: new Set(),
    services: [],
    selectedServiceIds: new Set(),
    bookings: [],
    currentView: 'booking',
    currentCustomer: null,
    selectedSessionFilter: 'ALL',
    collapsedLayers: {},
    // 5-Step Workflow State
    selectedProvince: 'ALL',
    selectedDistrict: 'ALL',
    searchCourtKeyword: '',
    selectedCourtType: 'ALL',
    bookingDateMode: 'single' // 'single' | 'recurring'
};

// DOM References
const bookingDatePicker = document.getElementById('bookingDatePicker');
const dateCarouselList = document.getElementById('dateCarouselList');
const dateCarouselMonthTag = document.getElementById('dateCarouselMonthTag');
const cinemaCourtCards = document.getElementById('cinemaCourtCards');
const combosGrid = document.getElementById('combosGrid');
const ticketStubsGrid = document.getElementById('ticketStubsGrid');
const ticketCountBadge = document.getElementById('ticketCountBadge');

// Booking Filter Hub DOM References
const selectProvince = document.getElementById('selectProvince');
const selectDistrict = document.getElementById('selectDistrict');
const selectCourtType = document.getElementById('selectCourtType');
const courtSearchInput = document.getElementById('courtSearchInput');
const btnCourtSearchClear = document.getElementById('btnCourtSearchClear');
const courtMatchBadge = document.getElementById('courtMatchBadge');
const bfFilterSummaryText = document.getElementById('bfFilterSummaryText');

// Bottom Bar
const bbCourtName = document.getElementById('bbCourtName');
const bbDate = document.getElementById('bbDate');
const bbSlots = document.getElementById('bbSlots');
const bbCombos = document.getElementById('bbCombos');
const bbTotalPrice = document.getElementById('bbTotalPrice');
const btnOpenCgvCheckout = document.getElementById('btnOpenCgvCheckout');

// Checkout Modal
const checkoutModal = document.getElementById('checkoutModal');
const btnCloseCheckoutModal = document.getElementById('btnCloseCheckoutModal');
const mCourtName = document.getElementById('mCourtName');
const mDate = document.getElementById('mDate');
const mSlots = document.getElementById('mSlots');
const mCombos = document.getElementById('mCombos');
const mTotalAmount = document.getElementById('mTotalAmount');
const dynamicQrImg = document.getElementById('dynamicQrImg');
const qrTransferNote = document.getElementById('qrTransferNote');
const qrDisplayBox = document.getElementById('qrDisplayBox');
const btnFinishBooking = document.getElementById('btnFinishBooking');
const cgvCheckoutForm = document.getElementById('cgvCheckoutForm');

// Success Modal
const ticketSuccessModal = document.getElementById('ticketSuccessModal');
const btnCloseSuccessModal = document.getElementById('btnCloseSuccessModal');
const ticketSuccessBody = document.getElementById('ticketSuccessBody');

// Other
const btnRefreshData = document.getElementById('btnRefreshData');

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initUniversalHub('CUSTOMER', 'Khách Hàng (Demo)');
    checkCustomerSession();
    initDates();
    bindEvents();
    loadAllData();
});

// Quản lý hiển thị lịch bảng gia đình
let calViewYear = new Date().getFullYear();
let calViewMonth = new Date().getMonth(); // 0-11

function formatDateYMD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function initDates() {
    const now = new Date();
    const today = formatDateYMD(now);
    if (!state.selectedDate) {
        state.selectedDate = today;
    }
    calViewMonth = now.getMonth();
    if (bookingDatePicker) bookingDatePicker.value = state.selectedDate;
    renderDateCarousel();
    updatePage1Summary();
}

function triggerNativeDatePicker() {
    const picker = document.getElementById('carouselDateNativePicker');
    if (picker) {
        if (typeof picker.showPicker === 'function') {
            try {
                picker.showPicker();
                return;
            } catch (e) {}
        }
        picker.focus();
        picker.click();
    }
}

function onCustomDatePicked(val) {
    if (!val) return;
    selectDate(val, true);
    showToast(`Đã chuyển lịch đến ngày: ${formatDateVN(val)}`, 'success');
}

function jumpMonth(offset) {
    const curDateStr = state.selectedDate || formatDateYMD(new Date());
    const [y, m, d] = curDateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1 + offset, d);
    if (isNaN(targetDate.getTime())) return;
    selectDate(formatDateYMD(targetDate));
}

let carouselScrollTimer = null;
function setupCarouselScrollWatcher() {
    const listEl = document.getElementById('dateCarouselList');
    const monthTagEl = document.getElementById('dateCarouselMonthTag');
    if (!listEl || !monthTagEl) return;

    listEl.onscroll = () => {
        clearTimeout(carouselScrollTimer);
        carouselScrollTimer = setTimeout(() => {
            const listRect = listEl.getBoundingClientRect();
            const centerX = listRect.left + listRect.width / 2;
            const cards = listEl.querySelectorAll('.date-tab-card');
            let closestCard = null;
            let minDiff = Infinity;

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const diff = Math.abs(centerX - cardCenterX);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestCard = card;
                }
            });

            if (closestCard) {
                const monthTitle = closestCard.getAttribute('data-month-title');
                if (monthTitle && monthTagEl.textContent !== monthTitle) {
                    monthTagEl.textContent = monthTitle;
                }
            }
        }, 80);
    };
}

function renderDateCarousel() {
    const listEl = document.getElementById('dateCarouselList');
    const monthTagEl = document.getElementById('dateCarouselMonthTag');
    const modeDateText = document.getElementById('modeSelectedDateText');
    const nativePicker = document.getElementById('carouselDateNativePicker');
    if (!listEl) return;

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const weekdayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateYMD(today);

    if (!state.selectedDate) {
        state.selectedDate = todayStr;
    }

    const [selY, selM, selD] = state.selectedDate.split('-').map(Number);
    const selDateObj = new Date(selY, selM - 1, selD);

    if (monthTagEl) {
        monthTagEl.textContent = `${monthNames[selM - 1].toUpperCase()} • ${selY}`;
    }
    if (modeDateText) {
        modeDateText.textContent = `${selD < 10 ? '0' + selD : selD}/${selM < 10 ? '0' + selM : selM}/${selY}`;
    }
    if (nativePicker) {
        nativePicker.value = state.selectedDate;
    }

    // Dải ngày linh hoạt cho TẤT CẢ CÁC NGÀY:
    // Đảm bảo luôn bao phủ từ ngày hôm nay (hoặc selDateObj nếu chọn lùi) đến ít nhất 45 ngày sau selDateObj
    let startDate = new Date(today);
    if (selDateObj < today) {
        startDate = new Date(selDateObj);
    }

    const diffDaysToSel = Math.round((selDateObj - startDate) / (1000 * 60 * 60 * 24));
    const totalDays = Math.max(diffDaysToSel + 45, 60); // Tối thiểu 60 ngày liên tục, người dùng thoải mái lướt tất cả các ngày

    listEl.innerHTML = '';

    for (let i = 0; i < totalDays; i++) {
        const curDate = new Date(startDate);
        curDate.setDate(startDate.getDate() + i);

        const dStr = formatDateYMD(curDate);
        const isSelected = (dStr === state.selectedDate);
        const isToday = (dStr === todayStr);
        const dayOfWeek = curDate.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const dayNum = curDate.getDate();
        const monthNum = curDate.getMonth() + 1;

        const card = document.createElement('div');
        let cardClasses = ['date-tab-card'];
        if (isSelected) cardClasses.push('active');
        if (isToday) cardClasses.push('is-today');
        if (isWeekend) cardClasses.push('is-weekend');

        card.className = cardClasses.join(' ');
        card.setAttribute('data-date', dStr);
        card.setAttribute('data-month-title', `${monthNames[monthNum - 1].toUpperCase()} • ${curDate.getFullYear()}`);

        card.innerHTML = `
            <span class="dt-month">Thg ${monthNum}</span>
            <span class="dt-day">${dayNum < 10 ? '0' + dayNum : dayNum}</span>
            <span class="dt-weekday">${weekdayNames[dayOfWeek]}</span>
            ${isToday ? '<span class="dt-today-pill">Hôm nay</span>' : ''}
        `;

        card.onclick = () => selectDate(dStr, true);
        listEl.appendChild(card);
    }

    updateShortcutButtonsState();

    // Tự động cuộn thẻ được chọn ra giữa tầm nhìn
    setTimeout(() => {
        const activeCard = listEl.querySelector('.date-tab-card.active');
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 60);

    setupCarouselScrollWatcher();
}

function updateShortcutButtonsState() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateYMD(today);

    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);
    const tmrwStr = formatDateYMD(tmrw);

    const btnToday = document.getElementById('btnDateShortcutToday');
    const btnTmrw = document.getElementById('btnDateShortcutTomorrow');
    const btnWknd = document.getElementById('btnDateShortcutWeekend');

    if (btnToday) btnToday.classList.toggle('active', state.selectedDate === todayStr);
    if (btnTmrw) btnTmrw.classList.toggle('active', state.selectedDate === tmrwStr);

    if (btnWknd) {
        const selDateObj = new Date(state.selectedDate);
        const day = selDateObj.getDay();
        btnWknd.classList.toggle('active', day === 0 || day === 6);
    }
}

function scrollDateCarousel(direction) {
    const list = document.getElementById('dateCarouselList');
    if (list) {
        const scrollAmount = direction * 300;
        list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function selectDate(dateStr, autoProceed = false) {
    state.selectedDate = dateStr;
    const [y, m] = dateStr.split('-').map(Number);
    calViewYear = y;
    calViewMonth = m - 1;
    if (bookingDatePicker) bookingDatePicker.value = dateStr;
    renderDateCarousel();
    updatePage1Summary();
    updatePage2Summary();
    state.selectedSlotIds.clear();
    updateBottomBar();

    const page2 = document.getElementById('bookingPage2Slots');
    const isPage2Visible = page2 && page2.style.display !== 'none';
    if (isPage2Visible) {
        loadAllCourtSlots();
    } else if (autoProceed) {
        proceedToSlotsPage();
    }
}

function proceedToSlotsPage() {
    const page1 = document.getElementById('bookingPage1FilterDate');
    const page2 = document.getElementById('bookingPage2Slots');
    const bottomBar = document.getElementById('cgvBottomBar');

    if (page1) page1.style.display = 'none';
    if (page2) {
        page2.style.display = 'block';
        updatePage2Summary();
        renderCinemaCourts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadAllCourtSlots();
    }
    if (bottomBar) bottomBar.style.display = 'flex';
}

function backToFilterDatePage() {
    const page1 = document.getElementById('bookingPage1FilterDate');
    const page2 = document.getElementById('bookingPage2Slots');
    const bottomBar = document.getElementById('cgvBottomBar');

    if (page2) page2.style.display = 'none';
    if (page1) {
        page1.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    updatePage1Summary();
}

function proceedToCombos() {
    proceedToSlotsPage();
    setTimeout(() => {
        const combos = document.getElementById('combosSection');
        if (combos) combos.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function updatePage1Summary() {
    const headline = document.getElementById('p1SelectedDateHeadline');
    if (headline && state.selectedDate) {
        headline.textContent = formatDateVN(state.selectedDate);
    }
}

function updatePage2Summary() {
    const dateText = document.getElementById('p2TagDateText');
    const locText = document.getElementById('p2TagLocText');
    const typeText = document.getElementById('p2TagTypeText');

    if (dateText && state.selectedDate) {
        dateText.textContent = formatDateVN(state.selectedDate);
    }

    if (locText) {
        if (state.selectedProvince !== 'ALL') {
            locText.textContent = (state.selectedDistrict !== 'ALL') 
                ? `${state.selectedDistrict}, ${state.selectedProvince}` 
                : state.selectedProvince;
        } else {
            locText.textContent = 'Toàn quốc';
        }
    }

    if (typeText) {
        typeText.textContent = (state.selectedCourtType !== 'ALL') ? state.selectedCourtType : 'Tất cả loại sân';
    }
}

function quickSelectRelativeDay(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    calViewYear = d.getFullYear();
    calViewMonth = d.getMonth();
    selectDate(formatDateYMD(d), true);
}

function quickSelectThisWeekend() {
    const d = new Date();
    const day = d.getDay();
    // Đến Thứ 7 gần nhất
    const diffToSaturday = (day === 0) ? 6 : (6 - day);
    d.setDate(d.getDate() + (diffToSaturday === 0 ? 0 : diffToSaturday));
    calViewYear = d.getFullYear();
    calViewMonth = d.getMonth();
    selectDate(formatDateYMD(d), true);
}

function gotoToday() {
    quickSelectRelativeDay(0);
}

function setBookingDateMode(mode) {
    state.bookingDateMode = mode;
    const btnSingle = document.getElementById('btnModeSingleDay');
    const btnRec = document.getElementById('btnModeRecurring');
    const panel = document.getElementById('recurringOptionsPanel');

    if (btnSingle) btnSingle.classList.toggle('active', mode === 'single');
    if (btnRec) btnRec.classList.toggle('active', mode === 'recurring');
    if (panel) panel.style.display = (mode === 'recurring') ? 'block' : 'none';

    updateBottomBar();
}

function toggleAllRecurringDays(checked) {
    document.querySelectorAll('input[name="rcDay"]').forEach(cb => {
        cb.checked = checked;
    });
    updateBottomBar();
}

function bindEvents() {

    if (bookingDatePicker) {
        bookingDatePicker.addEventListener('change', (e) => {
            selectDate(e.target.value, true);
        });
    }

    if (btnRefreshData) {
        btnRefreshData.addEventListener('click', () => {
            showToast('Đang làm mới lịch suất chiếu từ máy chủ...', 'info');
            loadAllData();
        });
    }

    // Payment method toggle
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.cgv-pay-card').forEach(c => c.classList.remove('active'));
            e.target.closest('.cgv-pay-card').classList.add('active');
            if (e.target.value === 'TIEN_MAT') {
                qrDisplayBox.style.display = 'none';
            } else {
                qrDisplayBox.style.display = 'flex';
            }
        });
    });

    btnOpenCgvCheckout.addEventListener('click', () => {
        openCheckoutModal();
    });

    btnCloseCheckoutModal.addEventListener('click', () => checkoutModal.classList.remove('show'));
    btnCloseSuccessModal.addEventListener('click', () => ticketSuccessModal.classList.remove('show'));

    cgvCheckoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBooking();
    });

    const formCustLogin = document.getElementById('formCustLogin');
    if (formCustLogin) formCustLogin.addEventListener('submit', handleCustomerLogin);

    const formCustRegister = document.getElementById('formCustRegister');
    if (formCustRegister) formCustRegister.addEventListener('submit', handleCustomerRegister);
}

function switchCgvView(view) {
    state.currentView = view;
    const viewBooking = document.getElementById('viewBooking');
    const viewTickets = document.getElementById('viewTickets');
    const navBookingTab = document.getElementById('navBookingTab');
    const navTicketsTab = document.getElementById('navTicketsTab');

    if (view === 'booking') {
        viewBooking.classList.add('active');
        viewTickets.classList.remove('active');
        navBookingTab.classList.add('active');
        navTicketsTab.classList.remove('active');
    } else {
        viewTickets.classList.add('active');
        viewBooking.classList.remove('active');
        navTicketsTab.classList.add('active');
        navBookingTab.classList.remove('active');
        if (!state.currentCustomer) {
            showToast('Vui lòng đăng nhập để xem vé của bạn!', 'info');
            openCustomerAuthModal('login');
        }
        loadBookings();
    }
}

function scrollToCombos() {
    switchCgvView('booking');
    const section = document.getElementById('combosSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================================
// DATA LOADING
// ==========================================================================
async function loadAllData() {
    try {
        await Promise.all([loadCourts(), loadServices(), loadBookings()]);
    } catch (e) {
        console.error(e);
    }
}

async function loadCourts() {
    try {
        const res = await fetch(`${API_BASE}/courts`);
        const data = await res.json();
        state.courts = data;
        updateDistrictOptions();
        await loadAllCourtSlots();
    } catch (e) {
        showToast('Lỗi tải danh sách sân!', 'error');
    }
}

async function loadAllCourtSlots() {
    cinemaCourtCards.innerHTML = '<div style="text-align:center; padding: 30px; color:#999;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải suất giờ các sân...</div>';
    state.courtSlotsMap = {};

    try {
        for (const court of state.courts) {
            const res = await fetch(`${API_BASE}/slots?courtId=${court.id}&date=${state.selectedDate}`);
            const slots = await res.json();
            state.courtSlotsMap[court.id] = slots;
        }
        renderCinemaCourts();
    } catch (e) {
        showToast('Lỗi tải suất giờ!', 'error');
    }
}

async function loadServices() {
    try {
        const res = await fetch(`${API_BASE}/services`);
        const data = await res.json();
        state.services = data;
        renderCombos();
    } catch (e) {
        console.error(e);
    }
}

async function loadBookings() {
    try {
        const res = await fetch(`${API_BASE}/bookings`);
        const data = await res.json();
        state.bookings = data;
        renderTicketStubs();
    } catch (e) {
        console.error(e);
    }
}

// ==========================================================================
// RENDERING
// ==========================================================================
const COURT_SESSIONS = [
    {
        id: 'early-morning',
        name: 'Lớp Ca Sáng Sớm (Bình Minh)',
        timeRange: '06:00 – 08:00',
        icon: 'fa-solid fa-mug-hot',
        colorClass: 'session-early-morning',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 6 && h < 8;
        }
    },
    {
        id: 'morning',
        name: 'Lớp Ca Sáng (Phong Trào)',
        timeRange: '08:00 – 11:00',
        icon: 'fa-regular fa-sun',
        colorClass: 'session-morning',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 8 && h < 11;
        }
    },
    {
        id: 'noon',
        name: 'Lớp Ca Trưa (Nghỉ Trưa & Tiết Kiệm)',
        timeRange: '11:00 – 14:00',
        icon: 'fa-solid fa-sun',
        colorClass: 'session-noon',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 11 && h < 14;
        }
    },
    {
        id: 'afternoon',
        name: 'Lớp Ca Chiều (Học Tập & CLB)',
        timeRange: '14:00 – 17:00',
        icon: 'fa-solid fa-cloud-sun',
        colorClass: 'session-afternoon',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 14 && h < 17;
        }
    },
    {
        id: 'evening',
        name: 'Lớp Ca Tối • Giờ Vàng (Peak)',
        timeRange: '17:00 – 20:00',
        icon: 'fa-solid fa-bolt',
        isPeak: true,
        colorClass: 'session-evening',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 17 && h < 20;
        }
    },
    {
        id: 'night',
        name: 'Lớp Ca Đêm Muộn (Giao Lưu Đêm)',
        timeRange: '20:00 – 22:00',
        icon: 'fa-solid fa-moon',
        colorClass: 'session-night',
        filter: s => {
            const h = parseInt(s.startTime.split(':')[0], 10);
            return h >= 20 && h < 22;
        }
    }
];

function setSessionFilter(filterId) {
    state.selectedSessionFilter = filterId;
    document.querySelectorAll('.btn-session-pill').forEach(btn => {
        if (btn.dataset.session === filterId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderCinemaCourts();
}

function toggleSessionLayer(courtId, sessionId) {
    if (!state.collapsedLayers) state.collapsedLayers = {};
    const key = `${courtId}_${sessionId}`;
    state.collapsedLayers[key] = !state.collapsedLayers[key];
    renderCinemaCourts();
}

// ==========================================================================
// 5-STEP BOOKING BUSINESS WORKFLOW METHODS
// 1. Địa chỉ tỉnh/quận -> 2. Tên sân -> 3. Giờ sân -> 4. Loại sân -> 5. Phụ kiện
// ==========================================================================
function onProvinceChange() {
    state.selectedProvince = selectProvince ? selectProvince.value : 'ALL';
    state.selectedDistrict = 'ALL';
    updateDistrictOptions();
    renderCinemaCourts();
}

function updateDistrictOptions() {
    if (!selectDistrict) return;
    selectDistrict.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'ALL';
    defaultOpt.textContent = (state.selectedProvince === 'ALL')
        ? '📍 Tất cả Quận / Huyện'
        : `📍 Tất cả Quận / Huyện (${state.selectedProvince})`;
    selectDistrict.appendChild(defaultOpt);

    if (state.selectedProvince !== 'ALL') {
        const districtSet = new Set();
        (state.courts || []).forEach(c => {
            if (c.province === state.selectedProvince && c.district) {
                districtSet.add(c.district);
            }
        });
        const sortedDistricts = Array.from(districtSet).sort();
        sortedDistricts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            selectDistrict.appendChild(opt);
        });
    }
    selectDistrict.value = 'ALL';
}

function onDistrictChange() {
    state.selectedDistrict = selectDistrict ? selectDistrict.value : 'ALL';
    renderCinemaCourts();
}

function onSearchCourtInput(val) {
    state.searchCourtKeyword = (val || '').trim();
    if (btnCourtSearchClear) {
        btnCourtSearchClear.style.display = state.searchCourtKeyword ? 'inline-flex' : 'none';
    }
    renderCinemaCourts();
}

function clearCourtSearch() {
    if (courtSearchInput) courtSearchInput.value = '';
    onSearchCourtInput('');
}

function setCourtTypeFilter(type) {
    state.selectedCourtType = type;
    const select = document.getElementById('selectCourtType');
    if (select && select.value !== type) {
        select.value = type;
    }
    renderCinemaCourts();
}

function resetAllFilters() {
    state.selectedProvince = 'ALL';
    state.selectedDistrict = 'ALL';
    state.searchCourtKeyword = '';
    state.selectedCourtType = 'ALL';

    if (selectProvince) selectProvince.value = 'ALL';
    updateDistrictOptions();
    if (courtSearchInput) {
        courtSearchInput.value = '';
        if (btnCourtSearchClear) btnCourtSearchClear.style.display = 'none';
    }
    const selectCourtType = document.getElementById('selectCourtType');
    if (selectCourtType) selectCourtType.value = 'ALL';
    setSessionFilter('ALL');
    renderCinemaCourts();
    showToast('Đã đặt lại toàn bộ bộ lọc!', 'info');
}

function focusStep(stepNum) {
    if (stepNum === 1) {
        if (selectProvince) {
            selectProvince.focus();
            selectProvince.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (stepNum === 2) {
        if (courtSearchInput) {
            courtSearchInput.focus();
            courtSearchInput.select();
            courtSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (stepNum === 3) {
        scrollToSection('dateCarouselWrap');
    } else if (stepNum === 4) {
        const select = document.getElementById('selectCourtType');
        if (select) {
            select.focus();
            select.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (stepNum === 5) {
        scrollToSection('combosSection');
    }
}

function scrollToSection(elemId) {
    const el = document.getElementById(elemId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function getFilteredCourts() {
    return (state.courts || []).filter(court => {
        // 1. Province filter
        if (state.selectedProvince && state.selectedProvince !== 'ALL') {
            if (court.province !== state.selectedProvince) return false;
        }
        // 2. District filter
        if (state.selectedDistrict && state.selectedDistrict !== 'ALL') {
            if (court.district !== state.selectedDistrict) return false;
        }
        // 3. Court Type filter
        if (state.selectedCourtType && state.selectedCourtType !== 'ALL') {
            const cType = (court.courtType || '').toUpperCase();
            if (cType !== state.selectedCourtType) return false;
        }
        // 4. Keyword search (court name, facilityName, address, district, floorType)
        if (state.searchCourtKeyword && state.searchCourtKeyword.trim() !== '') {
            const kw = state.searchCourtKeyword.trim().toLowerCase();
            const textToSearch = [
                court.name || '',
                court.facilityName || '',
                court.address || '',
                court.district || '',
                court.province || '',
                court.floorType || '',
                court.courtType || ''
            ].join(' ').toLowerCase();

            if (!textToSearch.includes(kw)) return false;
        }
        return true;
    });
}

function updateWorkflowStepper(filteredCourts) {
    if (!filteredCourts) filteredCourts = getFilteredCourts();

    // Summary & Badges
    if (courtMatchBadge) {
        courtMatchBadge.innerHTML = `<i class="fa-solid fa-circle-check text-sport-green"></i> ${filteredCourts.length}/${state.courts.length} sân phù hợp`;
    }
    if (bfFilterSummaryText) {
        const parts = [];
        if (state.selectedProvince !== 'ALL') parts.push(`Tỉnh: ${state.selectedProvince}`);
        if (state.selectedDistrict !== 'ALL') parts.push(`Quận: ${state.selectedDistrict}`);
        if (state.searchCourtKeyword) parts.push(`Từ khóa: "${state.searchCourtKeyword}"`);
        if (state.selectedCourtType !== 'ALL') parts.push(`Loại: ${state.selectedCourtType}`);

        if (parts.length > 0) {
            bfFilterSummaryText.textContent = `Lọc theo: ${parts.join(' • ')}`;
        } else {
            bfFilterSummaryText.textContent = 'Hệ thống hiển thị đầy đủ các cơ sở sân tại Việt Nam';
        }
    }
}

function renderCinemaCourts() {
    cinemaCourtCards.innerHTML = '';
    if (!state.selectedSessionFilter) state.selectedSessionFilter = 'ALL';
    if (!state.collapsedLayers) state.collapsedLayers = {};

    const filteredCourts = getFilteredCourts();
    updateWorkflowStepper(filteredCourts);

    if (filteredCourts.length === 0) {
        cinemaCourtCards.innerHTML = `
            <div class="empty-courts-state">
                <div class="ecs-icon"><i class="fa-solid fa-magnifying-glass-location"></i></div>
                <div class="ecs-title">Không Tìm Thấy Sân Phù Hợp</div>
                <div class="ecs-desc">
                    Không có cơ sở sân nào thỏa mãn bộ lọc 
                    ${state.selectedProvince !== 'ALL' ? `tại <strong>${escapeHTML(state.selectedProvince)}</strong>` : ''}
                    ${state.searchCourtKeyword ? `với từ khóa "<strong>${escapeHTML(state.searchCourtKeyword)}</strong>"` : ''}
                    ${state.selectedCourtType !== 'ALL' ? `loại sân <strong>${escapeHTML(state.selectedCourtType)}</strong>` : ''}.
                    Vui lòng thử lại với các điều kiện khác hoặc đặt lại bộ lọc.
                </div>
                <button type="button" class="btn-reset-filter-action" onclick="resetAllFilters()">
                    <i class="fa-solid fa-arrow-rotate-left"></i> Đặt Lại Toàn Bộ Bộ Lọc
                </button>
            </div>
        `;
        return;
    }

    filteredCourts.forEach(court => {
        const slots = state.courtSlotsMap[court.id] || [];
        const card = document.createElement('div');
        card.className = 'hall-card';

        let badgeClass = 'hall-badge';
        let badgeName = 'TIÊU CHUẨN';
        const cType = (court.courtType || '').toUpperCase();
        if (cType === 'VIP' || court.name.includes('VIP')) {
            badgeClass += ' imax';
            badgeName = 'VIP BWF ARENA';
        } else if (cType === 'PRO' || court.name.includes('Pro')) {
            badgeClass += ' gold-class';
            badgeName = 'GOLD CLASS ENLIO';
        }

        // Lọc các lớp ca theo bộ lọc người dùng chọn
        const visibleSessions = state.selectedSessionFilter === 'ALL'
            ? COURT_SESSIONS
            : COURT_SESSIONS.filter(cs => cs.id === state.selectedSessionFilter);

        let sessionsHtml = '';
        visibleSessions.forEach(session => {
            const sessionSlots = slots.filter(session.filter);
            if (sessionSlots.length === 0) return;

            const availCount = sessionSlots.filter(s => s.status !== 'BOOKED').length;
            const hasSelectedInSession = sessionSlots.some(s => state.selectedSlotIds.has(s.slotId));
            const collapseKey = `${court.id}_${session.id}`;
            const isCollapsed = Boolean(state.collapsedLayers[collapseKey]) && !hasSelectedInSession;

            let slotsHtml = '';
            sessionSlots.forEach(slot => {
                const isBooked = (slot.status === 'BOOKED');
                const isSelected = state.selectedSlotIds.has(slot.slotId);

                let slotCls = 'st-slot-btn';
                if (slot.isPeakHour) slotCls += ' peak';
                if (isBooked) slotCls += ' soldout';
                else if (isSelected) slotCls += ' selected';

                slotsHtml += `
                    <div class="${slotCls}" onclick="toggleShowtime('${court.id}', '${slot.slotId}')">
                        <span class="st-time">${slot.startTime} ~ ${slot.endTime}</span>
                        <span class="st-price">${formatVND(slot.price)}</span>
                    </div>
                `;
            });

            const peakBadge = session.isPeak
                ? `<span class="sl-peak-pill"><i class="fa-solid fa-bolt"></i> Giờ Cao Điểm</span>`
                : '';

            const countBadgeClass = availCount > 0 ? 'avail' : 'full';
            const countBadgeText = availCount > 0
                ? `Còn ${availCount}/${sessionSlots.length} suất`
                : `Hết chỗ (0/${sessionSlots.length})`;

            sessionsHtml += `
                <div class="court-session-layer ${session.colorClass} ${session.isPeak ? 'peak-layer' : ''} ${isCollapsed ? 'collapsed' : ''}">
                    <div class="session-layer-bar" onclick="toggleSessionLayer('${court.id}', '${session.id}')">
                        <div class="sl-bar-left">
                            <span class="sl-icon"><i class="${session.icon}"></i></span>
                            <div class="sl-title-group">
                                <span class="sl-name">${session.name}</span>
                                <span class="sl-hours">${session.timeRange}</span>
                            </div>
                            ${peakBadge}
                        </div>
                        <div class="sl-bar-right">
                            <span class="sl-count-badge ${countBadgeClass}">
                                <i class="fa-solid fa-circle-dot"></i> ${countBadgeText}
                            </span>
                            <i class="fa-solid fa-chevron-down sl-chevron"></i>
                        </div>
                    </div>
                    <div class="session-slots-grid">
                        ${slotsHtml}
                    </div>
                </div>
            `;
        });

        const totalAvail = slots.filter(s => s.status !== 'BOOKED').length;

        card.innerHTML = `
            <div class="hall-header">
                <div class="hall-info-left">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span class="${badgeClass}">${badgeName}</span>
                        <span class="hall-name">${escapeHTML(court.name)}</span>
                        <span class="hall-specs">(${escapeHTML(court.floorType)})</span>
                    </div>
                    <div class="hall-location-row">
                        <span class="hall-location-badge">
                            <i class="fa-solid fa-building-flag"></i> ${escapeHTML(court.facilityName || 'Cụm Sân Thể Thao')}
                        </span>
                        <span class="hall-district-pill">
                            <i class="fa-solid fa-location-dot"></i> ${escapeHTML(court.address || '')}${court.district ? ', ' + escapeHTML(court.district) : ''}${court.province ? ', ' + escapeHTML(court.province) : ''}
                        </span>
                        <span class="hall-lighting-badge">
                            <i class="fa-solid fa-lightbulb"></i> ${escapeHTML(court.lighting || 'Đèn LED 300 Lux')}
                        </span>
                    </div>
                </div>
                <div class="hall-header-right">
                    <div class="hall-price-tag">
                        Giá từ: ${formatVND(court.basePrice)}/h
                    </div>
                    <div class="hall-total-slots">
                        <i class="fa-regular fa-calendar-check text-pastel-mint"></i> Còn ${totalAvail}/${slots.length} suất
                    </div>
                </div>
            </div>
            <div class="hall-layers-container">
                ${sessionsHtml}
            </div>
        `;

        cinemaCourtCards.appendChild(card);
    });
}

function toggleShowtime(courtId, slotId) {
    const court = state.courts.find(c => c.id === courtId);
    const slots = state.courtSlotsMap[courtId] || [];
    const slot = slots.find(s => s.slotId === slotId);

    if (!slot || slot.status === 'BOOKED') return;

    // Nếu chọn sang sân khác -> chuyển đổi sân đang chọn
    if (state.selectedCourt && state.selectedCourt.id !== courtId) {
        state.selectedSlotIds.clear();
    }

    state.selectedCourt = court;

    if (state.selectedSlotIds.has(slotId)) {
        state.selectedSlotIds.delete(slotId);
        if (state.selectedSlotIds.size === 0) {
            state.selectedCourt = null;
        }
    } else {
        state.selectedSlotIds.add(slotId);
    }

    renderCinemaCourts();
    updateBottomBar();
}

const SERVICE_CATEGORIES = [
    {
        id: 'SHUTTLECOCK',
        name: 'LỚP CẦU LÔNG',
        subName: '+ Các loại quả cầu thi đấu & tập luyện tiêu chuẩn',
        typeLabel: 'Loại cầu',
        accentColor: '#FFD600',
        badge: 'Quả Cầu Thi Đấu',
        iconType: 'shuttlecock'
    },
    {
        id: 'RENTAL',
        name: 'LỚP THUÊ VỢT CẦU LÔNG',
        subName: '+ Các loại vợt chính hãng Yonex, Lining căng cước sẵn sàng',
        typeLabel: 'Loại vợt',
        accentColor: '#00E5FF',
        badge: 'Vợt Cầu Lông',
        iconType: 'badminton-racket'
    },
    {
        id: 'BEVERAGE',
        name: 'LỚP NƯỚC GIẢI KHÁT & BÙ KHOÁNG',
        subName: '+ Các loại nước ướp lạnh bù khoáng, điện giải & tinh khiết',
        typeLabel: 'Loại nước',
        accentColor: '#00E676',
        badge: 'Giải Khát & Bù Khoáng',
        iconType: 'beverage'
    },
    {
        id: 'ACCESSORY',
        name: 'LỚP QUẤN CÁN VỢT & PHỤ KIỆN',
        subName: '+ Các loại quấn cán êm ái, thấm mồ hôi, bao quấn tại chỗ',
        typeLabel: 'Loại cuốn vợt',
        accentColor: '#B388FF',
        badge: 'Phụ Kiện Sân',
        iconType: 'accessory'
    }
];

function getBadmintonRacketIconSvg() {
    return `<svg class="badminton-racket-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="15.5" cy="8.5" rx="5.2" ry="6.2" transform="rotate(-35 15.5 8.5)"/>
        <line x1="11.5" y1="6" x2="19.5" y2="11" stroke-width="0.8" stroke-opacity="0.7"/>
        <line x1="13.2" y1="4.2" x2="17.8" y2="12.8" stroke-width="0.8" stroke-opacity="0.7"/>
        <line x1="11.2" y1="12.6" x2="4.5" y2="19.3" stroke-width="2"/>
        <line x1="4.5" y1="19.3" x2="2.2" y2="21.6" stroke-width="3.2"/>
    </svg>`;
}

function getShuttlecockIconSvg() {
    return `<svg class="shuttlecock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21a2.6 2.6 0 0 0 2.6-2.6c0-1.44-1.16-2.6-2.6-2.6s-2.6 1.16-2.6 2.6c0 1.44 1.16 2.6 2.6 2.6z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M9.4 15.8L5.5 4h13l-3.9 11.8"/>
        <path d="M6.8 8h10.4"/>
        <path d="M8 12h8"/>
    </svg>`;
}

function renderCombos() {
    if (!combosGrid) return;
    combosGrid.innerHTML = '';

    SERVICE_CATEGORIES.forEach(cat => {
        const catItems = state.services.filter(s => s.category === cat.id);
        if (catItems.length === 0) return;

        const layerEl = document.createElement('div');
        layerEl.className = `service-category-layer cat-${cat.id.toLowerCase()}`;

        let catIconHtml = '';
        if (cat.iconType === 'badminton-racket') {
            catIconHtml = getBadmintonRacketIconSvg();
        } else if (cat.iconType === 'shuttlecock') {
            catIconHtml = getShuttlecockIconSvg();
        } else if (cat.iconType === 'beverage') {
            catIconHtml = '<i class="fa-solid fa-bottle-water"></i>';
        } else {
            catIconHtml = '<i class="fa-solid fa-tape"></i>';
        }

        const headerEl = document.createElement('div');
        headerEl.className = 'scl-header';
        headerEl.innerHTML = `
            <div class="scl-header-left">
                <div class="scl-icon-box" style="color: ${cat.accentColor}; background: ${cat.accentColor}18; border-color: ${cat.accentColor}40;">
                    ${catIconHtml}
                </div>
                <div class="scl-title-box">
                    <div class="scl-title-row">
                        <span class="scl-title">${cat.name}</span>
                        <span class="scl-type-tag" style="color: ${cat.accentColor}; border-color: ${cat.accentColor}40; background: ${cat.accentColor}15;">
                            ${cat.badge}
                        </span>
                    </div>
                    <span class="scl-sub">${cat.subName}</span>
                </div>
            </div>
            <div class="scl-header-right">
                <span class="scl-count-pill">
                    <i class="fa-solid fa-circle-check" style="color: ${cat.accentColor};"></i> ${catItems.length} ${cat.typeLabel}
                </span>
            </div>
        `;

        const gridEl = document.createElement('div');
        gridEl.className = 'scl-cards-grid';

        catItems.forEach(item => {
            const isSelected = state.selectedServiceIds.has(item.id);
            const card = document.createElement('div');
            card.className = `combo-card ${isSelected ? 'selected' : ''}`;

            let itemIconHtml = '';
            if (cat.id === 'RENTAL') {
                itemIconHtml = getBadmintonRacketIconSvg();
            } else if (cat.id === 'SHUTTLECOCK') {
                itemIconHtml = getShuttlecockIconSvg();
            } else if (cat.id === 'BEVERAGE') {
                itemIconHtml = '<i class="fa-solid fa-bottle-water"></i>';
            } else {
                itemIconHtml = '<i class="fa-solid fa-tape"></i>';
            }

            card.innerHTML = `
                <div class="combo-left">
                    <div class="combo-icon-box" style="color: ${cat.accentColor};">
                        ${itemIconHtml}
                    </div>
                    <div>
                        <div class="combo-name">${escapeHTML(item.name)}</div>
                        <div class="combo-sub-kind"><i class="fa-solid fa-tag" style="font-size: 10px;"></i> ${cat.typeLabel}</div>
                        <div class="combo-price">${formatVND(item.unitPrice)} <span class="combo-unit">/ ${escapeHTML(item.unit)}</span></div>
                    </div>
                </div>
                <input type="checkbox" class="combo-checkbox" ${isSelected ? 'checked' : ''}>
            `;

            card.onclick = () => {
                if (state.selectedServiceIds.has(item.id)) {
                    state.selectedServiceIds.delete(item.id);
                } else {
                    state.selectedServiceIds.add(item.id);
                }
                renderCombos();
                updateBottomBar();
                updateWorkflowStepper();
            };

            gridEl.appendChild(card);
        });

        layerEl.appendChild(headerEl);
        layerEl.appendChild(gridEl);
        combosGrid.appendChild(layerEl);
    });
}

function renderTicketStubs() {
    ticketStubsGrid.innerHTML = '';

    // Khi CHƯA ĐĂNG NHẬP: Tuyệt đối KHÔNG hiển thị vé nào của hệ thống (kể cả vé demo)!
    if (!state.currentCustomer) {
        if (ticketCountBadge) ticketCountBadge.textContent = '0';

        const unauthBox = document.createElement('div');
        unauthBox.className = 'tickets-unauth-box';
        unauthBox.style.gridColumn = '1 / -1';
        unauthBox.style.textAlign = 'center';
        unauthBox.style.padding = '50px 24px';
        unauthBox.style.background = '#181820';
        unauthBox.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
        unauthBox.style.borderRadius = '12px';
        unauthBox.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';

        unauthBox.innerHTML = `
            <div style="font-size: 52px; color: var(--sport-cyan); margin-bottom: 16px; opacity: 0.9;">
                <i class="fa-solid fa-ticket-simple"></i>
            </div>
            <h3 style="font-size: 19px; color: #FFFFFF; font-weight: 800; margin-bottom: 8px;">
                Vui lòng đăng nhập để xem vé của bạn
            </h3>
            <p style="font-size: 13.5px; color: #94A3B8; max-width: 480px; margin: 0 auto 24px; line-height: 1.6;">
                Bạn cần đăng nhập tài khoản khách hàng để xem danh sách vé đã đặt, mã QR check-in vào sân và quản lý lịch thi đấu.
            </p>
            <div style="display: inline-flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <button type="button" class="btn-customer-auth btn-login-pill" onclick="openCustomerAuthModal('login')" style="padding: 10px 22px; font-size: 14px;">
                    <i class="fa-solid fa-right-to-bracket text-gold"></i> Đăng Nhập Ngay
                </button>
                <button type="button" class="btn-customer-auth btn-customer-reg" onclick="openCustomerAuthModal('register')" style="padding: 10px 22px; font-size: 14px;">
                    <i class="fa-solid fa-user-plus text-sport-green"></i> Đăng Ký Thành Viên Mới
                </button>
            </div>
        `;
        ticketStubsGrid.appendChild(unauthBox);
        return;
    }

    // Khi ĐÃ ĐĂNG NHẬP: Lọc CHÍNH XÁC chỉ các vé thuộc về tài khoản khách hàng hiện tại
    const myBookings = state.bookings.filter(b => b.customer && (
        (state.currentCustomer.phone && b.customer.phone === state.currentCustomer.phone) ||
        (state.currentCustomer.fullName && b.customer.fullName.trim().toLowerCase() === state.currentCustomer.fullName.trim().toLowerCase()) ||
        (state.currentCustomer.email && b.customer.email === state.currentCustomer.email)
    ));

    if (ticketCountBadge) ticketCountBadge.textContent = myBookings.length;

    // Banner hiển thị tên khách hàng
    const bannerBox = document.createElement('div');
    bannerBox.style.gridColumn = '1 / -1';
    bannerBox.style.marginBottom = '12px';
    bannerBox.innerHTML = `
        <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 13px; color: #fff;">
                <i class="fa-solid fa-circle-check text-sport-green"></i> Đang hiển thị vé của tài khoản: <strong class="text-sport-cyan">${escapeHTML(state.currentCustomer.fullName)}</strong> (${escapeHTML(state.currentCustomer.phone || state.currentCustomer.username)})
            </div>
            <div style="font-size: 12px; color: #A0A5B5;">
                Tổng số vé của bạn: <strong class="text-sport-green">${myBookings.length}</strong> vé
            </div>
        </div>
    `;
    ticketStubsGrid.appendChild(bannerBox);

    if (myBookings.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.gridColumn = '1 / -1';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.padding = '48px 20px';
        emptyDiv.style.color = '#888';
        emptyDiv.innerHTML = `
            <i class="fa-solid fa-ticket" style="font-size: 44px; color: #444; margin-bottom: 14px; display: block;"></i>
            <h4 style="font-size: 16px; color: #ccc; margin-bottom: 6px;">Bạn chưa có cuống vé nào</h4>
            <p style="font-size: 13px; color: #777; margin-bottom: 18px;">Hãy chọn sân và khung giờ thi đấu yêu thích để tiến hành đặt sân ngay!</p>
            <button class="btn-customer-auth btn-customer-reg" onclick="switchCgvView('booking')">
                <i class="fa-solid fa-calendar-plus"></i> Đặt Lịch Sân Ngay
            </button>
        `;
        ticketStubsGrid.appendChild(emptyDiv);
        return;
    }

    myBookings.forEach(b => {
        const card = document.createElement('div');
        card.className = 'cgv-ticket-item';

        let statusText = 'ĐÃ XÁC NHẬN';
        if (b.status === 'CHECKED_IN') statusText = 'ĐÃ CHECK-IN TẠI RẠP';
        else if (b.status === 'CANCELLED') statusText = 'ĐÃ HỦY';

        const slotsText = b.slots.map(s => `${s.startTime} ~ ${s.endTime}`).join(', ');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(b.bookingCode)}`;

        card.innerHTML = `
            <div class="ti-top-bar">
                <span class="ti-code"><i class="fa-solid fa-barcode"></i> ${b.bookingCode}</span>
                <span class="ti-status-tag ${b.status}">${statusText}</span>
            </div>
            <div class="ti-content">
                <div class="ti-row"><span>Rạp/Sân:</span> <strong>${escapeHTML(b.courtName)}</strong></div>
                <div class="ti-row"><span>Ngày thi đấu:</span> <strong>${formatDateVN(b.date)}</strong></div>
                <div class="ti-row"><span>Suất giờ:</span> <strong class="text-gold">${slotsText}</strong></div>
                <div class="ti-row"><span>Khách hàng:</span> <span>${escapeHTML(b.customer ? b.customer.fullName : '')}</span></div>
                <div class="ti-row" style="margin-top: 4px;">
                    <span>Tổng tiền vé:</span>
                    <strong class="text-cgv-red" style="font-size: 15px;">${formatVND(b.totalAmount)}</strong>
                </div>
            </div>
            <div class="ti-actions">
                ${b.status === 'CONFIRMED' ? `
                    <button class="btn-ti-checkin" onclick="checkInTicket('${b.bookingCode}')">
                        <i class="fa-solid fa-qrcode"></i> Quét Check-in
                    </button>
                    <button class="btn-ti-cancel" onclick="cancelTicket('${b.bookingCode}')">
                        <i class="fa-solid fa-ban"></i> Hủy Vé
                    </button>
                ` : `
                    <div style="font-size: 11px; color: #888; width: 100%; text-align: center;">
                        ${b.status === 'CHECKED_IN' ? '✅ Khách đã vào sân' : '🚫 Vé đã bị hủy'}
                    </div>
                `}
            </div>
        `;

        ticketStubsGrid.appendChild(card);
    });
}

// ==========================================================================
// CGV BOTTOM BAR & TOTALS
// ==========================================================================
function calculateTotals() {
    let courtTotal = 0;
    const selectedSlotObjs = [];

    if (state.selectedCourt) {
        const slots = state.courtSlotsMap[state.selectedCourt.id] || [];
        state.selectedSlotIds.forEach(id => {
            const s = slots.find(item => item.slotId === id);
            if (s) {
                courtTotal += s.price;
                selectedSlotObjs.push(s);
            }
        });
    }

    let serviceTotal = 0;
    const selectedServiceNames = [];
    state.selectedServiceIds.forEach(id => {
        const s = state.services.find(item => item.id === id);
        if (s) {
            serviceTotal += s.unitPrice;
            selectedServiceNames.push(s.name);
        }
    });

    return {
        courtTotal,
        serviceTotal,
        total: courtTotal + serviceTotal,
        slots: selectedSlotObjs,
        serviceNames: selectedServiceNames
    };
}

function updateBottomBar() {
    const { courtTotal, serviceTotal, total, slots, serviceNames } = calculateTotals();

    if (state.bookingDateMode === 'recurring') {
        const checkedLabels = Array.from(document.querySelectorAll('input[name="rcDay"]:checked')).map(cb => cb.parentElement.textContent.trim());
        const dur = document.querySelector('input[name="rcDuration"]:checked')?.value || '1';
        bbDate.textContent = `Định kỳ: ${checkedLabels.join(', ')} (${dur} tuần)`;
    } else {
        bbDate.textContent = formatDateVN(state.selectedDate);
    }

    if (state.selectedCourt && slots.length > 0) {
        bbCourtName.textContent = state.selectedCourt.name;
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        bbSlots.textContent = slots.map(s => `${s.startTime}~${s.endTime}`).join(', ');
        bbCombos.textContent = serviceNames.length > 0 ? `${serviceNames.length} dịch vụ/phụ kiện` : 'Chưa chọn tiện ích';
        bbTotalPrice.textContent = formatVND(total);
        btnOpenCgvCheckout.disabled = false;
    } else {
        bbCourtName.textContent = 'Chưa chọn sân & giờ';
        bbSlots.textContent = 'Chưa chọn suất';
        bbCombos.textContent = 'Không có combo';
        bbTotalPrice.textContent = '0 ₫';
        btnOpenCgvCheckout.disabled = false; // allow clicking only if ready
        btnOpenCgvCheckout.disabled = true;
    }
}

// ==========================================================================
// CHECKOUT MODAL & BOOKING
// ==========================================================================
function openCheckoutModal() {
    if (!state.currentCustomer) {
        showToast('Vui lòng đăng nhập hoặc đăng ký tài khoản thành viên để đặt vé!', 'info');
        openCustomerAuthModal('login');
        return;
    }

    const { total, slots, serviceNames } = calculateTotals();

    if (!state.selectedCourt || slots.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 suất giờ!', 'error');
        return;
    }

    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    mCourtName.textContent = state.selectedCourt.name.toUpperCase();
    if (state.bookingDateMode === 'recurring') {
        const checkedLabels = Array.from(document.querySelectorAll('input[name="rcDay"]:checked')).map(cb => cb.parentElement.textContent.trim());
        const dur = document.querySelector('input[name="rcDuration"]:checked')?.value || '1';
        mDate.innerHTML = `<span style="background:rgba(0,229,255,0.2);color:#00E5FF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;margin-right:5px;">LỊCH ĐỊNH KỲ</span> ${checkedLabels.join(', ')} • ${dur} tuần`;
    } else {
        mDate.textContent = formatDateVN(state.selectedDate);
    }
    mSlots.textContent = slots.map(s => `${s.startTime} ~ ${s.endTime}`).join(' | ');
    mCombos.textContent = serviceNames.length > 0 ? serviceNames.join(', ') : 'Không có';
    mTotalAmount.textContent = formatVND(total);

    // Auto-fill thông tin thành viên đang đăng nhập
    const custNameInput = document.getElementById('custName');
    const custPhoneInput = document.getElementById('custPhone');
    if (custNameInput && state.currentCustomer.fullName) {
        custNameInput.value = state.currentCustomer.fullName;
    }
    if (custPhoneInput && state.currentCustomer.phone) {
        custPhoneInput.value = state.currentCustomer.phone;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const note = `DATLICH${randomCode}`;
    qrTransferNote.textContent = note;

    const qrData = `2|99|0908123456|DATLICH ARENA|booking@datlich.vn|0|0|${total}|${note}|transfer_myqr`;
    dynamicQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;

    checkoutModal.classList.add('show');
}

async function submitBooking() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

    const payload = {
        customerName: name || (state.currentCustomer ? state.currentCustomer.fullName : 'Khách Chơi Cầu Lông'),
        customerPhone: phone || (state.currentCustomer ? state.currentCustomer.phone : '0908123456'),
        customerEmail: (state.currentCustomer && state.currentCustomer.email) ? state.currentCustomer.email : 'member@datlich.vn',
        courtId: state.selectedCourt.id,
        date: state.selectedDate,
        slotIds: Array.from(state.selectedSlotIds),
        serviceIds: Array.from(state.selectedServiceIds),
        paymentMethod: payMethod
    };

    btnFinishBooking.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XUẤT VÉ ĐIỆN TỬ...';
    btnFinishBooking.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        btnFinishBooking.innerHTML = '<i class="fa-solid fa-circle-check"></i> XÁC NHẬN THANH TOÁN & IN VÉ ĐIỆN TỬ';
        btnFinishBooking.disabled = false;

        if (data.success) {
            checkoutModal.classList.remove('show');
            state.selectedSlotIds.clear();
            state.selectedServiceIds.clear();
            state.selectedCourt = null;
            updateBottomBar();

            await Promise.all([loadAllCourtSlots(), loadBookings(), loadServices()]);
            showSuccessStub(data.booking);
            showToast('Đặt vé thành công! Chúc bạn có trận đấu bùng nổ.', 'success');
        } else {
            showToast(data.message || 'Lỗi đặt vé!', 'error');
        }
    } catch (e) {
        btnFinishBooking.innerHTML = '<i class="fa-solid fa-circle-check"></i> XÁC NHẬN THANH TOÁN & IN VÉ ĐIỆN TỬ';
        btnFinishBooking.disabled = false;
        showToast('Không thể kết nối máy chủ Java!', 'error');
    }
}

function showSuccessStub(booking) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(booking.bookingCode)}`;

    ticketSuccessBody.innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 11px; color: var(--sport-cyan); font-weight: 800; letter-spacing: 2px;">VÉ THI ĐẤU CẦU LÔNG • MATCH TICKET PASS</div>
            <div style="font-family: var(--font-cinema); font-size: 26px; font-weight: 800; color: #fff; letter-spacing: 2px; margin: 4px 0 10px;">
                ${booking.bookingCode}
            </div>

            <div style="width: 150px; height: 150px; background: #fff; padding: 6px; border-radius: 6px; margin: 0 auto 12px; box-shadow: 0 0 20px rgba(0, 229, 255, 0.35);">
                <img src="${qrUrl}" alt="QR Stub" style="width: 100%; height: 100%;">
            </div>
            
            <p style="font-size: 12px; color: #A0A5B5; margin-bottom: 16px;">
                Đưa mã QR này cho nhân viên quầy vé / tiếp tân để check-in vào sân thi đấu.
            </p>

            <div class="cinema-ticket-preview" style="text-align: left;">
                <div class="ct-left">
                    <div class="ct-brand">HỆ THỐNG SÂN CẦU LÔNG TIÊU CHUẨN</div>
                    <div class="ct-title">${escapeHTML(booking.courtName)}</div>
                    <div class="ct-info-row">Ngày: <strong>${formatDateVN(booking.date)}</strong></div>
                    <div class="ct-info-row">Khách: <strong>${escapeHTML(booking.customer.fullName)} (${escapeHTML(booking.customer.phone)})</strong></div>
                </div>
                <div class="ct-divider">
                    <span class="notch notch-top"></span>
                    <span class="notch notch-bottom"></span>
                </div>
                <div class="ct-right">
                    <span class="ct-price-label">ĐÃ THANH TOÁN</span>
                    <span class="ct-price-num">${formatVND(booking.totalAmount)}</span>
                    <span class="ct-seat-type">CONFIRMED</span>
                </div>
            </div>

            <button class="btn-cgv-submit" style="width: 100%; margin-top: 16px;" onclick="ticketSuccessModal.classList.remove('show'); switchCgvView('tickets');">
                <i class="fa-solid fa-ticket"></i> XEM DANH SÁCH CUỐNG VÉ
            </button>
        </div>
    `;

    ticketSuccessModal.classList.add('show');
}

// ==========================================================================
// TICKET ACTIONS
// ==========================================================================
async function checkInTicket(code) {
    if (!confirm(`Xác nhận khách hàng đã đến rạp/sân check-in mã vé [${code}]?`)) return;
    try {
        const res = await fetch(`${API_BASE}/checkin?code=${encodeURIComponent(code)}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast('Check-in mã vé thành công!', 'success');
            await loadBookings();
        } else {
            showToast(data.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi khi check-in', 'error');
    }
}

async function cancelTicket(code) {
    if (!confirm(`Bạn có chắc muốn hủy cuống vé [${code}]?`)) return;
    try {
        const res = await fetch(`${API_BASE}/cancel?code=${encodeURIComponent(code)}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast('Đã hủy vé thành công!', 'success');
            await Promise.all([loadBookings(), loadAllCourtSlots()]);
        } else {
            showToast(data.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi khi hủy vé', 'error');
    }
}

// ==========================================================================
// CUSTOMER AUTHENTICATION & SESSION MANAGEMENT
// ==========================================================================

/**
 * Kiểm tra trạng thái đăng nhập của khách hàng từ sessionStorage
 */
function checkCustomerSession() {
    const saved = sessionStorage.getItem('datlich_customer_user');
    const unauthBox = document.getElementById('custUnauthBox');
    const authBox = document.getElementById('custAuthBox');
    const sessionName = document.getElementById('custSessionName');
    const memberPrompt = document.getElementById('checkoutMemberPrompt');

    if (saved) {
        try {
            const user = JSON.parse(saved);
            if (user && (user.role === 'USER' || user.role === 'CUSTOMER')) {
                state.currentCustomer = user;
                if (unauthBox) unauthBox.style.display = 'none';
                if (authBox) authBox.style.display = 'flex';
                if (memberPrompt) memberPrompt.style.display = 'none';
                if (sessionName) {
                    let displayName = user.fullName || user.username || 'Khách Hàng';
                    displayName = displayName.replace(/\s*\(.*?\)/g, '').trim();
                    sessionName.textContent = displayName;
                    sessionName.title = user.fullName || user.username;
                }

                // Tự động điền thông tin vào form đặt lịch nếu có
                const custName = document.getElementById('custName');
                const custPhone = document.getElementById('custPhone');
                if (custName && user.fullName) custName.value = user.fullName;
                if (custPhone && user.phone) custPhone.value = user.phone;

                // Cập nhật giao diện cuống vé
                if (typeof renderTicketStubs === 'function') renderTicketStubs();
                return;
            }
        } catch (e) {}
    }

    state.currentCustomer = null;
    if (unauthBox) unauthBox.style.display = 'flex';
    if (authBox) authBox.style.display = 'none';
    if (memberPrompt) memberPrompt.style.display = 'flex';
    if (typeof renderTicketStubs === 'function') renderTicketStubs();
}

/**
 * Mở modal Đăng nhập / Đăng ký của Khách Hàng
 */
function openCustomerAuthModal(tab = 'login') {
    const modal = document.getElementById('customerAuthModal');
    if (modal) {
        modal.classList.add('show');
        switchAuthTab(tab);
    }
}

/**
 * Đóng modal Khách Hàng
 */
function closeCustomerAuthModal() {
    const modal = document.getElementById('customerAuthModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Chuyển đổi giữa 2 tab: Đăng nhập vs Đăng ký
 */
function switchAuthTab(tab) {
    const btnTabLogin = document.getElementById('btnTabLogin');
    const btnTabRegister = document.getElementById('btnTabRegister');
    const formLogin = document.getElementById('formCustLogin');
    const formRegister = document.getElementById('formCustRegister');
    const modalTitle = document.getElementById('authModalTitle');

    if (tab === 'login') {
        if (btnTabLogin) btnTabLogin.classList.add('active');
        if (btnTabRegister) btnTabRegister.classList.remove('active');
        if (formLogin) formLogin.style.display = 'block';
        if (formRegister) formRegister.style.display = 'none';
        if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-circle-user text-gold"></i> ĐĂNG NHẬP KHÁCH HÀNG';
    } else {
        if (btnTabRegister) btnTabRegister.classList.add('active');
        if (btnTabLogin) btnTabLogin.classList.remove('active');
        if (formRegister) formRegister.style.display = 'block';
        if (formLogin) formLogin.style.display = 'none';
        if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-user-plus text-gold"></i> ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG';
    }
}

/**
 * Xử lý Khách hàng đăng nhập
 */
async function handleCustomerLogin(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const userInput = document.getElementById('custLoginUser');
    const passInput = document.getElementById('custLoginPass');
    const btnSubmit = document.getElementById('btnCustLoginSubmit');

    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
        showToast('Vui lòng nhập tên đăng nhập và mật khẩu!', 'error');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XÁC THỰC...';
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, expectedRole: 'USER' })
        });
        const data = await res.json();

        if (data.success && data.user) {
            if (data.user.role === 'ADMIN') {
                showToast('Tài khoản này là Quản Trị Viên! Vui lòng đăng nhập tại Cổng Admin (/admin/)', 'error');
                return;
            }
            if (data.user.role === 'OWNER') {
                showToast('Tài khoản này là Chủ Sân! Vui lòng đăng nhập tại Cổng Chủ Sân (/owner/)', 'error');
                return;
            }

            sessionStorage.setItem('datlich_customer_user', JSON.stringify(data.user));
            checkCustomerSession();
            closeCustomerAuthModal();
            showToast(`Chào mừng ${data.user.fullName} đã đăng nhập thành công!`, 'success');

            // Cập nhật lại danh sách vé nếu đang ở tab vé
            if (state.currentView === 'tickets') {
                renderTicketStubs();
            }
        } else {
            showToast(data.message || 'Sai tên đăng nhập hoặc mật khẩu!', 'error');
        }
    } catch (err) {
        console.error('Customer login error:', err);
        showToast('Không thể kết nối đến máy chủ xác thực! Hãy kiểm tra mạng hoặc thử lại.', 'error');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> ĐĂNG NHẬP THÀNH VIÊN';
        }
    }
}

/**
 * Xử lý Khách hàng đăng ký tài khoản mới
 */
async function handleCustomerRegister(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const fullName = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const btnSubmit = document.getElementById('btnCustRegisterSubmit');

    if (!fullName || !phone || !username || !password) {
        showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!', 'error');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG TẠO TÀI KHOẢN...';
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, phone, email, username, password })
        });
        const data = await res.json();

        if (data.success && data.user) {
            // Tự động lưu session đăng nhập cho khách hàng mới
            sessionStorage.setItem('datlich_customer_user', JSON.stringify(data.user));
            checkCustomerSession();
            closeCustomerAuthModal();
            showToast(`Đăng ký thành công! Chào mừng thành viên mới: ${data.user.fullName}!`, 'success');

            // Reset form
            const formReg = document.getElementById('formCustRegister');
            if (formReg) formReg.reset();

            // Nếu đang xem vé, cập nhật giao diện
            if (state.currentView === 'tickets') {
                renderTicketStubs();
            }
        } else {
            showToast(data.message || 'Lỗi khi đăng ký tài khoản!', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối đến máy chủ!', 'error');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-user-plus"></i> ĐĂNG KÝ TÀI KHOẢN NGAY';
        }
    }
}

/**
 * Đăng xuất tài khoản khách hàng
 */
function logoutCustomerAction() {
    sessionStorage.removeItem('datlich_customer_user');
    state.currentCustomer = null;
    checkCustomerSession();
    showToast('Đã đăng xuất tài khoản khách hàng.', 'info');
    if (state.currentView === 'tickets') {
        renderTicketStubs();
    }
}

function switchRole(role) {
    if (role === 'OWNER') {
        window.location.href = getEcosystemUrl('owner');
        return;
    }
    if (role === 'ADMIN') {
        window.location.href = getEcosystemUrl('admin');
        return;
    }
    if (role === 'USER') {
        window.location.href = getEcosystemUrl('customer');
        return;
    }
}

// ==========================================================================
// HELPERS
// ==========================================================================
function formatVND(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function formatDateVN(dateStr) {
    if (!dateStr) return '';
    const p = dateStr.split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dateStr;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, t => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[t] || t));
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check text-gold';
    else if (type === 'error') icon = 'fa-circle-exclamation text-cgv-red';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}
