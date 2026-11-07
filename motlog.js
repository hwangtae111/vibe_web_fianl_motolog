// Supabase Dashboard → Project Settings → API에서 값을 복사해 아래 따옴표 안에 붙여 넣으세요.
const SUPABASE_URL = "https://kgymrwfkcqjxaxmbdjet.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yhnFnxogcT0hVBwsH8PsyQ_fSPJJsZa";

// 브라우저에서 사용하는 Supabase 클라이언트입니다.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const MOTOLOG_RIDE_TYPES = Object.freeze([
  { code: 'R1', label: '출퇴근' },
  { code: 'R2', label: '일상 이동' },
  { code: 'R3', label: '가벼운 라이딩' },
  { code: 'R4', label: '당일 투어' },
  { code: 'R5', label: '숙박 투어' },
  { code: 'R6', label: '연습·점검 주행' },
  { code: 'R7', label: '모토캠핑' },
  { code: 'R99', label: '기타' }
]);

function getRideTypeLabel(code) {
  return MOTOLOG_RIDE_TYPES.find((item) => item.code === code)?.label || null;
}

function getRideTypeDisplay(code) {
  const label = getRideTypeLabel(code);
  return label ? `${label} (${code})` : `미분류(${code || '코드 없음'})`;
}

function fillRideTypeSelect(select, selectedCode = '', includeAllOption = false, extraCodes = []) {
  select.replaceChildren();
  if (includeAllOption) {
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '전체 라이딩 유형';
    select.append(allOption);
  } else {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '라이딩 유형을 선택하세요';
    placeholder.disabled = true;
    placeholder.selected = !selectedCode;
    select.append(placeholder);
  }
  const codes = [...MOTOLOG_RIDE_TYPES.map((item) => item.code), ...extraCodes.filter((code) => !getRideTypeLabel(code))];
  codes.forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = getRideTypeDisplay(code);
    option.selected = code === selectedCode;
    select.append(option);
  });
  if (selectedCode && ![...select.options].some((option) => option.value === selectedCode)) {
    const option = document.createElement('option');
    option.value = selectedCode;
    option.textContent = getRideTypeDisplay(selectedCode);
    option.selected = true;
    select.append(option);
  }
}

const MOTOLOG_MAINTENANCE_TYPES = Object.freeze([
  { code: 'F1', label: '엔진오일' }, { code: 'F2', label: '오일필터' },
  { code: 'F3', label: '에어필터' }, { code: 'F4', label: '체인·구동계' },
  { code: 'F5', label: '타이어·휠' }, { code: 'F6', label: '브레이크' },
  { code: 'F7', label: '배터리·전기' }, { code: 'F8', label: '엔진·점화' },
  { code: 'F9', label: '클러치·변속' }, { code: 'F10', label: '서스펜션·조향' },
  { code: 'F11', label: '연료·흡배기' }, { code: 'F12', label: '세차·외장 관리' },
  { code: 'F13', label: '종합 점검' }, { code: 'F14', label: '액세서리·장착' },
  { code: 'F99', label: '기타' }
]);

function getMaintenanceTypeLabel(code) {
  return MOTOLOG_MAINTENANCE_TYPES.find((item) => item.code === code)?.label || null;
}

function getMaintenanceTypeDisplay(code) {
  const label = getMaintenanceTypeLabel(code);
  return label ? `${label} (${code})` : `미분류(${code || '코드 없음'})`;
}

function defaultAffectsNextDue(code) {
  return !['F12', 'F14', 'F99'].includes(code);
}

function fillMaintenanceTypeSelect(select, selectedCode = '', includeAllOption = false, extraCodes = []) {
  select.replaceChildren();
  if (includeAllOption) {
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '전체 정비 코드';
    select.append(allOption);
  }
  const codes = [...MOTOLOG_MAINTENANCE_TYPES.map((item) => item.code), ...extraCodes.filter((code) => !getMaintenanceTypeLabel(code))];
  codes.forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = getMaintenanceTypeDisplay(code);
    option.selected = code === selectedCode || (!includeAllOption && !selectedCode && code === 'F1');
    select.append(option);
  });
}

const STORAGE_BUCKET = "bike-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BIKE_DRAFT_KEY = "motolog-bike-draft";

const authCard = document.querySelector("#authCard");
const authForm = document.querySelector("#authForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const passwordConfirmInput = document.querySelector("#passwordConfirmInput");
const passwordConfirmField = document.querySelector("#passwordConfirmField");
const submitButton = document.querySelector("#submitButton");
const modeButton = document.querySelector("#modeButton");
const modeQuestion = document.querySelector("#modeQuestion");
const modeSwitch = document.querySelector("#modeSwitch");
const authModeLabel = document.querySelector("#authModeLabel");
const messageBox = document.querySelector("#messageBox");
const appShell = document.querySelector("#appShell");
const appMessageBox = document.querySelector("#appMessageBox");
const headerUserEmail = document.querySelector("#headerUserEmail");
const homeButton = document.querySelector("#homeButton");
const memberButton = document.querySelector("#memberButton");
const memberPanel = document.querySelector("#memberPanel");
const memberForm = document.querySelector("#memberForm");
const memberEmailInput = document.querySelector("#memberEmailInput");
const displayNameInput = document.querySelector("#displayNameInput");
const displayNameError = document.querySelector("#displayNameError");
const saveMemberButton = document.querySelector("#saveMemberButton");
const closeMemberButton = document.querySelector("#closeMemberButton");
const logoutButton = document.querySelector("#logoutButton");
const dashboardView = document.querySelector("#dashboardView");
const bikesView = document.querySelector("#bikesView");
const ridesView = document.querySelector("#ridesView"), rideList=document.querySelector("#rideList"), rideStatus=document.querySelector("#rideStatus"), rideConditionSummary=document.querySelector('#rideConditionSummary'), rideBikeFilter=document.querySelector("#rideBikeFilter"), rideSearch=document.querySelector("#rideSearch"), rideStartDate=document.querySelector('#rideStartDate'), rideEndDate=document.querySelector('#rideEndDate'), rideTypeFilter=document.querySelector('#rideTypeFilter'), rideSort=document.querySelector('#rideSort'), resetRideFilters=document.querySelector('#resetRideFilters'), moreRides=document.querySelector("#moreRides");
const maintenanceView=document.querySelector('#maintenanceView');
const maintenanceList=document.querySelector('#maintenanceList'),maintenanceStatus=document.querySelector('#maintenanceStatus'),maintenanceBikeFilter=document.querySelector('#maintenanceBikeFilter'),maintenanceCodeFilter=document.querySelector('#maintenanceCodeFilter'),maintenanceStartDate=document.querySelector('#maintenanceStartDate'),maintenanceEndDate=document.querySelector('#maintenanceEndDate'),maintenanceSearch=document.querySelector('#maintenanceSearch'),moreMaintenance=document.querySelector('#moreMaintenance');
const rideDetailDialog=document.querySelector('#rideDetailDialog'),rideDetailTitle=document.querySelector('#rideDetailTitle'),rideDetailBody=document.querySelector('#rideDetailBody'),closeRideDetail=document.querySelector('#closeRideDetail');
const maintenanceDetailDialog=document.querySelector('#maintenanceDetailDialog'),maintenanceDetailTitle=document.querySelector('#maintenanceDetailTitle'),maintenanceDetailBody=document.querySelector('#maintenanceDetailBody'),closeMaintenanceDetail=document.querySelector('#closeMaintenanceDetail');
const recordEditDialog=document.querySelector('#recordEditDialog'),recordEditContent=document.querySelector('#recordEditContent');
const dashboardEmpty = document.querySelector("#dashboardEmpty");
const dashboardContent = document.querySelector("#dashboardContent");
const dashboardBikeCard = document.querySelector("#dashboardBikeCard");
const dashboardBikeSelect = document.querySelector("#dashboardBikeSelect");
const dashboardStatus = document.querySelector("#dashboardStatus");
const monthlyRideCount = document.querySelector("#monthlyRideCount");
const monthlyDistance = document.querySelector("#monthlyDistance");
const monthlyMaintenanceCost = document.querySelector("#monthlyMaintenanceCost");
const recentActivitiesList = document.querySelector('#recentActivitiesList');
const recentActivitiesStatus = document.querySelector('#recentActivitiesStatus');
const nextInspectionList = document.querySelector('#nextInspectionList');
const nextInspectionStatus = document.querySelector('#nextInspectionStatus');
const bikeFormPanel = document.querySelector("#bikeFormPanel");
const bikeResultPanel = document.querySelector("#bikeResultPanel");
const bikeList = document.querySelector("#bikeList");
const bikeForm = document.querySelector("#bikeForm");
const cancelBikeButton = document.querySelector("#cancelBikeButton");
const saveBikeButton = document.querySelector("#saveBikeButton");
const newBikeButton = document.querySelector("#newBikeButton");
const photoInput = document.querySelector("#photoInput");
const photoPreview = document.querySelector("#photoPreview");
const removePhotoButton = document.querySelector("#removePhotoButton");
const notesInput = document.querySelector("#notesInput");
const notesCount = document.querySelector("#notesCount");
const photoRetryBox = document.querySelector("#photoRetryBox");
const photoRetryText = document.querySelector("#photoRetryText");
const retryPhotoButton = document.querySelector("#retryPhotoButton");

const fields = {
  nickname: document.querySelector("#nicknameInput"), manufacturer: document.querySelector("#manufacturerInput"),
  model: document.querySelector("#modelInput"), modelYear: document.querySelector("#modelYearInput"),
  purchaseDate: document.querySelector("#purchaseDateInput"), odometer: document.querySelector("#odometerInput"), notes: notesInput
};
const errors = {
  email: document.querySelector("#emailError"), password: document.querySelector("#passwordError"), passwordConfirm: document.querySelector("#passwordConfirmError"),
  nickname: document.querySelector("#nicknameError"), manufacturer: document.querySelector("#manufacturerError"), model: document.querySelector("#modelError"),
  modelYear: document.querySelector("#modelYearError"), purchaseDate: document.querySelector("#purchaseDateError"), odometer: document.querySelector("#odometerError"), notes: document.querySelector("#notesError"), photo: document.querySelector("#photoError")
};

let isSignUpMode = false;
let currentSession = null;
let currentBike = null;
let selectedPhotoFile = null;
let photoPreviewUrl = null;
let pendingPhoto = null;
let sessionVersion = 0;
let activeTab = "dashboard";
let editingBike = null;
let bikeDraft = null;
let isBikeFormOpen = false;
let activeBikes = [];
let rideOffset=0, rideLoading=false, rideRequestId=0, lastRenderedRideMonth='', rideMonthSummaries=new Map(), filteredRideRecords=[];
let maintenanceOffset=0, maintenanceLoading=false;
let selectedDashboardBikeId = null;

fillMaintenanceTypeSelect(maintenanceCodeFilter, '', true);

function isConfigReady() {
  return !SUPABASE_URL.includes("YOUR_PROJECT_REF") && !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE");
}

function showMessage(target, text, type = "success") {
  target.textContent = text;
  target.className = `message ${type}`;
  target.hidden = false;
}
function clearMessage(target) { target.textContent = ""; target.className = "message"; target.hidden = true; }
function clearErrors(group) { Object.values(group).forEach((element) => { element.textContent = ""; }); }
function koreanError(error, fallback = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.") {
  const message = error?.message || "";
  if (/email not confirmed/i.test(message)) return "이메일 인증이 완료되지 않았습니다. 이메일의 인증 링크를 확인해 주세요.";
  if (/invalid login credentials/i.test(message)) return "이메일 또는 비밀번호를 확인해 주세요.";
  if (/already registered|already been registered/i.test(message)) return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (/row-level security|permission denied/i.test(message)) return "현재 계정에는 이 작업 권한이 없습니다.";
  if (/bucket|object not found/i.test(message)) return "사진 저장소 설정을 확인해 주세요.";
  return fallback;
}
function setAuthBusy(isBusy, text) { submitButton.disabled = isBusy; modeButton.disabled = isBusy; if (isBusy) showMessage(messageBox, text, "loading"); }
function setBikeBusy(isBusy, text) { saveBikeButton.disabled = isBusy; cancelBikeButton.disabled = isBusy; newBikeButton.disabled = isBusy; retryPhotoButton.disabled = isBusy; if (isBusy) showMessage(appMessageBox, text, "loading"); }
function getDisplayName() { return currentSession?.user?.user_metadata?.display_name || ""; }
function updateHeaderIdentity() { headerUserEmail.textContent = getDisplayName() || currentSession?.user?.email || ""; }

function updateAuthScreen() {
  const loggedIn = Boolean(currentSession);
  authCard.hidden = loggedIn;
  appShell.hidden = !loggedIn;
  if (loggedIn) return;
  authCard.classList.toggle("sign-up-mode", isSignUpMode);
  document.title = isSignUpMode ? "MotoLog | 회원가입" : "MotoLog | 로그인";
  authModeLabel.textContent = isSignUpMode ? "회원가입" : "로그인";
  document.querySelector("#pageTitle").textContent = isSignUpMode ? "MotoLog 회원가입" : "MotoLog에 로그인하세요";
  submitButton.textContent = isSignUpMode ? "회원가입" : "로그인";
  modeQuestion.textContent = isSignUpMode ? "이미 계정이 있으신가요?" : "처음 이용하시나요?";
  modeButton.textContent = isSignUpMode ? "로그인" : "회원가입";
  passwordInput.autocomplete = isSignUpMode ? "new-password" : "current-password";
  passwordConfirmInput.disabled = !isSignUpMode;
  passwordConfirmInput.required = isSignUpMode;
  passwordConfirmField.setAttribute("aria-hidden", String(!isSignUpMode));
  if (!isSignUpMode) passwordConfirmInput.value = "";
}

function validateAuth() {
  clearErrors({ email: errors.email, password: errors.password, passwordConfirm: errors.passwordConfirm });
  const email = emailInput.value.trim(); const password = passwordInput.value; let valid = true;
  if (!email || !emailInput.validity.valid) { errors.email.textContent = "올바른 이메일을 입력해 주세요."; valid = false; }
  if (password.length < 6) { errors.password.textContent = "비밀번호는 6자 이상 입력해 주세요."; valid = false; }
  if (isSignUpMode && password !== passwordConfirmInput.value) { errors.passwordConfirm.textContent = "비밀번호가 일치하지 않습니다."; valid = false; }
  return valid;
}

async function handleAuthSubmit(event) {
  event.preventDefault(); clearMessage(messageBox);
  if (!isConfigReady()) return showMessage(messageBox, "config.js에 Supabase URL과 Publishable key를 먼저 입력해 주세요.", "error");
  if (!validateAuth()) return;
  setAuthBusy(true, isSignUpMode ? "회원가입 중입니다…" : "로그인 중입니다…");
  const response = isSignUpMode
    ? await sb.auth.signUp({ email: emailInput.value.trim(), password: passwordInput.value })
    : await sb.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
  setAuthBusy(false);
  if (response.error) return showMessage(messageBox, koreanError(response.error, "회원 인증에 실패했습니다. 입력 내용을 확인해 주세요."), "error");
  if (isSignUpMode && !response.data.session) showMessage(messageBox, "회원가입이 완료되었습니다. 이메일 확인 후 로그인해 주세요.");
  else showMessage(messageBox, isSignUpMode ? "회원가입과 로그인이 완료되었습니다." : "로그인되었습니다.");
}

function koreaToday() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (name) => parts.find((part) => part.type === name).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function isWholeNumber(value) { return /^\d+$/.test(value); }
function setError(name, text) { errors[name].textContent = text; }
function cleanOptional(value) { const cleaned = value.trim(); return cleaned || null; }

function validateBikeForm() {
  clearErrors({ nickname: errors.nickname, manufacturer: errors.manufacturer, model: errors.model, modelYear: errors.modelYear, purchaseDate: errors.purchaseDate, odometer: errors.odometer, notes: errors.notes, photo: errors.photo });
  let valid = true;
  const nickname = fields.nickname.value.trim(); const manufacturer = fields.manufacturer.value.trim(); const model = fields.model.value.trim();
  const year = fields.modelYear.value.trim(); const date = fields.purchaseDate.value; const odometer = fields.odometer.value.trim(); const notes = fields.notes.value.trim();
  if (nickname.length > 50) { setError("nickname", "별명은 50자 이하로 입력해 주세요."); valid = false; }
  if (!manufacturer || manufacturer.length > 50) { setError("manufacturer", "제조사를 1~50자로 입력해 주세요."); valid = false; }
  if (!model || model.length > 50) { setError("model", "모델명을 1~50자로 입력해 주세요."); valid = false; }
  if (year && (!isWholeNumber(year) || Number(year) < 1000 || Number(year) > 9999)) { setError("modelYear", "연식은 1000~9999 사이의 정수로 입력해 주세요."); valid = false; }
  if (date && date > koreaToday()) { setError("purchaseDate", "구매일은 오늘 이후로 입력할 수 없습니다."); valid = false; }
  if (!odometer) { setError("odometer", "현재 계기판 주행거리를 입력해 주세요."); valid = false; }
  else if (!isWholeNumber(odometer)) { setError("odometer", "주행거리는 소수 없이 0 이상의 정수로 입력해 주세요."); valid = false; }
  if (notes.length > 2000) { setError("notes", "메모는 2,000자 이하로 입력해 주세요."); valid = false; }
  return valid;
}

function clearPhotoSelection() {
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = null; selectedPhotoFile = null; photoInput.value = ""; removePhotoButton.disabled = true;
  photoPreview.replaceChildren(); const icon = document.createElement("span"); icon.textContent = "🏍"; icon.setAttribute("aria-hidden", "true"); const text = document.createElement("p"); text.textContent = "사진 미등록"; photoPreview.append(icon, text);
}
function showPhotoPreview(file) {
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = URL.createObjectURL(file); selectedPhotoFile = file; removePhotoButton.disabled = false; photoPreview.replaceChildren();
  const image = document.createElement("img"); image.src = photoPreviewUrl; image.alt = "선택한 바이크 사진 미리보기"; photoPreview.append(image);
}
function validatePhoto(file) {
  errors.photo.textContent = "";
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) { setError("photo", "JPEG, PNG, WebP 사진만 선택할 수 있습니다."); return false; }
  if (file.size > MAX_PHOTO_SIZE) { setError("photo", "사진은 최대 5MB까지 선택할 수 있습니다."); return false; }
  return true;
}
function resetBikeForm() { bikeForm.reset(); clearErrors({ nickname: errors.nickname, manufacturer: errors.manufacturer, model: errors.model, modelYear: errors.modelYear, purchaseDate: errors.purchaseDate, odometer: errors.odometer, notes: errors.notes, photo: errors.photo }); clearPhotoSelection(); notesCount.textContent = "0"; }
function hasBikeFormInput() { return [...bikeForm.querySelectorAll("input:not([type=file]), textarea")].some((input) => input.value.trim()) || Boolean(selectedPhotoFile); }
function clearBikeDraft() {
  bikeDraft = null;
  try { sessionStorage.removeItem(BIKE_DRAFT_KEY); } catch (_error) { /* 저장소를 사용할 수 없는 브라우저 */ }
}
function rememberBikeDraft() {
  if (bikeFormPanel.hidden) return;
  bikeDraft = {
    nickname: fields.nickname.value, manufacturer: fields.manufacturer.value, model: fields.model.value,
    modelYear: fields.modelYear.value, purchaseDate: fields.purchaseDate.value, odometer: fields.odometer.value,
    notes: fields.notes.value, editingBikeId: editingBike?.id || null, hadSelectedPhoto: Boolean(selectedPhotoFile)
  };
  try { sessionStorage.setItem(BIKE_DRAFT_KEY, JSON.stringify(bikeDraft)); } catch (_error) { /* 저장소를 사용할 수 없는 브라우저 */ }
}
function restoreBikeDraft() {
  if (!bikeDraft) return;
  fields.nickname.value = bikeDraft.nickname; fields.manufacturer.value = bikeDraft.manufacturer; fields.model.value = bikeDraft.model;
  fields.modelYear.value = bikeDraft.modelYear; fields.purchaseDate.value = bikeDraft.purchaseDate; fields.odometer.value = bikeDraft.odometer;
  fields.notes.value = bikeDraft.notes; notesCount.textContent = bikeDraft.notes.length.toLocaleString("ko-KR");
  editingBike = bikeDraft.editingBikeId && currentBike?.id === bikeDraft.editingBikeId ? currentBike : null;
  if (bikeDraft.hadSelectedPhoto) showMessage(appMessageBox, "새로고침 후에는 사진 파일을 다시 선택해 주세요.", "loading");
}
function loadBikeDraftFromSession() {
  try {
    const savedDraft = sessionStorage.getItem(BIKE_DRAFT_KEY);
    if (!savedDraft) return;
    const parsedDraft = JSON.parse(savedDraft);
    if (parsedDraft && typeof parsedDraft === "object") {
      bikeDraft = parsedDraft;
      isBikeFormOpen = true;
    }
  } catch (_error) {
    clearBikeDraft();
  }
}

function formatDate(value) { if (!value) return "미입력"; return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "long" }).format(new Date(`${value}T00:00:00+09:00`)); }
function formatDateTime(value) { if (!value) return "미입력"; return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function bikeDisplayName(bike) { return bike.nickname || `${bike.manufacturer} ${bike.model}`; }
function addInfo(container, label, value) { const line = document.createElement("p"); const strong = document.createElement("strong"); strong.textContent = `${label}: `; line.append(strong, document.createTextNode(value)); container.append(line); }
function renderBikeCard(container, bike, includeEditButton = false) {
  container.replaceChildren(); const imageBox = document.createElement("div"); imageBox.className = "bike-summary-image"; imageBox.textContent = "🏍";
  const body = document.createElement("div"); const title = document.createElement("h2"); title.textContent = bikeDisplayName(bike); body.append(title);
  addInfo(body, "제조사 / 모델", `${bike.manufacturer} / ${bike.model}`); addInfo(body, "연식", bike.model_year ? String(bike.model_year) : "미입력"); addInfo(body, "현재 계기판", `${bike.current_odometer_km.toLocaleString("ko-KR")} km`); addInfo(body, "확인 시점", formatDateTime(bike.odometer_recorded_at)); addInfo(body, "구매일", formatDate(bike.purchase_date)); if (bike.notes) addInfo(body, "메모", bike.notes);
  container.append(imageBox, body);
  if (includeEditButton) {
    const editButton = document.createElement("button");
    editButton.type = "button"; editButton.className = "card-edit-button"; editButton.textContent = "✎";
    editButton.setAttribute("aria-label", "바이크 수정"); editButton.title = "바이크 수정";
    editButton.addEventListener("click", () => showBikeForm(bike));
    container.append(editButton);
  }
  if (bike.photo_path) loadBikeImage(imageBox, bike.photo_path, sessionVersion);
}
function getKoreanMonthRange() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const year = Number(value.year);
  const month = Number(value.month);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return { start: `${year}-${String(month).padStart(2, '0')}-01`, end: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01` };
}
async function fetchMonthlyRows(table, dateColumn, bikeIds, columns, version) {
  const range = getKoreanMonthRange();
  const rows = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.from(table).select(columns).eq('user_id', currentSession.user.id).in('bike_id', bikeIds).gte(dateColumn, range.start).lt(dateColumn, range.end).range(offset, offset + 999);
    if (version !== sessionVersion) return { cancelled: true };
    if (error) return { error };
    rows.push(...(data || []));
    if (!data || data.length < 1000) return { data: rows };
    offset += 1000;
  }
}
function populateDashboardBikeSelect() {
  dashboardBikeSelect.replaceChildren();
  if (!activeBikes.length) return;
  if (selectedDashboardBikeId && !activeBikes.some((bike) => bike.id === selectedDashboardBikeId)) selectedDashboardBikeId = null;
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = '전체 바이크';
  allOption.selected = !selectedDashboardBikeId;
  dashboardBikeSelect.append(allOption);
  activeBikes.forEach((bike) => {
    const option = document.createElement('option');
    option.value = bike.id;
    option.textContent = bikeDisplayName(bike);
    option.selected = bike.id === selectedDashboardBikeId;
    dashboardBikeSelect.append(option);
  });
}
function renderAllBikesDashboardCard(container) {
  container.replaceChildren();
  const imageBox = document.createElement('div');
  imageBox.className = 'bike-summary-image';
  imageBox.textContent = '🏍';
  const body = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = '전체 바이크';
  body.append(title);
  addInfo(body, '관리 중인 활성 바이크', `${activeBikes.length.toLocaleString('ko-KR')}대`);
  addInfo(body, '안내', '이번 달 기록과 최근 활동은 활성 바이크 전체를 합산해 표시합니다.');
  container.append(imageBox, body);
}
function renderRecentActivity(activity) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'recent-activity';
  const badge = document.createElement('span');
  badge.className = `activity-badge ${activity.kind}`;
  badge.textContent = activity.kind === 'ride' ? '라이딩' : '정비';
  const description = document.createElement('span');
  const title = document.createElement('span');
  title.className = 'activity-title';
  title.textContent = activity.record.title;
  const date = document.createElement('span');
  date.className = 'activity-date';
  date.textContent = formatDate(activity.activityDate);
  description.append(title, date);
  const value = document.createElement('span');
  value.className = 'activity-value';
  value.textContent = activity.kind === 'ride'
    ? `${Number(activity.record.distance_km || 0).toLocaleString('ko-KR')} km`
    : `${Number(activity.record.cost_krw || 0).toLocaleString('ko-KR')}원`;
  button.append(badge, description, value);
  button.addEventListener('click', () => {
    if (activity.kind === 'ride') openRideDetail(activity.record);
    else openMaintenanceDetail(activity.record);
  });
  recentActivitiesList.append(button);
}
async function loadRecentDashboardActivities(bikeIds, selectionKey, version) {
  recentActivitiesList.replaceChildren();
  recentActivitiesStatus.textContent = '최근 활동을 불러오는 중입니다…';
  const rideQuery = sb.from('riding_logs').select('id,title,ride_date,start_location,waypoints,end_location,distance_km,ride_type,notes,started_at,ended_at,bikes(nickname,manufacturer,model,status)').eq('user_id', currentSession.user.id).in('bike_id', bikeIds).order('ride_date', { ascending: false }).order('id', { ascending: true }).range(0, 4);
  const maintenanceQuery = sb.from('maintenance_logs').select('id,bike_id,title,maintenance_date,odometer_km,cost_krw,service_type,shop_name,next_due_date,notes,items,bikes(nickname,manufacturer,model,status)').eq('user_id', currentSession.user.id).in('bike_id', bikeIds).order('maintenance_date', { ascending: false }).order('id', { ascending: true }).range(0, 4);
  const [ridesResult, maintenanceResult] = await Promise.all([rideQuery, maintenanceQuery]);
  if (version !== sessionVersion || (selectedDashboardBikeId || 'all') !== selectionKey) return;
  if (ridesResult.error || maintenanceResult.error) {
    console.error('최근 활동 조회 실패:', ridesResult.error || maintenanceResult.error);
    recentActivitiesStatus.textContent = '최근 활동을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return;
  }
  const activities = [
    ...(ridesResult.data || []).map((record) => ({ kind: 'ride', record, activityDate: record.ride_date })),
    ...(maintenanceResult.data || []).map((record) => ({ kind: 'maintenance', record, activityDate: record.maintenance_date }))
  ].sort((first, second) => {
    const dateOrder = second.activityDate.localeCompare(first.activityDate);
    if (dateOrder) return dateOrder;
    const kindOrder = first.kind.localeCompare(second.kind);
    if (kindOrder) return kindOrder;
    return first.record.id.localeCompare(second.record.id);
  }).slice(0, 5);
  if (!activities.length) {
    recentActivitiesStatus.textContent = '최근 활동이 없습니다.';
    return;
  }
  activities.forEach(renderRecentActivity);
  recentActivitiesStatus.textContent = '';
}
function getKoreanTodayText() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
}
function addCalendarMonths(dateText, months) {
  const [year, month, day] = dateText.split('-').map(Number);
  const targetIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetIndex / 12);
  const targetMonthIndex = targetIndex % 12;
  const lastDay = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  return `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}
function daysFromToday(dateText, todayText) {
  const toUtc = (value) => { const [year, month, day] = value.split('-').map(Number); return Date.UTC(year, month - 1, day); };
  return Math.round((toUtc(dateText) - toUtc(todayText)) / 86400000);
}
async function fetchAllMaintenanceForInspection(bikeIds, version) {
  const records = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.from('maintenance_logs').select('id,bike_id,maintenance_date,items').eq('user_id', currentSession.user.id).in('bike_id', bikeIds).order('maintenance_date', { ascending: false }).order('id', { ascending: true }).range(offset, offset + 999);
    if (version !== sessionVersion) return { cancelled: true };
    if (error) return { error };
    records.push(...(data || []));
    if (!data || data.length < 1000) return { data: records };
    offset += 1000;
  }
}
function renderNextInspection(schedule) {
  const row = document.createElement('tr');
  const remainingText = schedule.remainingDays < 0 ? `${Math.abs(schedule.remainingDays).toLocaleString('ko-KR')}일 경과` : schedule.remainingDays === 0 ? '오늘' : `${schedule.remainingDays.toLocaleString('ko-KR')}일 남음`;
  const stateText = schedule.state === 'overdue' ? '기한 경과' : schedule.state === 'today' ? '오늘 점검' : '예정';
  [schedule.code, formatDate(schedule.lastDate), formatDate(schedule.dueDate), remainingText].forEach((value) => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); });
  const stateCell = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = `inspection-state ${schedule.state}`;
  badge.textContent = stateText;
  stateCell.append(badge);
  row.append(stateCell);
  nextInspectionList.append(row);
}
async function loadNextInspectionSchedule(bikeIds, selectionKey, version) {
  nextInspectionList.replaceChildren();
  nextInspectionStatus.textContent = '다음 점검을 계산하는 중입니다…';
  const result = await fetchAllMaintenanceForInspection(bikeIds, version);
  if (version !== sessionVersion || (selectedDashboardBikeId || 'all') !== selectionKey) return;
  if (result.error) {
    console.error('다음 점검 조회 실패:', result.error);
    nextInspectionStatus.textContent = '다음 점검을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return;
  }
  const latestByCode = new Map();
  (result.data || []).forEach((record) => {
    (Array.isArray(record.items) ? record.items : []).forEach((item) => {
      const code = typeof item?.type_code === 'string' ? item.type_code : '';
      if (!code || item.affects_next_due === false) return;
      const scheduleKey = `${record.bike_id}|${code}`;
      const previous = latestByCode.get(scheduleKey);
      if (!previous || record.maintenance_date > previous.record.maintenance_date || (record.maintenance_date === previous.record.maintenance_date && record.id.localeCompare(previous.record.id) < 0)) latestByCode.set(scheduleKey, { code, record });
    });
  });
  const today = getKoreanTodayText();
  const schedules = [...latestByCode.values()].map(({ code, record }) => {
    const dueDate = addCalendarMonths(record.maintenance_date, 6);
    const remainingDays = daysFromToday(dueDate, today);
    const bike = activeBikes.find((item) => item.id === record.bike_id);
    const typeDisplay = getMaintenanceTypeDisplay(code);
    const label = bikeIds.length > 1 ? `${bike ? bikeDisplayName(bike) : '바이크'} · ${typeDisplay}` : typeDisplay;
    return { code: label, lastDate: record.maintenance_date, dueDate, remainingDays, state: remainingDays < 0 ? 'overdue' : remainingDays === 0 ? 'today' : 'scheduled' };
  }).sort((first, second) => {
    const priority = { overdue: 0, today: 1, scheduled: 2 };
    const stateOrder = priority[first.state] - priority[second.state];
    if (stateOrder) return stateOrder;
    const dateOrder = first.dueDate.localeCompare(second.dueDate);
    return dateOrder || first.code.localeCompare(second.code);
  });
  if (!schedules.length) {
    nextInspectionStatus.textContent = '정비 기록에 등록된 점검 항목이 없습니다.';
    return;
  }
  schedules.forEach(renderNextInspection);
  nextInspectionStatus.textContent = '';
}
async function updateDashboard() {
  const bike = activeBikes.find((item) => item.id === selectedDashboardBikeId);
  if (!currentSession || !activeBikes.length) return;
  const bikeIds = bike ? [bike.id] : activeBikes.map((item) => item.id);
  const selectionKey = selectedDashboardBikeId || 'all';
  const version = sessionVersion;
  dashboardEmpty.hidden = true;
  dashboardContent.hidden = false;
  if (bike) renderBikeCard(dashboardBikeCard, bike);
  else renderAllBikesDashboardCard(dashboardBikeCard);
  dashboardStatus.textContent = '이번 달 기록을 불러오는 중입니다…';
  monthlyRideCount.textContent = '-'; monthlyDistance.textContent = '-'; monthlyMaintenanceCost.textContent = '-';
  loadRecentDashboardActivities(bikeIds, selectionKey, version);
  loadNextInspectionSchedule(bikeIds, selectionKey, version);
  const [ridesResult, maintenanceResult] = await Promise.all([
    fetchMonthlyRows('riding_logs', 'ride_date', bikeIds, 'distance_km', version),
    fetchMonthlyRows('maintenance_logs', 'maintenance_date', bikeIds, 'cost_krw', version)
  ]);
  if (version !== sessionVersion || (selectedDashboardBikeId || 'all') !== selectionKey) return;
  if (ridesResult.error || maintenanceResult.error) {
    console.error('대시보드 통계 조회 실패:', ridesResult.error || maintenanceResult.error);
    dashboardStatus.textContent = '이번 달 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return;
  }
  const rides = ridesResult.data || [];
  const maintenance = maintenanceResult.data || [];
  monthlyRideCount.textContent = `${rides.length.toLocaleString('ko-KR')}회`;
  monthlyDistance.textContent = `${rides.reduce((sum, ride) => sum + Number(ride.distance_km || 0), 0).toLocaleString('ko-KR')} km`;
  monthlyMaintenanceCost.textContent = `${maintenance.reduce((sum, log) => sum + Number(log.cost_krw || 0), 0).toLocaleString('ko-KR')}원`;
  dashboardStatus.textContent = '';
}
async function loadBikeImage(imageBox, path, version) {
  const { data, error } = await sb.storage.from(STORAGE_BUCKET).createSignedUrl(path, 300);
  if (version !== sessionVersion || error || !data?.signedUrl) return;
  imageBox.replaceChildren(); const image = document.createElement("img"); image.src = data.signedUrl; image.alt = "등록한 바이크 대표 사진"; imageBox.append(image);
}

function showTab(tab) {
  if (activeTab === "bikes" && tab !== "bikes") rememberBikeDraft();
  activeTab = tab; dashboardView.hidden = tab !== "dashboard"; bikesView.hidden = tab !== "bikes"; ridesView.hidden=tab!=="rides"; maintenanceView.hidden=tab!=="maintenance"; if(tab==="dashboard"&&currentSession)updateDashboard(); if(tab==="rides"&&currentSession&&rideList.children.length===0){loadRideBikeFilter();loadRides(true)} if(tab==="maintenance"&&currentSession&&maintenanceList.children.length===0){loadMaintenanceBikeFilter();loadMaintenance(true);}
  try { sessionStorage.setItem("motolog-active-tab", tab); } catch (_error) { /* 화면 상태 저장을 지원하지 않는 브라우저 */ }
  document.querySelectorAll(".tab-button[data-tab]").forEach((button) => {
    if (button.dataset.tab === tab) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (tab === "bikes" && bikeDraft) {
    bikeFormPanel.hidden = false;
    bikeResultPanel.hidden = true;
    restoreBikeDraft();
  }
}
function text(el,value){el.textContent=value}
function canEditLog(log){return log.bikes?.status==='active'}
function editorField(form,labelText,value,{type='text',name,required=false,maxLength=null}={}){const field=document.createElement('div'),label=document.createElement('label'),input=document.createElement(type==='textarea'?'textarea':'input');field.className='field';label.textContent=labelText;input.name=name;input.type=type==='textarea'?'text':type;input.value=value||'';input.required=required;if(maxLength)input.maxLength=maxLength;label.append(input);field.append(label);form.append(field);return input}
function editorButtons(form,onCancel){const actions=document.createElement('div'),cancel=document.createElement('button'),save=document.createElement('button');actions.className='form-actions';cancel.type='button';cancel.className='secondary-button';cancel.textContent='취소';cancel.addEventListener('click',onCancel);save.type='submit';save.className='primary-button';save.textContent='수정 저장';actions.append(cancel,save);form.append(actions)}
function addMaintenanceEditItem(container,item={}){const row=document.createElement('div');row.className='maintenance-edit-item';const code=document.createElement('select');code.className='edit-item-code';code.setAttribute('aria-label','정비 코드');fillMaintenanceTypeSelect(code,item.type_code||'F1',false,item.type_code?[item.type_code]:[]);const name=document.createElement('input');name.className='edit-item-name';name.placeholder='작업명';name.maxLength=100;name.value=item.name||'';name.setAttribute('aria-label','작업명');const cost=document.createElement('input');cost.className='edit-item-cost';cost.type='text';cost.inputMode='numeric';cost.placeholder='비용';cost.value=item.cost_krw??'';cost.setAttribute('aria-label','항목별 비용');const affectsLabel=document.createElement('label'),affects=document.createElement('input');affects.type='checkbox';affects.className='edit-item-affects';affects.checked=item.affects_next_due!==false;affectsLabel.className='affects-next-due';affectsLabel.append(affects,document.createTextNode('다음 점검 일정에 반영'));code.addEventListener('change',()=>{affects.checked=defaultAffectsNextDue(code.value)});const note=document.createElement('textarea');note.className='edit-item-notes';note.placeholder='항목 메모 (선택)';note.maxLength=2000;note.value=item.notes||'';note.setAttribute('aria-label','항목 메모');const remove=document.createElement('button');remove.type='button';remove.className='secondary-button compact-button';remove.textContent='항목 삭제';remove.addEventListener('click',()=>{if(container.children.length===1){alert('정비 항목은 최소 한 개가 필요합니다.');return}row.remove()});row.append(code,name,cost,affectsLabel,note,remove);container.append(row)}
function readMaintenanceEditItems(container){return [...container.querySelectorAll('.maintenance-edit-item')].map(row=>({type_code:row.querySelector('.edit-item-code').value,name:row.querySelector('.edit-item-name').value.trim(),cost_krw:Number(row.querySelector('.edit-item-cost').value),notes:row.querySelector('.edit-item-notes').value.trim(),affects_next_due:row.querySelector('.edit-item-affects').checked}))}
function toKoreanDateTimeInput(value){if(!value)return '';const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).reduce((result,part)=>{result[part.type]=part.value;return result},{});return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`}
function openRideEditor(ride){recordEditContent.replaceChildren();const heading=document.createElement('h2');heading.textContent='라이딩 기록 수정';const message=document.createElement('p');message.className='hint';message.textContent='바이크는 이 수정 화면에서 변경할 수 없습니다.';const form=document.createElement('form');form.className='bike-form';const title=editorField(form,'제목',ride.title,{name:'title',required:true,maxLength:100});const date=editorField(form,'라이딩 날짜',ride.ride_date,{name:'ride_date',type:'date',required:true});const typeField=document.createElement('div'),typeLabel=document.createElement('label'),typeSelect=document.createElement('select');typeField.className='field';typeLabel.textContent='라이딩 유형';typeSelect.name='ride_type';fillRideTypeSelect(typeSelect,ride.ride_type,false,[ride.ride_type]);typeLabel.append(typeSelect);typeField.append(typeLabel);form.append(typeField);const start=editorField(form,'출발지',ride.start_location,{name:'start_location',required:true,maxLength:100}),end=editorField(form,'도착지',ride.end_location,{name:'end_location',required:true,maxLength:100}),distance=editorField(form,'주행거리',ride.distance_km,{name:'distance_km',required:true}),waypoints=editorField(form,'경유지 (한 줄에 한 곳)',(ride.waypoints||[]).join('\n'),{name:'waypoints',type:'textarea',maxLength:2000}),started=editorField(form,'출발 시각',toKoreanDateTimeInput(ride.started_at),{name:'started_at',type:'datetime-local'}),ended=editorField(form,'도착 시각',toKoreanDateTimeInput(ride.ended_at),{name:'ended_at',type:'datetime-local'}),notes=editorField(form,'메모',ride.notes||'',{name:'notes',type:'textarea',maxLength:2000});editorButtons(form,()=>recordEditDialog.close());form.addEventListener('submit',async event=>{event.preventDefault();const points=waypoints.value.split('\n').map(value=>value.trim()).filter(Boolean),hasStarted=Boolean(started.value),hasEnded=Boolean(ended.value),startTime=hasStarted?new Date(`${started.value}+09:00`):null,endTime=hasEnded?new Date(`${ended.value}+09:00`):null;if(!title.value.trim()||title.value.trim().length>100||!start.value.trim()||start.value.trim().length>100||!end.value.trim()||end.value.trim().length>100||!date.value||date.value>getKoreanTodayText()||!/^\d+$/.test(distance.value)||Number(distance.value)<1||notes.value.trim().length>2000){message.textContent='필수값과 날짜·주행거리를 확인해 주세요.';return}if(points.some(value=>value.length>100)){message.textContent='경유지는 각각 100자 이하로 입력해 주세요.';return}if(hasStarted!==hasEnded||startTime>endTime||startTime>new Date()||endTime>new Date()){message.textContent='출발·도착 시각은 모두 입력하고, 출발 이후의 과거 시각으로 설정해 주세요.';return}const save=form.querySelector('[type="submit"]');save.disabled=true;save.textContent='수정 저장 중…';const version=sessionVersion;const{error}=await sb.from('riding_logs').update({title:title.value.trim(),ride_date:date.value,ride_type:typeSelect.value,start_location:start.value.trim(),end_location:end.value.trim(),distance_km:Number(distance.value),waypoints:points,started_at:startTime?.toISOString()||null,ended_at:endTime?.toISOString()||null,notes:notes.value.trim()||null}).eq('id',ride.id).eq('user_id',currentSession.user.id);if(version!==sessionVersion)return;if(error){save.disabled=false;save.textContent='수정 저장';message.textContent='수정하지 못했습니다. 활성 바이크 기록인지 확인해 주세요.';return}recordEditDialog.close();rideDetailDialog.close();loadRides(true);if(activeTab==='dashboard')updateDashboard()});recordEditContent.append(heading,message,form);recordEditDialog.showModal();title.focus()}
function openMaintenanceEditor(log){recordEditContent.replaceChildren();const heading=document.createElement('h2');heading.textContent='정비 기록 수정';const message=document.createElement('p');message.className='hint';message.textContent='바이크는 이 수정 화면에서 변경할 수 없습니다.';const form=document.createElement('form');form.className='bike-form';const title=editorField(form,'정비 제목',log.title,{name:'title',required:true,maxLength:100}),date=editorField(form,'정비일',log.maintenance_date,{name:'maintenance_date',type:'date',required:true}),odometer=editorField(form,'당시 계기판 주행거리',log.odometer_km??'',{name:'odometer_km'}),serviceField=document.createElement('div'),serviceLabel=document.createElement('label'),service=document.createElement('select');serviceField.className='field';serviceLabel.textContent='정비 방식';[['shop','정비소'],['self','자가 정비'],['unknown','미확인']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;option.selected=value===log.service_type;service.append(option)});serviceLabel.append(service);serviceField.append(serviceLabel);form.append(serviceField);const shop=editorField(form,'정비소 이름',log.shop_name||'',{name:'shop_name',maxLength:100}),notes=editorField(form,'방문 메모',log.notes||'',{name:'notes',type:'textarea',maxLength:2000});const itemsTitle=document.createElement('h3');itemsTitle.textContent='정비 작업';const itemsContainer=document.createElement('div');itemsContainer.className='maintenance-edit-items';(Array.isArray(log.items)&&log.items.length?log.items:[{}]).forEach(item=>addMaintenanceEditItem(itemsContainer,item));const addItem=document.createElement('button');addItem.type='button';addItem.className='secondary-button compact-button';addItem.textContent='작업 항목 추가';addItem.addEventListener('click',()=>addMaintenanceEditItem(itemsContainer));form.append(itemsTitle,itemsContainer,addItem);editorButtons(form,()=>recordEditDialog.close());form.addEventListener('submit',async event=>{event.preventDefault();const items=readMaintenanceEditItems(itemsContainer);const itemsValid=items.length&&items.every(item=>/^F[1-9][0-9]*$/.test(item.type_code)&&item.name&&item.name.length<=100&&Number.isInteger(item.cost_krw)&&item.cost_krw>=0&&item.notes.length<=2000);if(!title.value.trim()||title.value.trim().length>100||!date.value||date.value>getKoreanTodayText()||(odometer.value&&!/^\d+$/.test(odometer.value))||shop.value.trim().length>100||notes.value.trim().length>2000||!itemsValid){message.textContent='입력한 정비 정보와 작업 항목을 확인해 주세요.';return}const save=form.querySelector('[type="submit"]');save.disabled=true;save.textContent='수정 저장 중…';const version=sessionVersion;const{error}=await sb.from('maintenance_logs').update({title:title.value.trim(),maintenance_date:date.value,odometer_km:odometer.value?Number(odometer.value):null,service_type:service.value,shop_name:shop.value.trim()||null,notes:notes.value.trim()||null,items}).eq('id',log.id).eq('user_id',currentSession.user.id);if(version!==sessionVersion)return;if(error){save.disabled=false;save.textContent='수정 저장';message.textContent='수정하지 못했습니다. 활성 바이크 기록인지 확인해 주세요.';return}recordEditDialog.close();maintenanceDetailDialog.close();loadMaintenance(true);if(activeTab==='dashboard')updateDashboard()});recordEditContent.append(heading,message,form);recordEditDialog.showModal();title.focus()}
function openRideDetail(ride){rideDetailTitle.textContent=ride.title;rideDetailBody.replaceChildren();if(canEditLog(ride)){const edit=document.createElement('button');edit.type='button';edit.className='primary-button compact-button';edit.textContent='라이딩 기록 수정';edit.addEventListener('click',()=>{rideDetailDialog.close();openRideEditor(ride)});rideDetailBody.append(edit)}else{const readOnly=document.createElement('p');readOnly.className='hint';readOnly.textContent='보관된 바이크의 기록은 조회만 할 수 있습니다.';rideDetailBody.append(readOnly)}const bikeName=ride.bikes?.nickname||`${ride.bikes?.manufacturer||''} ${ride.bikes?.model||''}`.trim()||'삭제된 바이크';[['바이크',bikeName],['라이딩 날짜',ride.ride_date],['경로',[ride.start_location,...(ride.waypoints||[]),ride.end_location].join(' → ')],['주행거리',`${ride.distance_km.toLocaleString('ko-KR')} km`],['라이딩 유형',getRideTypeDisplay(ride.ride_type)],['출발 시각',ride.started_at||'미입력'],['도착 시각',ride.ended_at||'미입력'],['메모',ride.notes||'미입력']].forEach(([label,value])=>{const p=document.createElement('p'),b=document.createElement('strong');b.textContent=`${label}: `;p.append(b,document.createTextNode(value));rideDetailBody.append(p)});rideDetailDialog.showModal()}
function rideMonthKey(rideDate){return rideDate.slice(0,7)}
function rideMonthLabel(monthKey){const[year,month]=monthKey.split('-');return `${year}년 ${Number(month)}월`}
function rideMatchesSearch(ride,term){return !term||[ride.title,ride.start_location,ride.end_location,...(ride.waypoints||[])].join(' ').toLowerCase().includes(term)}
function shortRideRoute(ride){const waypointCount=(ride.waypoints||[]).length;return waypointCount>=2?`${ride.start_location} → 경유 ${waypointCount}곳 → ${ride.end_location}`:[ride.start_location,...(ride.waypoints||[]),ride.end_location].join(' → ')}
function getRideFilterLabels(){const labels=[];const bikeText=rideBikeFilter.selectedOptions[0]?.textContent;if(rideBikeFilter.value)labels.push(`바이크: ${bikeText}`);if(rideStartDate.value||rideEndDate.value)labels.push(`기간: ${rideStartDate.value||'처음'} ~ ${rideEndDate.value||'오늘'}`);if(rideTypeFilter.value)labels.push(`유형: ${getRideTypeDisplay(rideTypeFilter.value)}`);if(rideSearch.value.trim())labels.push(`검색: ${rideSearch.value.trim()}`);labels.push(`정렬: ${rideSort.selectedOptions[0]?.textContent||'최신순'}`);return labels}
function updateRideConditionSummary(count){rideConditionSummary.textContent=`적용 조건: ${getRideFilterLabels().join(' · ')||'전체'} / 검색 결과 ${count.toLocaleString('ko-KR')}건`}
function syncRideTypeOptions(records){const selected=rideTypeFilter.value;const extraCodes=[...new Set(records.map(ride=>ride.ride_type).filter(Boolean))].sort((first,second)=>first.localeCompare(second));fillRideTypeSelect(rideTypeFilter,selected,true,extraCodes)}
function sortRideRecords(records){const sort=rideSort.value;const groups=new Map();records.forEach(ride=>{const key=rideMonthKey(ride.ride_date);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(ride)});const groupEntries=[...groups.entries()];if(sort==='oldest')groupEntries.sort((first,second)=>first[0].localeCompare(second[0]));else if(sort==='distance')groupEntries.sort((first,second)=>Math.max(...second[1].map(ride=>Number(ride.distance_km||0)))-Math.max(...first[1].map(ride=>Number(ride.distance_km||0)))||second[0].localeCompare(first[0]));else groupEntries.sort((first,second)=>second[0].localeCompare(first[0]));return groupEntries.flatMap(([,rides])=>rides.sort((first,second)=>{if(sort==='distance')return Number(second.distance_km||0)-Number(first.distance_km||0)||second.ride_date.localeCompare(first.ride_date)||first.id.localeCompare(second.id);const dateOrder=sort==='oldest'?first.ride_date.localeCompare(second.ride_date):second.ride_date.localeCompare(first.ride_date);return dateOrder||first.id.localeCompare(second.id)}))}
function applyRideFilters(records){if(rideStartDate.value&&rideEndDate.value&&rideStartDate.value>rideEndDate.value)return{error:'시작일은 종료일보다 늦을 수 없습니다.'};const term=rideSearch.value.trim().toLowerCase();const filtered=records.filter(ride=>(!rideStartDate.value||ride.ride_date>=rideStartDate.value)&&(!rideEndDate.value||ride.ride_date<=rideEndDate.value)&&(!rideTypeFilter.value||ride.ride_type===rideTypeFilter.value)&&rideMatchesSearch(ride,term));return{data:sortRideRecords(filtered)}}
function buildRideMonthSummaries(records){const summaries=new Map();records.forEach(ride=>{const key=rideMonthKey(ride.ride_date),summary=summaries.get(key)||{count:0,distance:0};summary.count+=1;summary.distance+=Number(ride.distance_km||0);summaries.set(key,summary)});return summaries}
async function fetchAllRides(version){const bikeId=rideBikeFilter.value,records=[];let offset=0;while(true){let query=sb.from('riding_logs').select('id,bike_id,title,ride_date,start_location,waypoints,end_location,distance_km,ride_type,notes,started_at,ended_at,bikes(nickname,manufacturer,model,status)').eq('user_id',currentSession.user.id).order('ride_date',{ascending:false}).order('id',{ascending:true}).range(offset,offset+999);if(bikeId)query=query.eq('bike_id',bikeId);const{data,error}=await query;if(version!==sessionVersion)return{cancelled:true};if(error)return{error};records.push(...(data||[]));if(!data||data.length<1000)return{data:records};offset+=1000}}
function renderRideMonthHeader(monthKey){if(lastRenderedRideMonth===monthKey)return;lastRenderedRideMonth=monthKey;const summary=rideMonthSummaries.get(monthKey)||{count:0,distance:0};const row=document.createElement('tr'),cell=document.createElement('td'),title=document.createElement('span'),detail=document.createElement('span');row.className='ride-month-row';cell.colSpan=6;title.textContent=rideMonthLabel(monthKey);detail.className='ride-month-summary';detail.textContent=`${summary.count.toLocaleString('ko-KR')}회 · ${summary.distance.toLocaleString('ko-KR')} km`;cell.append(title,detail);row.append(cell);rideList.append(row)}
function renderRide(ride){renderRideMonthHeader(rideMonthKey(ride.ride_date));const row=document.createElement('tr');row.tabIndex=0;row.setAttribute('aria-label',`${ride.title} 라이딩 상세 보기`);const bikeName=ride.bikes?.nickname||`${ride.bikes?.manufacturer||''} ${ride.bikes?.model||''}`.trim()||'삭제된 바이크';const values=[[formatDate(ride.ride_date),'cell-date'],[bikeName,''],[ride.title,'cell-title'],[getRideTypeDisplay(ride.ride_type),'cell-type'],[`${Number(ride.distance_km).toLocaleString('ko-KR')} km`,'cell-distance'],[shortRideRoute(ride),'cell-route']];values.forEach(([value,className])=>{const cell=document.createElement('td');cell.textContent=value;cell.className=className;row.append(cell)});const open=()=>openRideDetail(ride);row.addEventListener('click',open);row.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}});rideList.append(row)}
function renderRidePage(){const page=filteredRideRecords.slice(rideOffset,rideOffset+10);page.forEach(renderRide);rideOffset+=page.length;moreRides.hidden=rideOffset>=filteredRideRecords.length;rideStatus.textContent=filteredRideRecords.length?`총 ${filteredRideRecords.length.toLocaleString('ko-KR')}건 중 ${rideOffset.toLocaleString('ko-KR')}건 표시`:'검색 결과가 없습니다.'}
async function loadRides(reset=false){if(!currentSession)return;if(!reset){renderRidePage();return}const requestId=++rideRequestId,version=sessionVersion;rideLoading=true;rideOffset=0;lastRenderedRideMonth='';rideMonthSummaries=new Map();filteredRideRecords=[];rideList.replaceChildren();rideStatus.textContent='라이딩 기록을 불러오는 중입니다…';const result=await fetchAllRides(version);if(sessionVersion!==version||requestId!==rideRequestId)return;rideLoading=false;if(result.error){rideStatus.textContent='라이딩 기록을 조회하지 못했습니다.';return}syncRideTypeOptions(result.data||[]);const filtered=applyRideFilters(result.data||[]);if(filtered.error){rideStatus.textContent=filtered.error;updateRideConditionSummary(0);return}filteredRideRecords=filtered.data||[];rideMonthSummaries=buildRideMonthSummaries(filteredRideRecords);updateRideConditionSummary(filteredRideRecords.length);renderRidePage()}
async function loadRideBikeFilter(){if(!currentSession)return;const version=sessionVersion;const selected=rideBikeFilter.value;const{data,error}=await sb.from('bikes').select('id,nickname,manufacturer,model,status').eq('user_id',currentSession.user.id).order('created_at',{ascending:true});if(version!==sessionVersion||error)return;rideBikeFilter.length=1;(data||[]).forEach(bike=>{const option=document.createElement('option');option.value=bike.id;option.textContent=`${bikeDisplayName(bike)}${bike.status==='archived'?' (보관)':''}`;rideBikeFilter.append(option)});if([...rideBikeFilter.options].some(option=>option.value===selected))rideBikeFilter.value=selected}
function maintenanceBikeName(log){return log.bikes?.nickname||`${log.bikes?.manufacturer||''} ${log.bikes?.model||''}`.trim()||'바이크 정보 없음'}
function maintenanceCodes(log){return (Array.isArray(log.items)?log.items:[]).map(item=>item?.type_code).filter(Boolean)}
function syncMaintenanceCodeFilter(records){const selected=maintenanceCodeFilter.value;const extraCodes=[...new Set((records||[]).flatMap(log=>maintenanceCodes(log)))].sort((first,second)=>first.localeCompare(second));fillMaintenanceTypeSelect(maintenanceCodeFilter,selected,true,extraCodes)}
function appendMaintenanceInfo(container,label,value){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=`${label}: `;p.append(strong,document.createTextNode(value||'미입력'));container.append(p)}
function openMaintenanceDetail(log){maintenanceDetailTitle.textContent=log.title;maintenanceDetailBody.replaceChildren();if(canEditLog(log)){const edit=document.createElement('button');edit.type='button';edit.className='primary-button compact-button';edit.textContent='정비 기록 수정';edit.addEventListener('click',()=>{maintenanceDetailDialog.close();openMaintenanceEditor(log)});maintenanceDetailBody.append(edit)}else{const readOnly=document.createElement('p');readOnly.className='hint';readOnly.textContent='보관된 바이크의 기록은 조회만 할 수 있습니다.';maintenanceDetailBody.append(readOnly)}appendMaintenanceInfo(maintenanceDetailBody,'바이크',maintenanceBikeName(log));appendMaintenanceInfo(maintenanceDetailBody,'정비일',formatDate(log.maintenance_date));appendMaintenanceInfo(maintenanceDetailBody,'당시 계기판',log.odometer_km===null?'미입력':`${Number(log.odometer_km).toLocaleString('ko-KR')} km`);appendMaintenanceInfo(maintenanceDetailBody,'총비용',`${Number(log.cost_krw||0).toLocaleString('ko-KR')}원`);appendMaintenanceInfo(maintenanceDetailBody,'정비 방식',({shop:'정비소',self:'자가 정비',unknown:'미확인'})[log.service_type]||'미입력');appendMaintenanceInfo(maintenanceDetailBody,'정비소',log.shop_name||'미입력');appendMaintenanceInfo(maintenanceDetailBody,'다음 점검일',formatDate(log.next_due_date));const itemsTitle=document.createElement('p'),itemsStrong=document.createElement('strong');itemsStrong.textContent='정비 항목';itemsTitle.append(itemsStrong);maintenanceDetailBody.append(itemsTitle);(Array.isArray(log.items)?log.items:[]).forEach(item=>appendMaintenanceInfo(maintenanceDetailBody,`${getMaintenanceTypeDisplay(item.type_code)} · ${item.name||'작업명 없음'}`,`${Number(item.cost_krw||0).toLocaleString('ko-KR')}원 / 다음 점검 ${item.affects_next_due===false?'미반영':'반영'}${item.notes?` / ${item.notes}`:''}`));appendMaintenanceInfo(maintenanceDetailBody,'메모',log.notes||'미입력');maintenanceDetailDialog.showModal()}
function maintenanceServiceLabel(log){if(log.service_type==='self')return'자가 정비';if(log.service_type==='shop')return log.shop_name||'정비소';return'미확인'}
function renderMaintenance(log){const card=document.createElement('article');card.className='maintenance-visit-card';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`${log.title} 정비 상세 보기`);const head=document.createElement('div');head.className='maintenance-visit-head';const heading=document.createElement('div');const title=document.createElement('h2');title.textContent=log.title;const meta=document.createElement('p');meta.className='maintenance-visit-meta';meta.textContent=`${formatDate(log.maintenance_date)} · ${maintenanceBikeName(log)}`;heading.append(title,meta);const cost=document.createElement('span');cost.className='maintenance-visit-cost';cost.textContent=`방문 총비용 ${Number(log.cost_krw||0).toLocaleString('ko-KR')}원`;head.append(heading,cost);const info=document.createElement('div');info.className='maintenance-visit-info';[['정비 방식',maintenanceServiceLabel(log)],['당시 계기판',log.odometer_km===null||log.odometer_km===undefined?'미입력':`${Number(log.odometer_km).toLocaleString('ko-KR')} km`],['다음 점검일',formatDate(log.next_due_date)]].forEach(([label,value])=>{const box=document.createElement('div'),labelText=document.createElement('span'),valueText=document.createElement('strong');labelText.textContent=label;valueText.textContent=value;box.append(labelText,valueText);info.append(box)});const items=Array.isArray(log.items)?log.items:[];const toggle=document.createElement('button');toggle.type='button';toggle.className='secondary-button compact-button maintenance-work-toggle';toggle.textContent=`작업 ${items.length}개 보기`;toggle.setAttribute('aria-expanded','false');const workList=document.createElement('div');workList.className='maintenance-work-list';workList.hidden=true;items.forEach(item=>{const work=document.createElement('div');work.className='maintenance-work-item';const workTitle=document.createElement('strong');workTitle.textContent=`${getMaintenanceTypeDisplay(item.type_code)} · ${item.name||'작업명 없음'}`;const workCost=document.createElement('p');workCost.textContent=`항목별 비용 ${Number(item.cost_krw||0).toLocaleString('ko-KR')}원 / 다음 점검 ${item.affects_next_due===false?'미반영':'반영'}`;const workNote=document.createElement('p');workNote.textContent=`메모: ${item.notes||'미입력'}`;work.append(workTitle,workCost,workNote);workList.append(work)});toggle.addEventListener('click',event=>{event.stopPropagation();const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));toggle.textContent=`작업 ${items.length}개 ${expanded?'보기':'접기'}`;workList.hidden=expanded});toggle.addEventListener('keydown',event=>event.stopPropagation());card.append(head,info,toggle,workList);const open=()=>openMaintenanceDetail(log);card.addEventListener('click',open);card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}});maintenanceList.append(card)}
async function loadMaintenance(reset=false){if(maintenanceLoading||!currentSession)return;maintenanceLoading=true;if(reset){maintenanceOffset=0;maintenanceList.replaceChildren()}maintenanceStatus.textContent='정비 기록을 불러오는 중입니다…';const version=sessionVersion;let query=sb.from('maintenance_logs').select('id,bike_id,title,maintenance_date,odometer_km,cost_krw,service_type,shop_name,next_due_date,notes,items,bikes(nickname,manufacturer,model,status)').eq('user_id',currentSession.user.id).order('maintenance_date',{ascending:false}).range(maintenanceOffset,maintenanceOffset+9);if(maintenanceBikeFilter.value)query=query.eq('bike_id',maintenanceBikeFilter.value);if(maintenanceStartDate.value)query=query.gte('maintenance_date',maintenanceStartDate.value);if(maintenanceEndDate.value)query=query.lte('maintenance_date',maintenanceEndDate.value);const{data,error}=await query;if(version!==sessionVersion)return;maintenanceLoading=false;if(error){console.error('정비 기록 조회 실패:',error);maintenanceStatus.textContent='정비 기록을 조회하지 못했습니다.';return}syncMaintenanceCodeFilter(data||[]);const term=maintenanceSearch.value.trim().toLowerCase(),code=maintenanceCodeFilter.value;const rows=(data||[]).filter(log=>(!term||[log.title,log.shop_name].filter(Boolean).join(' ').toLowerCase().includes(term))&&(!code||maintenanceCodes(log).includes(code)));rows.forEach(renderMaintenance);maintenanceOffset+=(data||[]).length;maintenanceStatus.textContent=maintenanceList.children.length?'':(data||[]).length?'검색 결과가 없습니다.':'등록된 정비 기록이 없습니다.';moreMaintenance.hidden=(data||[]).length<10}
async function loadMaintenanceBikeFilter(){if(!currentSession)return;const version=sessionVersion;const{data,error}=await sb.from('bikes').select('id,nickname,manufacturer,model,status').eq('user_id',currentSession.user.id).order('created_at',{ascending:true});if(version!==sessionVersion||error)return;maintenanceBikeFilter.length=1;(data||[]).forEach(bike=>{const option=document.createElement('option');option.value=bike.id;option.textContent=`${bikeDisplayName(bike)}${bike.status==='archived'?' (보관)':''}`;maintenanceBikeFilter.append(option)})}
function populateBikeForm(bike) {
  fields.nickname.value = bike.nickname || ""; fields.manufacturer.value = bike.manufacturer || ""; fields.model.value = bike.model || "";
  fields.modelYear.value = bike.model_year || ""; fields.purchaseDate.value = bike.purchase_date || ""; fields.odometer.value = bike.current_odometer_km ?? ""; fields.notes.value = bike.notes || "";
  notesCount.textContent = fields.notes.value.length.toLocaleString("ko-KR");
  if (bike.photo_path) loadBikeImage(photoPreview, bike.photo_path, sessionVersion);
}
function showBikeForm(bike = null) {
  isBikeFormOpen = true; clearBikeDraft(); editingBike = bike; resetBikeForm(); if (bike) populateBikeForm(bike);
  document.querySelector("#bikeRegisterTitle").textContent = bike ? "내 바이크 수정" : "내 바이크 등록";
  saveBikeButton.textContent = bike ? "수정 저장" : "바이크 등록";
  bikeFormPanel.hidden = false; bikeResultPanel.hidden = true; photoRetryBox.hidden = true; clearMessage(appMessageBox); showTab("bikes"); fields.nickname.focus();
}
function renderBikeList() {
  bikeList.replaceChildren();
  activeBikes.forEach((bike) => {
    const card = document.createElement("article");
    card.className = "bike-summary-card";
    renderBikeCard(card, bike, true);
    bikeList.append(card);
  });
}
function showBikeResult(bike) {
  const existingIndex = activeBikes.findIndex((item) => item.id === bike.id);
  if (existingIndex >= 0) activeBikes[existingIndex] = bike;
  else activeBikes.push(bike);
  currentBike = bike; selectedDashboardBikeId = bike.id; populateDashboardBikeSelect(); isBikeFormOpen = false; editingBike = null; clearBikeDraft(); bikeFormPanel.hidden = true; bikeResultPanel.hidden = false;
  renderBikeList(); renderBikeCard(dashboardBikeCard, bike); dashboardBikeCard.hidden = false; dashboardEmpty.hidden = true;
}

async function loadCurrentBike() {
  if (!currentSession || !isConfigReady()) return;
  // 저장 또는 취소 전에는 현재 등록·수정 화면을 다시 조회하거나 다시 그리지 않습니다.
  if (isBikeFormOpen || bikeDraft) return;
  const version = sessionVersion; showMessage(appMessageBox, "내 바이크 정보를 불러오는 중입니다…", "loading");
  const { data, error } = await sb.from("bikes").select("id, user_id, nickname, manufacturer, model, model_year, purchase_date, current_odometer_km, odometer_recorded_at, photo_path, notes, created_at").eq("user_id", currentSession.user.id).eq("status", "active").order("created_at", { ascending: true });
  if (version !== sessionVersion) return;
  if (error) { showMessage(appMessageBox, koreanError(error, "내 바이크 정보를 불러오지 못했습니다."), "error"); return; }
  clearMessage(appMessageBox); activeBikes = data; currentBike = data[0] || null; populateDashboardBikeSelect(); if (activeTab === 'rides') loadRideBikeFilter();
  if (currentBike) {
    // 등록·수정 중에는 늦게 끝난 조회 요청이 폼을 결과 카드로 덮어쓰지 않게 합니다.
    if (isBikeFormOpen || bikeDraft) {
      isBikeFormOpen = true;
      bikeFormPanel.hidden = false;
      bikeResultPanel.hidden = true;
      restoreBikeDraft();
      renderBikeCard(dashboardBikeCard, currentBike);
      dashboardBikeCard.hidden = false;
      dashboardEmpty.hidden = true;
      return;
    }
    renderBikeList(); bikeFormPanel.hidden = true; bikeResultPanel.hidden = false; renderBikeCard(dashboardBikeCard, currentBike); dashboardBikeCard.hidden = false; dashboardEmpty.hidden = true; if (activeTab === 'dashboard') updateDashboard();
  } else { dashboardContent.hidden = true; dashboardBikeCard.hidden = true; dashboardEmpty.hidden = false; bikeFormPanel.hidden = false; bikeResultPanel.hidden = true; if (bikeDraft) restoreBikeDraft(); }
}

function buildPhotoPath(bikeId, file) {
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const uniqueName = window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${currentSession.user.id}/${bikeId}/${uniqueName}.${extension}`;
}
async function uploadAndLinkPhoto(bike, file, version, existingPath = null) {
  const path = existingPath || buildPhotoPath(bike.id, file);
  if (!existingPath) {
    const upload = await sb.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (version !== sessionVersion) return { cancelled: true };
    if (upload.error) return { error: koreanError(upload.error, "사진 업로드에 실패했습니다. Storage 버킷과 정책 설정을 확인해 주세요."), path: null };
  }
  const { data, error } = await sb.from("bikes").update({ photo_path: path }).eq("id", bike.id).eq("user_id", currentSession.user.id).select("id, user_id, nickname, manufacturer, model, model_year, purchase_date, current_odometer_km, odometer_recorded_at, photo_path, notes, created_at").single();
  if (version !== sessionVersion) return { cancelled: true };
  if (error) return { error: `사진은 업로드되었지만 바이크 연결에 실패했습니다. ${koreanError(error, "사진 연결을 다시 시도해 주세요.")}`, path };
  return { data };
}

async function handleBikeSubmit(event) {
  event.preventDefault(); clearMessage(appMessageBox);
  if (!currentSession) return showMessage(appMessageBox, "로그인 후 바이크를 등록할 수 있습니다.", "error");
  if (!validateBikeForm()) return;
  const version = sessionVersion; const bikeBeingEdited = editingBike; setBikeBusy(true, bikeBeingEdited ? "바이크 정보를 수정하는 중입니다…" : "바이크 정보를 등록하는 중입니다…");
  const payload = { nickname: cleanOptional(fields.nickname.value), manufacturer: fields.manufacturer.value.trim(), model: fields.model.value.trim(), model_year: fields.modelYear.value ? Number(fields.modelYear.value) : null, purchase_date: fields.purchaseDate.value || null, current_odometer_km: Number(fields.odometer.value), notes: cleanOptional(fields.notes.value) };
  const bikeQuery = bikeBeingEdited
    ? sb.from("bikes").update(payload).eq("id", bikeBeingEdited.id).eq("user_id", currentSession.user.id)
    : sb.from("bikes").insert(payload);
  const { data: bike, error } = await bikeQuery.select("id, user_id, nickname, manufacturer, model, model_year, purchase_date, current_odometer_km, odometer_recorded_at, photo_path, notes, created_at").single();
  if (version !== sessionVersion) return;
  if (error) { setBikeBusy(false); showMessage(appMessageBox, koreanError(error, "바이크 정보를 저장하지 못했습니다. 입력 내용을 확인해 주세요."), "error"); return; }
  showBikeResult(bike);
  if (!selectedPhotoFile) { setBikeBusy(false); resetBikeForm(); showMessage(appMessageBox, bikeBeingEdited ? "바이크 정보가 수정되었습니다." : "바이크 정보가 등록되었습니다."); return; }
  const photoFile = selectedPhotoFile; const result = await uploadAndLinkPhoto(bike, photoFile, version);
  setBikeBusy(false); if (version !== sessionVersion || result.cancelled) return;
  if (result.error) { pendingPhoto = { bike, file: photoFile, path: result.path }; photoRetryText.textContent = `바이크 정보는 저장되었습니다. 대표 사진 연결에 실패했습니다. ${result.error}`; photoRetryBox.hidden = false; showMessage(appMessageBox, "바이크는 등록되었지만 사진 연결에 실패했습니다.", "error"); return; }
  pendingPhoto = null; photoRetryBox.hidden = true; showBikeResult(result.data); resetBikeForm(); showMessage(appMessageBox, bikeBeingEdited ? "바이크 정보와 대표 사진이 수정되었습니다." : "바이크 정보와 대표 사진이 등록되었습니다.");
}

async function retryPhotoUpload() {
  if (!pendingPhoto || !currentSession) return; const version = sessionVersion; setBikeBusy(true, "대표 사진을 다시 업로드하는 중입니다…");
  const result = await uploadAndLinkPhoto(pendingPhoto.bike, pendingPhoto.file, version, pendingPhoto.path); setBikeBusy(false); if (version !== sessionVersion || result.cancelled) return;
  if (result.error) { pendingPhoto.path = result.path; photoRetryText.textContent = `바이크 정보는 저장되었습니다. ${result.error}`; showMessage(appMessageBox, "대표 사진 연결에 다시 실패했습니다.", "error"); return; }
  pendingPhoto = null; photoRetryBox.hidden = true; showBikeResult(result.data); resetBikeForm(); showMessage(appMessageBox, "대표 사진 연결이 완료되었습니다.");
}

function openMemberPanel() {
  if (!currentSession) return;
  memberEmailInput.value = currentSession.user.email || "";
  displayNameInput.value = getDisplayName();
  displayNameError.textContent = "";
  memberPanel.hidden = false;
  displayNameInput.focus();
}
async function handleMemberSave(event) {
  event.preventDefault();
  const displayName = displayNameInput.value.trim();
  displayNameError.textContent = "";
  if (displayName.length > 50) { displayNameError.textContent = "닉네임은 50자 이하로 입력해 주세요."; return; }
  const version = sessionVersion; saveMemberButton.disabled = true; showMessage(appMessageBox, "회원 정보를 저장하는 중입니다…", "loading");
  const { data, error } = await sb.auth.updateUser({ data: { display_name: displayName || null } });
  saveMemberButton.disabled = false;
  if (version !== sessionVersion) return;
  if (error) { showMessage(appMessageBox, koreanError(error, "회원 정보를 저장하지 못했습니다."), "error"); return; }
  currentSession = { ...currentSession, user: data.user };
  updateHeaderIdentity(); memberPanel.hidden = true; showMessage(appMessageBox, "회원 정보가 저장되었습니다.");
}

async function handleLogout() { const version = ++sessionVersion; const { error } = await sb.auth.signOut(); if (error && version === sessionVersion) showMessage(appMessageBox, koreanError(error, "로그아웃하지 못했습니다."), "error"); }
async function restoreSession() {
  if (!isConfigReady()) return showMessage(messageBox, "config.js에 Supabase URL과 Publishable key를 입력하면 로그인 기능을 사용할 수 있습니다.", "loading");
  setAuthBusy(true, "로그인 상태를 확인하는 중입니다…"); const { data, error } = await sb.auth.getSession(); setAuthBusy(false);
  if (error) return showMessage(messageBox, koreanError(error, "로그인 상태를 확인하지 못했습니다."), "error"); currentSession = data.session; updateAuthScreen(); if (currentSession) { updateHeaderIdentity(); showTab("dashboard"); await loadCurrentBike(); } else clearMessage(messageBox);
}
function resetForSessionChange(session) { sessionVersion += 1; currentSession = session; currentBike = null; activeBikes = []; selectedDashboardBikeId = null; pendingPhoto = null; editingBike = null; rideOffset = 0; rideMonthSummaries = new Map(); filteredRideRecords = []; lastRenderedRideMonth = ''; rideList.replaceChildren(); rideStatus.textContent = ''; rideConditionSummary.textContent = ''; rideBikeFilter.length = 1; rideTypeFilter.length = 1; moreRides.hidden = true; maintenanceOffset = 0; maintenanceList.replaceChildren(); maintenanceStatus.textContent = ''; maintenanceBikeFilter.length = 1; moreMaintenance.hidden = true; recentActivitiesList.replaceChildren(); recentActivitiesStatus.textContent = ''; nextInspectionList.replaceChildren(); nextInspectionStatus.textContent = ''; clearBikeDraft(); isBikeFormOpen = false; memberPanel.hidden = true; resetBikeForm(); dashboardContent.hidden = true; dashboardBikeCard.hidden = true; dashboardEmpty.hidden = false; updateAuthScreen(); }

authForm.addEventListener("submit", handleAuthSubmit);
modeButton.addEventListener("click", () => { isSignUpMode = !isSignUpMode; clearErrors({ email: errors.email, password: errors.password, passwordConfirm: errors.passwordConfirm }); clearMessage(messageBox); updateAuthScreen(); });
logoutButton.addEventListener("click", handleLogout);
homeButton.addEventListener("click", () => showTab("dashboard"));
dashboardBikeSelect.addEventListener('change', () => { selectedDashboardBikeId = dashboardBikeSelect.value; updateDashboard(); });
memberButton.addEventListener("click", openMemberPanel); closeMemberButton.addEventListener("click", () => { memberPanel.hidden = true; }); memberForm.addEventListener("submit", handleMemberSave);
document.querySelectorAll(".tab-button[data-tab]").forEach((button) => button.addEventListener("click", () => showTab(button.dataset.tab)));
rideBikeFilter.addEventListener('change',()=>loadRides(true));rideSearch.addEventListener('input',()=>loadRides(true));rideStartDate.addEventListener('change',()=>loadRides(true));rideEndDate.addEventListener('change',()=>loadRides(true));rideTypeFilter.addEventListener('change',()=>loadRides(true));rideSort.addEventListener('change',()=>loadRides(true));resetRideFilters.addEventListener('click',()=>{rideSearch.value='';rideBikeFilter.value='';rideStartDate.value='';rideEndDate.value='';rideTypeFilter.value='';rideSort.value='recent';loadRides(true)});moreRides.addEventListener('click',()=>loadRides());
maintenanceBikeFilter.addEventListener('change',()=>loadMaintenance(true));maintenanceCodeFilter.addEventListener('change',()=>loadMaintenance(true));maintenanceStartDate.addEventListener('change',()=>loadMaintenance(true));maintenanceEndDate.addEventListener('change',()=>loadMaintenance(true));maintenanceSearch.addEventListener('input',()=>loadMaintenance(true));moreMaintenance.addEventListener('click',()=>loadMaintenance());
closeRideDetail.addEventListener('click',()=>rideDetailDialog.close());rideDetailDialog.addEventListener('click',e=>{if(e.target===rideDetailDialog)rideDetailDialog.close()});
closeMaintenanceDetail.addEventListener('click',()=>maintenanceDetailDialog.close());maintenanceDetailDialog.addEventListener('click',e=>{if(e.target===maintenanceDetailDialog)maintenanceDetailDialog.close()});
recordEditDialog.addEventListener('click',e=>{if(e.target===recordEditDialog)recordEditDialog.close()});
document.querySelectorAll("[data-open-bike-form]").forEach((button) => button.addEventListener("click", showBikeForm));
bikeForm.addEventListener("submit", handleBikeSubmit); newBikeButton.addEventListener("click", () => showBikeForm()); retryPhotoButton.addEventListener("click", retryPhotoUpload);
cancelBikeButton.addEventListener("click", () => { if (!hasBikeFormInput() || window.confirm("입력한 바이크 정보를 버리시겠습니까?")) { clearBikeDraft(); resetBikeForm(); if (currentBike) showBikeResult(currentBike); else { isBikeFormOpen = false; showTab("dashboard"); } } });
photoInput.addEventListener("change", () => { const file = photoInput.files[0]; if (!file) return; if (!validatePhoto(file)) { photoInput.value = ""; return; } showPhotoPreview(file); }); removePhotoButton.addEventListener("click", clearPhotoSelection); notesInput.addEventListener("input", () => { notesCount.textContent = notesInput.value.length.toLocaleString("ko-KR"); });

// 다른 Chrome 탭으로 이동하거나 현재 탭이 다시 열리기 전에 작성 중인 텍스트를 보관합니다.
document.addEventListener("visibilitychange", () => { if (document.hidden) rememberBikeDraft(); });
window.addEventListener("pagehide", rememberBikeDraft);

loadBikeDraftFromSession();
sb.auth.onAuthStateChange((event, session) => {
  const previousUserId = currentSession?.user?.id || null;
  const nextUserId = session?.user?.id || null;
  const accountChanged = previousUserId !== nextUserId;

  // 새로고침 후 INITIAL_SESSION은 같은 브라우저 탭의 작성 중 내용을 지우지 않습니다.
  if (event === "INITIAL_SESSION") {
    currentSession = session;
    updateAuthScreen();
    if (session) { updateHeaderIdentity(); if (!isBikeFormOpen && !bikeDraft) loadCurrentBike(); }
    return;
  }

  // 같은 계정의 SIGNED_IN은 세션 재확인 때도 발생할 수 있으므로 화면을 초기화하지 않습니다.
  // 사용자 ID가 바뀌었거나 로그아웃된 경우에만 개인 화면을 비웁니다.
  if (accountChanged || event === "SIGNED_OUT") {
    resetForSessionChange(session);
    if (session) { updateHeaderIdentity(); showTab("dashboard"); if (!isBikeFormOpen && !bikeDraft) loadCurrentBike(); }
    return;
  }

  // TOKEN_REFRESHED, USER_UPDATED 등은 같은 계정의 폼 입력을 초기화하지 않습니다.
  currentSession = session;
  updateHeaderIdentity();
});
updateAuthScreen(); restoreSession();

(function () {
const form = document.querySelector('#rideForm');
const bike = document.querySelector('#bike');
const message = document.querySelector('#message');
const waypointList = document.querySelector('#waypointList');
const saveButton = document.querySelector('#saveButton');
const returnToStartButton = document.querySelector('#returnToStart');
const startSuggestions = document.querySelector('#startSuggestions');
const endSuggestions = document.querySelector('#endSuggestions');

let session = null;
let requestVersion = 0;
let recentPlaces = [];

const ids = { title: 'titleInput', type: 'rideType', date: 'rideDate', distance: 'distance', start: 'startLocation', end: 'endLocation', started: 'startedAt', ended: 'endedAt', notes: 'notes' };
const input = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, document.querySelector(`#${id}`)]));
fillRideTypeSelect(input.type);
let automaticRideTitle = '';

function syncRideDateFromStartTime() {
  input.date.value = input.started.value ? input.started.value.slice(0, 10) : koreaToday();
}

function fillTitleFromRideType() {
  const typeLabel = getRideTypeLabel(input.type.value);
  if (!typeLabel) return;
  if (!input.title.value.trim() || input.title.value === automaticRideTitle) {
    input.title.value = typeLabel;
    automaticRideTitle = typeLabel;
  }
}

input.date.value = koreaToday();

function show(text, type = 'success') { message.textContent = text; message.className = `message ${type}`; message.hidden = false; }
function clear() { message.hidden = true; message.textContent = ''; }
function err(id, text) { document.querySelector(`#${id}`).textContent = text; }
function clearErrors() { document.querySelectorAll('.error').forEach((element) => { element.textContent = ''; }); }
function koreaToday() { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); const get = (name) => parts.find((part) => part.type === name).value; return `${get('year')}-${get('month')}-${get('day')}`; }

function updateReturnToStartButton() { returnToStartButton.disabled = !input.start.value.trim(); }
function normalizeSuggestion(value) { return value.trim().replace(/\s+/g, ' '); }
function renderSuggestions(target, suggestionBox) {
  const term = target.value.trim().toLowerCase();
  const suggestions = recentPlaces.filter((place) => !term || place.toLowerCase().includes(term)).slice(0, 5);
  suggestionBox.replaceChildren();
  if (!suggestions.length) { suggestionBox.hidden = true; return; }
  suggestions.forEach((place) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = place;
    button.addEventListener('click', () => { target.value = place; target.dispatchEvent(new Event('input', { bubbles: true })); suggestionBox.hidden = true; target.focus(); });
    suggestionBox.append(button);
  });
  suggestionBox.hidden = false;
}
function bindSuggestions(target, suggestionBox) {
  target.addEventListener('focus', () => renderSuggestions(target, suggestionBox));
  target.addEventListener('input', () => renderSuggestions(target, suggestionBox));
  target.addEventListener('blur', () => { window.setTimeout(() => { if (!suggestionBox.contains(document.activeElement)) suggestionBox.hidden = true; }, 150); });
  suggestionBox.addEventListener('pointerdown', (event) => event.preventDefault());
}
async function loadRecentPlaces() {
  if (!session) return;
  const version = requestVersion;
  const seen = new Set();
  const places = [];
  let offset = 0;
  while (places.length < 5) {
    const { data, error } = await sb.from('riding_logs').select('id,ride_date,start_location,waypoints,end_location').eq('user_id', session.user.id).order('ride_date', { ascending: false }).order('id', { ascending: true }).range(offset, offset + 999);
    if (version !== requestVersion) return;
    if (error) { console.error('최근 장소 조회 실패:', error); return; }
    for (const ride of data || []) {
      const locations = [ride.start_location, ...(Array.isArray(ride.waypoints) ? ride.waypoints : []), ride.end_location];
      for (const location of locations) {
        const place = typeof location === 'string' ? normalizeSuggestion(location) : '';
        const key = place.toLocaleLowerCase('ko-KR');
        if (place && !seen.has(key)) { seen.add(key); places.push(place); }
        if (places.length === 5) break;
      }
      if (places.length === 5) break;
    }
    if (!data || data.length < 1000) break;
    offset += 1000;
  }
  if (version === requestVersion) recentPlaces = places;
}
function updateWaypointButtons() {
  const rows = [...waypointList.children];
  rows.forEach((row, index) => {
    const up = row.querySelector('[data-waypoint-up]');
    const down = row.querySelector('[data-waypoint-down]');
    up.disabled = index === 0;
    down.disabled = index === rows.length - 1;
  });
}

function addWaypoint(value = '') {
  const row = document.createElement('div');
  row.className = 'waypoint-row';
  const fieldWrap = document.createElement('div');
  fieldWrap.className = 'suggestion-field';
  const field = document.createElement('input');
  field.maxLength = 100;
  field.value = value;
  field.placeholder = '경유지';
  field.setAttribute('aria-label', '경유지');
  const suggestionBox = document.createElement('div');
  suggestionBox.className = 'suggestion-list';
  suggestionBox.hidden = true;
  fieldWrap.append(field, suggestionBox);
  bindSuggestions(field, suggestionBox);
  const up = document.createElement('button');
  up.type = 'button'; up.className = 'small'; up.textContent = '↑'; up.title = '위로 이동'; up.dataset.waypointUp = '';
  up.setAttribute('aria-label', '경유지를 위로 이동');
  const down = document.createElement('button');
  down.type = 'button'; down.className = 'small'; down.textContent = '↓'; down.title = '아래로 이동'; down.dataset.waypointDown = '';
  down.setAttribute('aria-label', '경유지를 아래로 이동');
  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'small'; remove.textContent = '삭제'; remove.setAttribute('aria-label', '경유지 삭제');
  up.addEventListener('click', () => { const previous = row.previousElementSibling; if (previous) { waypointList.insertBefore(row, previous); updateWaypointButtons(); } });
  down.addEventListener('click', () => { const next = row.nextElementSibling; if (next) { waypointList.insertBefore(next, row); updateWaypointButtons(); } });
  remove.addEventListener('click', () => { row.remove(); updateWaypointButtons(); });
  row.append(fieldWrap, up, down, remove);
  waypointList.append(row);
  updateWaypointButtons();
}

function validate() {
  clearErrors();
  let ok = true;
  const required = [['title', 'titleError', '제목을 입력해 주세요.'], ['type', 'typeError', '라이딩 유형 코드를 입력해 주세요.'], ['start', 'startError', '출발지를 입력해 주세요.'], ['end', 'endError', '도착지를 입력해 주세요.']];
  for (const [key, id, text] of required) if (!input[key].value.trim()) { err(id, text); ok = false; }
  if (input.title.value.trim().length > 100) { err('titleError', '제목은 100자 이하입니다.'); ok = false; }
  if (!getRideTypeLabel(input.type.value)) { err('typeError', '라이딩 유형을 선택해 주세요.'); ok = false; }
  if (!bike.value) { err('bikeError', '바이크를 선택해 주세요.'); ok = false; }
  if (!/^\d+$/.test(input.distance.value) || Number(input.distance.value) < 1) { err('distanceError', '주행거리는 1km 이상의 정수로 입력해 주세요.'); ok = false; }
  const started = input.started.value; const ended = input.ended.value;
  if (Boolean(started) !== Boolean(ended)) { err('startedError', '출발·도착 시각은 둘 다 입력하거나 생략해 주세요.'); ok = false; }
  if (started && ended) { if (new Date(ended) <= new Date(started)) { err('endedError', '도착 시각은 출발 시각 이후여야 합니다.'); ok = false; } if (new Date(started) > new Date() || new Date(ended) > new Date()) { err('endedError', '미래 시각은 입력할 수 없습니다.'); ok = false; } if (started.slice(0, 10) !== input.date.value) { err('startedError', '라이딩 날짜와 출발 시각의 날짜가 같아야 합니다.'); ok = false; } }
  const waypoints = [...waypointList.querySelectorAll('input')].map((element) => element.value.trim()).filter(Boolean);
  if ([...waypointList.querySelectorAll('input')].some((element) => element.value.trim().length > 100)) { err('waypointError', '경유지는 각각 100자 이하입니다.'); ok = false; }
  if (input.notes.value.trim().length > 2000) { err('notesError', '메모는 2,000자 이하입니다.'); ok = false; }
  return ok ? waypoints : null;
}

async function loadBikes() {
  const version = requestVersion;
  bike.length = 1;
  const { data, error } = await sb.from('bikes').select('id,nickname,manufacturer,model').eq('user_id', session.user.id).eq('status', 'active').order('created_at', { ascending: true });
  if (version !== requestVersion) return;
  if (error) { show('바이크 목록을 불러오지 못했습니다.', 'error'); return; }
  (data || []).forEach((item) => { const option = document.createElement('option'); option.value = item.id; option.textContent = item.nickname || `${item.manufacturer} ${item.model}`; bike.append(option); });
  saveButton.disabled = !data?.length;
  if (data?.length === 1) { bike.value = data[0].id; show('등록 가능한 바이크 한 대를 자동 선택했습니다.'); }
  if (!data?.length) show('등록 가능한 활성 바이크가 없습니다. 먼저 내 바이크를 등록해 주세요.', 'error');
}

async function start() {
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session) { show('로그인 후 라이딩 로그를 등록할 수 있습니다.', 'error'); saveButton.disabled = true; return; }
  session = data.session;
  await Promise.all([loadBikes(), loadRecentPlaces()]);
}

document.querySelector('#swapRoute').addEventListener('click', () => {
  const start = input.start.value;
  input.start.value = input.end.value;
  input.end.value = start;
  updateReturnToStartButton();
  show('출발지와 도착지를 교환했습니다.');
  input.start.focus();
});
returnToStartButton.addEventListener('click', () => {
  const start = input.start.value.trim();
  const previousEnd = input.end.value;
  if (!start) return;
  input.end.value = start;
  show(previousEnd && previousEnd !== start ? '기존 도착지를 출발지와 같은 값으로 변경했습니다.' : '도착지를 출발지와 같게 설정했습니다.');
  input.end.focus();
});
input.start.addEventListener('input', updateReturnToStartButton);
input.started.addEventListener('change', syncRideDateFromStartTime);
input.type.addEventListener('change', fillTitleFromRideType);
input.title.addEventListener('input', () => { if (input.title.value !== automaticRideTitle) automaticRideTitle = ''; });
bindSuggestions(input.start, startSuggestions);
bindSuggestions(input.end, endSuggestions);
document.querySelector('#addWaypoint').addEventListener('click', () => addWaypoint());
input.notes.addEventListener('input', () => { document.querySelector('#notesCount').textContent = input.notes.value.length.toLocaleString('ko-KR'); });

form.addEventListener('submit', async (event) => {
  event.preventDefault(); clear();
  if (!session) { show('로그인 후 이용해 주세요.', 'error'); return; }
  const waypoints = validate(); if (!waypoints) return;
  const version = requestVersion;
  saveButton.disabled = true; show('라이딩 로그를 저장하는 중입니다…', 'loading');
  const payload = { user_id: session.user.id, bike_id: bike.value, title: input.title.value.trim(), ride_date: input.date.value, start_location: input.start.value.trim(), waypoints, end_location: input.end.value.trim(), distance_km: Number(input.distance.value), started_at: input.started.value ? new Date(input.started.value).toISOString() : null, ended_at: input.ended.value ? new Date(input.ended.value).toISOString() : null, ride_type: input.type.value.trim(), notes: input.notes.value.trim() || null };
  const { error } = await sb.from('riding_logs').insert(payload);
  if (version !== requestVersion) return;
  saveButton.disabled = false;
  if (error) { show('라이딩 로그를 저장하지 못했습니다. 입력값과 바이크 상태를 확인해 주세요.', 'error'); return; }
  show('라이딩 로그가 저장되었습니다.');
  form.reset(); input.date.value = koreaToday(); waypointList.replaceChildren(); document.querySelector('#notesCount').textContent = '0'; if (bike.options.length === 2) bike.selectedIndex = 1; updateReturnToStartButton();
});

sb.auth.onAuthStateChange((_event, nextSession) => { requestVersion += 1; session = nextSession; recentPlaces = []; if (!nextSession) { saveButton.disabled = true; show('로그아웃되어 등록할 수 없습니다.', 'error'); } else { saveButton.disabled = false; loadBikes(); loadRecentPlaces(); } });
updateReturnToStartButton();
start();

}());
(function () {
const maintenanceForm = document.querySelector('#maintenanceForm');
const bikeSelect = document.querySelector('#bike');
const maintenanceDateInput = document.querySelector('#maintenanceDate');
const itemsContainer = document.querySelector('#items');
const messageBox = document.querySelector('#msg');
const saveButton = document.querySelector('#saveButton');
const totalCost = document.querySelector('#totalCost');
const shopNameInput = document.querySelector('#shopName');
const shopSuggestions = document.querySelector('#shopSuggestions');

let currentSession = null;
let isSaving = false;
let recentShopNames = [];

function showMessage(message, isError = false) {
  messageBox.textContent = message;
  messageBox.className = `message ${isError ? 'error' : 'success'}`;
  messageBox.hidden = false;
}

function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = '';
}

function normalizeSuggestion(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function renderShopSuggestions() {
  const term = shopNameInput.value.trim().toLowerCase();
  const names = recentShopNames.filter((name) => !term || name.toLowerCase().includes(term)).slice(0, 5);
  shopSuggestions.replaceChildren();
  if (!names.length) { shopSuggestions.hidden = true; return; }
  names.forEach((name) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.addEventListener('click', () => { shopNameInput.value = name; shopSuggestions.hidden = true; shopNameInput.focus(); });
    shopSuggestions.append(button);
  });
  shopSuggestions.hidden = false;
}

function bindShopSuggestions() {
  shopNameInput.addEventListener('focus', renderShopSuggestions);
  shopNameInput.addEventListener('input', renderShopSuggestions);
  shopNameInput.addEventListener('blur', () => { window.setTimeout(() => { if (!shopSuggestions.contains(document.activeElement)) shopSuggestions.hidden = true; }, 150); });
  shopSuggestions.addEventListener('pointerdown', (event) => event.preventDefault());
}

async function loadRecentShopNames() {
  if (!currentSession) return;
  const requestUserId = currentSession.user.id;
  const seen = new Set();
  const names = [];
  let offset = 0;
  while (names.length < 5) {
    const { data, error } = await sb.from('maintenance_logs').select('id,maintenance_date,shop_name').eq('user_id', requestUserId).order('maintenance_date', { ascending: false }).order('id', { ascending: true }).range(offset, offset + 999);
    if (currentSession?.user.id !== requestUserId) return;
    if (error) { console.error('최근 정비소 조회 실패:', error); return; }
    for (const log of data || []) {
      const name = typeof log.shop_name === 'string' ? normalizeSuggestion(log.shop_name) : '';
      const key = name.toLocaleLowerCase('ko-KR');
      if (name && !seen.has(key)) { seen.add(key); names.push(name); }
      if (names.length === 5) break;
    }
    if (!data || data.length < 1000) break;
    offset += 1000;
  }
  if (currentSession?.user.id === requestUserId) recentShopNames = names;
}

function getKoreanToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addSixCalendarMonths(dateText) {
  const [year, month, day] = dateText.split('-').map(Number);
  const monthIndex = month - 1 + 6;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonthIndex = monthIndex % 12;
  const targetDay = Math.min(day, new Date(targetYear, targetMonthIndex + 1, 0).getDate());
  return `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}

function createItemRow() {
  const row = document.createElement('div');
  row.className = 'waypoint-row maintenance-item-row';
  const codeSelect = document.createElement('select');
  codeSelect.className = 'item-code';
  codeSelect.setAttribute('aria-label', '정비 코드');
  fillMaintenanceTypeSelect(codeSelect);
  const nameInput = document.createElement('input');
  nameInput.className = 'item-name';
  nameInput.placeholder = '작업명';
  nameInput.maxLength = 100;
  nameInput.setAttribute('aria-label', '작업명');
  const costInput = document.createElement('input');
  costInput.className = 'item-cost';
  costInput.placeholder = '비용';
  costInput.inputMode = 'numeric';
  costInput.setAttribute('aria-label', '항목 비용');
  costInput.addEventListener('input', updateTotalCost);
  const affectsLabel = document.createElement('label');
  affectsLabel.className = 'affects-next-due';
  const affectsCheckbox = document.createElement('input');
  affectsCheckbox.type = 'checkbox';
  affectsCheckbox.className = 'item-affects-next-due';
  affectsCheckbox.checked = defaultAffectsNextDue(codeSelect.value);
  affectsLabel.append(affectsCheckbox, document.createTextNode('다음 점검 일정에 반영'));
  codeSelect.addEventListener('change', () => { affectsCheckbox.checked = defaultAffectsNextDue(codeSelect.value); });
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '삭제';
  deleteButton.addEventListener('click', () => {
    if (itemsContainer.children.length === 1) {
      showMessage('정비 항목은 최소 한 개가 필요합니다.', true);
      return;
    }
    row.remove();
    updateTotalCost();
  });
  row.append(codeSelect, nameInput, costInput, affectsLabel, deleteButton);
  itemsContainer.append(row);
}

function updateTotalCost() {
  let total = 0;
  itemsContainer.querySelectorAll('.item-cost').forEach((input) => {
    if (/^\d+$/.test(input.value.trim())) total += Number(input.value);
  });
  totalCost.textContent = `${total.toLocaleString('ko-KR')}원`;
}

function setBikeOptions(bikes) {
  bikeSelect.replaceChildren();
  const initialOption = document.createElement('option');
  initialOption.value = '';
  initialOption.textContent = bikes.length ? '바이크를 선택해 주세요.' : '등록 가능한 바이크가 없습니다.';
  bikeSelect.append(initialOption);
  bikes.forEach((bike) => {
    const option = document.createElement('option');
    option.value = bike.id;
    option.textContent = bike.nickname || `${bike.manufacturer} ${bike.model}`;
    bikeSelect.append(option);
  });
  bikeSelect.disabled = bikes.length === 0;
}

async function loadActiveBikes(session) {
  const requestUserId = session.user.id;
  bikeSelect.disabled = true;
  const { data: bikes, error } = await sb.from('bikes').select('id, nickname, manufacturer, model').eq('user_id', requestUserId).eq('status', 'active').order('created_at', { ascending: true });
  if (currentSession?.user.id !== requestUserId) return;
  if (error) {
    console.error('바이크 목록 조회 실패:', error);
    setBikeOptions([]);
    showMessage('바이크 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', true);
    return;
  }
  setBikeOptions(bikes || []);
  if (!bikes?.length) showMessage('등록 가능한 활성 바이크가 없습니다. 내 바이크에서 먼저 등록해 주세요.', true);
}

function readMaintenanceItems() {
  return [...itemsContainer.querySelectorAll('.maintenance-item-row')].map((row) => ({
    type_code: row.querySelector('.item-code').value,
    name: row.querySelector('.item-name').value.trim(),
    cost_krw: Number(row.querySelector('.item-cost').value),
    notes: '',
    affects_next_due: row.querySelector('.item-affects-next-due').checked
  }));
}

function validateForm() {
  const title = document.querySelector('#title').value.trim();
  const maintenanceDate = maintenanceDateInput.value;
  const odometerText = document.querySelector('#odometer').value.trim();
  const shopName = document.querySelector('#shopName').value.trim();
  const notes = document.querySelector('#notes').value.trim();
  const items = readMaintenanceItems();
  if (!currentSession) return { error: '로그인 후 이용해 주세요.' };
  if (!bikeSelect.value) return { error: '바이크를 선택해 주세요.' };
  if (!title || title.length > 100) return { error: '정비 제목은 공백만 입력할 수 없으며 최대 100자입니다.' };
  if (!maintenanceDate || maintenanceDate > getKoreanToday()) return { error: '정비일은 한국 기준 오늘 이전 날짜로 입력해 주세요.' };
  if (odometerText && !/^\d+$/.test(odometerText)) return { error: '계기판 주행거리는 0 이상의 정수만 입력할 수 있습니다.' };
  if (shopName.length > 100) return { error: '정비소 이름은 최대 100자까지 입력할 수 있습니다.' };
  if (notes.length > 2000) return { error: '메모는 최대 2,000자까지 입력할 수 있습니다.' };
  for (const item of items) {
    if (!/^F[1-9][0-9]*$/.test(item.type_code)) return { error: '정비 코드를 선택해 주세요.' };
    if (!item.name || item.name.length > 100) return { error: '각 정비 항목의 작업명을 1~100자로 입력해 주세요.' };
    if (!Number.isInteger(item.cost_krw) || item.cost_krw < 0) return { error: '각 항목 비용은 0원 이상의 정수로 입력해 주세요.' };
  }
  return { data: { user_id: currentSession.user.id, bike_id: bikeSelect.value, title, maintenance_date: maintenanceDate, odometer_km: odometerText ? Number(odometerText) : null, service_type: document.querySelector('#serviceType').value, shop_name: shopName || null, items, notes: notes || null, next_due_date: addSixCalendarMonths(maintenanceDate), cost_krw: items.reduce((total, item) => total + item.cost_krw, 0) } };
}

function setSaving(isNowSaving) {
  isSaving = isNowSaving;
  saveButton.disabled = isNowSaving;
  saveButton.textContent = isNowSaving ? '저장 중…' : '저장';
}

async function saveMaintenanceLog(event) {
  event.preventDefault();
  if (isSaving) return;
  clearMessage();
  const result = validateForm();
  if (result.error) return showMessage(result.error, true);
  const requestUserId = currentSession.user.id;
  setSaving(true);
  const { error } = await sb.from('maintenance_logs').insert(result.data);
  setSaving(false);
  if (currentSession?.user.id !== requestUserId) return;
  if (error) {
    console.error('정비 기록 저장 실패:', error);
    showMessage('정비 기록을 저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.', true);
    return;
  }
  showMessage('정비 기록이 저장되었습니다.');
  maintenanceForm.reset();
  maintenanceDateInput.max = getKoreanToday();
  document.querySelector('#nextDueDate').value = '';
  itemsContainer.replaceChildren();
  createItemRow();
  updateTotalCost();
}

async function initializePage() {
  maintenanceDateInput.max = getKoreanToday();
  createItemRow();
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session) {
    showMessage('로그인 후 이용해 주세요.', true);
    bikeSelect.disabled = true;
    return;
  }
  currentSession = data.session;
  bindShopSuggestions();
  await Promise.all([loadActiveBikes(currentSession), loadRecentShopNames()]);
}

document.querySelector('#addItemButton').addEventListener('click', createItemRow);
maintenanceDateInput.addEventListener('change', () => { document.querySelector('#nextDueDate').value = maintenanceDateInput.value ? addSixCalendarMonths(maintenanceDateInput.value) : ''; });
maintenanceForm.addEventListener('submit', saveMaintenanceLog);
sb.auth.onAuthStateChange((event, session) => {
  const previousUserId = currentSession?.user.id;
  const nextUserId = session?.user.id;
  if (event === 'SIGNED_OUT' || previousUserId !== nextUserId) {
    currentSession = session;
    setBikeOptions([]);
    recentShopNames = [];
    if (session) { loadActiveBikes(session); loadRecentShopNames(); }
  }
});
initializePage();

}());
(function () {
  const mainApp = document.querySelector('#mainApp');
  const ridePage = document.querySelector('#ridePage');
  const maintenancePage = document.querySelector('#maintenancePage');
  function showPage() {
    const route = window.location.hash || '#app';
    mainApp.hidden = route === '#ride-add' || route === '#maintenance-add';
    ridePage.hidden = route !== '#ride-add';
    maintenancePage.hidden = route !== '#maintenance-add';
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !['#app', '#ride-add', '#maintenance-add'].includes(link.getAttribute('href'))) return;
    event.preventDefault();
    window.location.hash = link.getAttribute('href');
  });
  window.addEventListener('hashchange', showPage);
  showPage();
}());
