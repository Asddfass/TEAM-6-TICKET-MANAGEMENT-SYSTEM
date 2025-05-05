$(function() {
    'use strict';

    // --- Constants ---
    const STORAGE_KEY = 'facultyRequests';
    const PROFILE_STORAGE_KEY = 'facultyProfile';
    const NOTIFICATION_EXPIRY_DAYS = 3;
    const DEFAULT_PROFILE_PIC = 'placeholder-profile.png';
    const MAX_FILE_SIZE_MB = 2;

    // --- Modal References ---
    const confirmationModalEl = document.getElementById('confirmationModal');
    const confirmationModal = confirmationModalEl ? new bootstrap.Modal(confirmationModalEl) : null;
    const confirmationModalBody = document.getElementById('confirmationModalBody');
    const confirmationModalTitle = document.getElementById('confirmationModalLabel');
    const confirmActionButton = document.getElementById('confirmActionButton');
    const viewRequestModalEl = document.getElementById('viewRequestModal');
    const userProfileModalEl = document.getElementById('userProfileModal');
    const userProfileModal = userProfileModalEl ? new bootstrap.Modal(userProfileModalEl) : null;
    const cancelReasonModalEl = document.getElementById('cancelReasonModal');
    const cancelReasonModal = cancelReasonModalEl ? new bootstrap.Modal(cancelReasonModalEl) : null;
    const reportIssueModalEl = document.getElementById('reportIssueModal');
    const reportIssueModal = reportIssueModalEl ? new bootstrap.Modal(reportIssueModalEl) : null;
    const otherRequestTypeModalEl = document.getElementById('otherRequestTypeModal');
    const otherRequestTypeModal = otherRequestTypeModalEl ? new bootstrap.Modal(otherRequestTypeModalEl) : null;

// --- Hamburger Menu Toggle --- 
    const hamburgerButton = document.querySelector('.hamburger-button');
    const sidebar = document.querySelector('.sidebar');

    if (hamburgerButton && sidebar) {
        hamburgerButton.addEventListener('click', () => {
            sidebar.classList.toggle('is-open');

            const isExpanded = sidebar.classList.contains('is-open');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);

        });

         sidebar.addEventListener('click', (event) => {
             if ((event.target.matches('.nav-link') || event.target.closest('.nav-link')) && !event.target.closest('#logout-link')) {
                 if (sidebar.classList.contains('is-open') && window.innerWidth < 768) {
                     sidebar.classList.remove('is-open');
                     hamburgerButton.setAttribute('aria-expanded', 'false');
                 }
                 
             }
         });

    } else {
        if (!hamburgerButton) console.error("Hamburger button element not found. Make sure your HTML includes a button with class 'hamburger-button'.");
        if (!sidebar) console.error("Sidebar element not found. Make sure your HTML includes a nav/div with class 'sidebar'.");
    }
    
    // --- Ticket Number Management (Alphanumeric - More Numbers) ---
    function generateAlphanumericTicket() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012345678901234567890123456789';
        let ticket = '';
        for (let i = 0; i < 8; i++) {
            ticket += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return ticket;
    }

    function getNextTicketNumber() {
        return generateAlphanumericTicket();
    }

    // --- User Profile Data Management ---
    function getDefaultUserProfile() {
        return {
            firstName: "Kevin",
            lastName: "Librero",
            middleName: "",
            suffix: "",
            email: "kevinLibrero@wmsu.edu.ph",
            employeeId: "F01334",
            college: "Computing Studies",
            position: "Faculty",
            phone: "091123456789",
            profilePicture: DEFAULT_PROFILE_PIC
        };
    }

    function getUserProfile() {
        const profileJson = localStorage.getItem(PROFILE_STORAGE_KEY);
        try {
            const savedProfile = profileJson ? JSON.parse(profileJson) : null;
            const defaults = getDefaultUserProfile();
            const currentProfile = { ...defaults, ...savedProfile };
            currentProfile.employeeId = defaults.employeeId;
            currentProfile.college = defaults.college;
            currentProfile.position = defaults.position;
            return currentProfile;
        } catch (e) {
            localStorage.removeItem(PROFILE_STORAGE_KEY);
            return getDefaultUserProfile();
        }
    }

    function saveUserProfile(profileData) {
        if (!profileData || typeof profileData !== 'object') {
            return false;
        }
        try {
            const dataToSave = {
                firstName: String(profileData.firstName || '').trim(),
                lastName: String(profileData.lastName || '').trim(),
                middleName: String(profileData.middleName || '').trim(),
                suffix: String(profileData.suffix || '').trim(),
                email: String(profileData.email || '').trim(),
                phone: String(profileData.phone || '').trim(),
                profilePicture: String(profileData.profilePicture || DEFAULT_PROFILE_PIC)
            };
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            showToast("Error saving profile data.", "danger");
            return false;
        }
    }

    // --- Request Data Management ---
     function getRequests() {
        const requestsJson = localStorage.getItem(STORAGE_KEY);
        try {
            const parsed = requestsJson ? JSON.parse(requestsJson) : [];
            if (!Array.isArray(parsed)) { return []; }
            return parsed.map(r => ({
                ...r,
                ticketNumber: String(r.ticketNumber || 'N/A'),
                userConfirmedCompletion: typeof r.userConfirmedCompletion === 'boolean' ? r.userConfirmedCompletion : false
            }));
        } catch (e) {
            console.error("Error parsing request data:", e);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }


    function saveRequests(requests) {
        if (!Array.isArray(requests)) {
            return;
        }
        try {
             const sanitizedRequests = requests.map(r => ({
                id: String(r.id || Date.now().toString(16)),
                ticketNumber: String(r.ticketNumber || 'N/A'),
                status: String(r.status || 'Unknown'),
                submissionTimestamp: Number(r.submissionTimestamp) || 0,
                completionTimestamp: r.completionTimestamp ? Number(r.completionTimestamp) : null,
                lastUpdated: Number(r.lastUpdated) || 0,
                notes: r.notes ? String(r.notes) : null,
                lastName: String(r.lastName || 'N/A'),
                firstName: String(r.firstName || 'Faculty'),
                middleName: String(r.middleName || ''),
                suffix: String(r.suffix || ''),
                email: String(r.email || 'N/A'),
                employeeId: String(r.employeeId || 'N/A'),
                college: String(r.college || 'N/A'),
                collegeText: String(r.collegeText || r.college || 'N/A'),
                requestType: String(r.requestType || ''),
                requestTypeText: String(r.requestTypeText || 'Other'),
                priority: String(r.priority || 'medium'),
                priorityText: String(r.priorityText || 'Medium'),
                requestTitle: String(r.requestTitle || 'No Title'),
                requestDetails: String(r.requestDetails || ''),
                attachments: Array.isArray(r.attachments) ? r.attachments.map(a => String(a)) : [],
                userConfirmedCompletion: typeof r.userConfirmedCompletion === 'boolean' ? r.userConfirmedCompletion : false
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedRequests));
        } catch (e) {
            showToast("Error saving data.", "danger");
        }
    }

    // --- Utility Functions ---
    function formatDate(timestamp) {
        if (!timestamp || isNaN(Number(timestamp)) || Number(timestamp) === 0) { return 'N/A'; }
        try {
            const date = new Date(Number(timestamp));
            const dateString = date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return `${dateString} ${timeString}`;
        } catch (e) { return 'Invalid Date'; }
    }

    function getStatusBadgeClass(status) {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'approved': return 'bg-success text-white';
            case 'in progress': return 'bg-info text-dark';
            case 'completed': return 'bg-secondary text-white';
            case 'rejected': return 'bg-danger text-white';
            case 'reported': return 'bg-reported text-white';
            default: return 'bg-light text-dark border';
        }
    }

    function showToast(message, type = 'success', delay = 5000) {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) { alert(message); return; }
        const toastId = 'toast-' + Date.now();
        const toastBg = type === 'danger' ? 'bg-danger' : (type === 'warning' ? 'bg-warning text-dark' : (type === 'info' ? 'bg-info text-dark' : (type === 'reported' ? 'bg-reported' : 'bg-success')));
        const toastHtml = `<div class="toast align-items-center text-white ${toastBg} border-0" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}" data-bs-delay="${delay}"><div class="d-flex"><div class="toast-body flex-grow-1">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        if (!toastEl) return;
        const bootstrapToast = new bootstrap.Toast(toastEl);
        toastEl.addEventListener('hidden.bs.toast', () => { toastEl.remove(); });
        bootstrapToast.show();
    }

    function showConfirmationModal(options) {
        const { question = "Are you sure?", title = "Confirm", confirmBtnTxt = "Confirm", confirmBtnClass = "btn-danger", confirmCb = () => {}, cancelCb = () => {} } = options;
        if (!confirmationModal || !confirmationModalBody || !confirmationModalTitle || !confirmActionButton) {
            if (confirm(question)) { confirmCb(); } else { cancelCb(); }
            return;
        }
        confirmationModalTitle.textContent = title;
        confirmationModalBody.textContent = question;
        let currentConfirmBtn = document.getElementById('confirmActionButton');
        currentConfirmBtn.textContent = confirmBtnTxt;
        currentConfirmBtn.className = `btn ${confirmBtnClass}`;
        const newConfirmBtn = currentConfirmBtn.cloneNode(true);
        currentConfirmBtn.parentNode.replaceChild(newConfirmBtn, currentConfirmBtn);
        newConfirmBtn.addEventListener('click', () => { confirmCb(); confirmationModal.hide(); }, { once: true });

        const hideListener = (event) => {
             if (event.target === confirmationModalEl && (!event.relatedTarget || !newConfirmBtn.contains(event.relatedTarget))) {
                 cancelCb();
             }
             confirmationModalEl.removeEventListener('hidden.bs.modal', hideListener);
        };
        confirmationModalEl.addEventListener('hidden.bs.modal', hideListener, { once: true });

        confirmationModal.show();
    }

     // --- Sample Data Function ---
     function addSampleDataIfNeeded() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            console.log("addSampleDataIfNeeded: Checking local storage...");
            console.log("addSampleDataIfNeeded: Storage is empty, adding sample data...");
            const sampleProfile = getUserProfile();
            const now = Date.now();
            const sampleRequests = [
               { id: "samp6f", ticketNumber: getNextTicketNumber(), requestTitle: "Room Setup for Friday Meeting", status: "Pending", submissionTimestamp: now - 86400000 * 2, lastUpdated: now - 86400000 * 2, requestType: "classroom_issue", requestTypeText: "Classroom Issue", priority: "medium", priorityText: "Medium", requestDetails: "Need room B201 set up for a meeting on Friday at 10 AM. Projector and whiteboard needed.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: [], userConfirmedCompletion: false, completionTimestamp: null, notes: null },
               { id: "samp1a", ticketNumber: getNextTicketNumber(), requestTitle: "Projector Bulb Replacement", status: "Approved", submissionTimestamp: now - 86400000 * 5, lastUpdated: now - 86400000, requestType: "technical_support", requestTypeText: "Technical Support", priority: "high", priorityText: "High", requestDetails: "Projector in Lecture Hall 1 is very dim. Bulb likely needs replacement.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: ["projector_dim.jpg"], userConfirmedCompletion: false, completionTimestamp: null, notes: "Approved. Technician assigned." },
               { id: "samp2b", ticketNumber: getNextTicketNumber(), requestTitle: "Aircon Not Cooling in Lab 3", status: "In Progress", submissionTimestamp: now - 86400000 * 3, lastUpdated: now - 3600000 * 5, requestType: "maintenance", requestTypeText: "Maintenance", priority: "high", priorityText: "High", requestDetails: "The air conditioning unit in Computer Lab 3 is blowing warm air.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: [], userConfirmedCompletion: false, completionTimestamp: null, notes: "Maintenance team is investigating the issue." },
               { id: "samp3c", ticketNumber: getNextTicketNumber(), requestTitle: "Whiteboard Markers Needed", status: "Completed", submissionTimestamp: now - 86400000 * 7, lastUpdated: now - 86400000 * 4, completionTimestamp: now - 86400000 * 4, requestType: "supplies_request", requestTypeText: "Supplies Request", priority: "low", priorityText: "Low", requestDetails: "Need a new box of assorted whiteboard markers for the faculty office.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: [], userConfirmedCompletion: false, notes: "Supplies delivered to faculty office." },
               { id: "samp5e", ticketNumber: getNextTicketNumber(), requestTitle: "Network Port Issue CS205", status: "Completed", submissionTimestamp: now - 86400000 * 10, lastUpdated: now - 86400000 * 6, completionTimestamp: now - 86400000 * 6, requestType: "technical_support", requestTypeText: "Technical Support", priority: "medium", priorityText: "Medium", requestDetails: "Network port near the instructor station in CS205 is not working.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: [], userConfirmedCompletion: true, notes: "Port tested and re-terminated. Verified working." },
               { id: "samp4d", ticketNumber: getNextTicketNumber(), requestTitle: "Software Installation Request", status: "Rejected", submissionTimestamp: now - 86400000 * 9, lastUpdated: now - 86400000 * 8, completionTimestamp: now - 86400000 * 8, requestType: "technical_support", requestTypeText: "Technical Support", priority: "medium", priorityText: "Medium", requestDetails: "Request to install specialized simulation software 'SimuPro v3' on lab computers.", firstName: sampleProfile.firstName, lastName: sampleProfile.lastName, email: sampleProfile.email, employeeId: sampleProfile.employeeId, college: sampleProfile.college, attachments: [], userConfirmedCompletion: false, notes: "Rejected. Software license not approved for lab-wide installation. Please consult department head." },
            ];
            saveRequests(sampleRequests);
            console.log("addSampleDataIfNeeded: Sample data save attempted.");
        } else {
           console.log("addSampleDataIfNeeded: Existing data found, skipping sample data.");
        }
    }

    // --- Page Initializers ---
    function initializeHomePage() {
        const $pendingCount = $('#pending-count');
        const $approvedCount = $('#approved-count');
        const $progressCount = $('#progress-count');
        const $notificationContent = $('#notification-content');
        const $noNotificationMsg = $('#no-notification-message');
        if (!$pendingCount?.length || !$approvedCount?.length || !$progressCount?.length || !$notificationContent?.length || !$noNotificationMsg?.length) { return; }
        const requests = getRequests();
        let pending = 0, approved = 0, progress = 0;
        let notificationsHtml = '';
        const notificationCutoff = Date.now() - (NOTIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        const sortedRequests = [...requests].sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        sortedRequests.forEach(r => {
            switch (r.status?.toLowerCase()) {
                case 'pending': pending++; break;
                case 'approved': approved++; break;
                case 'in progress': progress++; break;
            }
            if (r.lastUpdated && r.lastUpdated > notificationCutoff && r.status?.toLowerCase() !== 'pending') {
                const hoursAgo = Math.round((Date.now() - r.lastUpdated) / (60 * 60 * 1000));
                const daysAgo = Math.round(hoursAgo / 24);
                let timeAgoStr = (hoursAgo < 1) ? '<1hr ago' : (hoursAgo < 24 ? `${hoursAgo}hr ago` : `${daysAgo}d ago`);
                notificationsHtml += `<p class="mb-1 small border-bottom pb-1">Request <strong>#${r.ticketNumber || 'N/A'}</strong> (${r.requestTitle || 'N/A'}) status updated to: <strong>${r.status}</strong>.<em class="text-muted float-end">${timeAgoStr}</em></p>`;
            }
        });
        $pendingCount.text(pending);
        $approvedCount.text(approved);
        $progressCount.text(progress);
        if (notificationsHtml) {
            $noNotificationMsg.hide();
            $notificationContent.html(notificationsHtml);
        } else {
            $noNotificationMsg.show().text(`No relevant notifications in the last ${NOTIFICATION_EXPIRY_DAYS} days.`);
            $notificationContent.empty().append($noNotificationMsg);
        }
    }

    function initializeRequestPage() {
        const $form = $('#request-form');
        const $requestTypeSelect = $('#request-type');
        const $otherTypeDisplay = $('#other-request-type-display');
        if (!$form.length || !$requestTypeSelect.length || !otherRequestTypeModal) { return; }
        $requestTypeSelect.off('change').on('change', function() {
            if ($(this).val() === 'other') {
                $('#other-request-type-input').val('').removeClass('is-invalid');
                otherRequestTypeModal.show();
            } else {
                $form.removeData('other-request-text'); $otherTypeDisplay.text('').hide();
            }
        });
        $('#confirmOtherRequestTypeBtn').off('click').on('click', function() {
            const $input = $('#other-request-type-input'); const otherText = $input.val().trim();
            if (!otherText) { $input.addClass('is-invalid'); return; }
            $input.removeClass('is-invalid');
            $form.data('other-request-text', otherText);
            $otherTypeDisplay.text(`Specified: ${otherText}`).show();
            otherRequestTypeModal.hide();
        });
         $('#cancelOtherRequestTypeBtn').off('click').on('click', function() {
            $requestTypeSelect.val(''); $form.removeData('other-request-text'); $otherTypeDisplay.text('').hide();
            otherRequestTypeModal.hide();
         });
        $form.off('submit').on('submit', function(event) {
            event.preventDefault(); event.stopPropagation();
            if ($requestTypeSelect.val() === 'other' && !$form.data('other-request-text')) {
                showToast("Please specify the 'Other' request type.", "warning");
                $requestTypeSelect.addClass('is-invalid');
                otherRequestTypeModal.show();
                return;
            } else { $requestTypeSelect.removeClass('is-invalid'); }
            if (!this.checkValidity()) {
                $(this).addClass('was-validated');
                showToast("Please fill out all required fields.", "warning"); return;
            }
            const requests = getRequests(); const submissionTime = Date.now();
            const requestTypeVal = $requestTypeSelect.val();
            let requestTypeText = $('#request-type option:selected').text();
            const currentUserProfile = getUserProfile();
            const newRequestId = submissionTime.toString(16) + Math.random().toString(16).substring(2, 10);
            const newTicketNumber = getNextTicketNumber();
            if (requestTypeVal === 'other') {
                requestTypeText = $form.data('other-request-text') || 'Other - Not Specified';
            }
            const newRequest = {
                id: newRequestId,
                ticketNumber: newTicketNumber,
                submissionTimestamp: submissionTime, status: 'Pending', completionTimestamp: null, lastUpdated: submissionTime, notes: null,
                lastName: currentUserProfile.lastName, firstName: currentUserProfile.firstName, middleName: currentUserProfile.middleName, suffix: currentUserProfile.suffix, email: currentUserProfile.email, employeeId: currentUserProfile.employeeId, college: currentUserProfile.college, collegeText: currentUserProfile.college,
                requestType: requestTypeVal, requestTypeText: requestTypeText, priority: $('#priority').val(), priorityText: $('#priority option:selected').text(), requestTitle: $('#request-title').val().trim(), requestDetails: $('#request-details').val().trim(), attachments: [], userConfirmedCompletion: false
            };
            const attachmentInput = document.getElementById('attachments');
            if (attachmentInput?.files.length > 0) {
                newRequest.attachments = Array.from(attachmentInput.files).map(file => file.name);
            }
            requests.push(newRequest); saveRequests(requests);
            showToast(`Request #${newRequest.ticketNumber} submitted.`, 'success');
            this.reset(); $form.removeClass('was-validated'); $requestTypeSelect.removeClass('is-invalid'); $form.removeData('other-request-text'); $otherTypeDisplay.text('').hide();
            initializeHomePage();
            initializeStatusPage();
            if ($('#history-section').is(':visible')) { initializeHistoryPage(); }
            $('.sidebar .nav-link[href="#status-section"]').trigger('click');
        });
    }

     function initializeStatusPage() {
        const $statusContent = $('#status-content'); const $noStatusMsg = $('#no-status-message'); const $header = $('#status-section .content-table-header');
        if (!$statusContent.length || !$noStatusMsg.length || !$header.length) { return; }
        const requests = getRequests();
        const activeRequests = requests.filter(r => r.status?.toLowerCase() !== 'rejected' && r.userConfirmedCompletion !== true);
        $statusContent.empty(); $('.tooltip').tooltip('dispose');
        if (activeRequests.length === 0) {
            $noStatusMsg.show().find('p').text("No active requests found."); $header.hide();
            $noStatusMsg.find('a').show();
        } else {
            $noStatusMsg.hide(); $header.removeClass('d-none').addClass('d-md-flex');
            activeRequests.sort((a, b) => (b.submissionTimestamp || 0) - (a.submissionTimestamp || 0));
            activeRequests.forEach(req => {
                const displayTicket = String(req.ticketNumber || 'N/A');
                const statusBadgeClass = getStatusBadgeClass(req.status);
                const isCompletedAwaitingConfirm = req.status?.toLowerCase() === 'completed';
                const canCancel = ['pending', 'approved'].includes(req.status?.toLowerCase());
                const dateToShow = formatDate(req.lastUpdated || req.submissionTimestamp);
                let actionButtonsHtml = '';
                if (isCompletedAwaitingConfirm) {
                    actionButtonsHtml = `<button class="btn btn-sm btn-outline-success confirm-completion-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="Confirm Completion"><i class="fas fa-check d-inline d-sm-none"></i><span class="d-none d-sm-inline">Confirm</span></button> <button class="btn btn-sm btn-outline-danger report-issue-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="Report Issue"><i class="fas fa-flag d-inline d-sm-none"></i><span class="d-none d-sm-inline">Report</span></button> <button class="btn btn-sm btn-outline-secondary view-details-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="View Details"><i class="fas fa-eye d-inline d-sm-none"></i><span class="d-none d-sm-inline-block" style="font-size:0.8em;">View</span></button>`;
                } else if (req.status?.toLowerCase() === 'reported') {
                     actionButtonsHtml = `<button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="View Details"><i class="fas fa-eye d-inline d-sm-none"></i><span class="d-none d-sm-inline">View</span></button>`;
                } else {
                    actionButtonsHtml = `<button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="View Details"><i class="fas fa-eye d-inline d-sm-none"></i><span class="d-none d-sm-inline">View</span></button>`;
                    if (canCancel) { actionButtonsHtml += ` <button class="btn btn-sm btn-outline-warning cancel-request-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="Cancel Request"><i class="fas fa-times d-inline d-sm-none"></i><span class="d-none d-sm-inline">Cancel</span></button>`; }
                }
                const cardHtml = `<div class="card mb-2 status-request-card" data-request-id="${req.id}"><div class="card-body d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center px-3 py-2"><div class="col-content" data-label="Ticket:" title="Internal ID: ${req.id}"><span class="text-muted ticket-display">${displayTicket}</span></div><div class="col-content" data-label="Subject:" title="${req.requestTitle||'N/A'}"><span>${req.requestTitle||'N/A'}</span></div><div class="col-content" data-label="Status:"><span class="badge ${statusBadgeClass} text-truncate status-badge">${req.status||'N/A'}</span></div><div class="col-content text-md-left" data-label="Updated:"><span class="text-muted small last-updated-date">${dateToShow}</span></div><div class="col-content" data-label="Action:"><div class="action-buttons d-flex flex-wrap gap-1">${actionButtonsHtml}</div></div></div></div>`;
                $statusContent.append(cardHtml);
            });
             $statusContent.find('[data-bs-toggle="tooltip"]').tooltip({ container: 'body', trigger: 'hover' });
        }
    }

    function initializeHistoryPage() {
        const $historyContent = $('#history-content'); const $noHistoryMsg = $('#no-history-message'); const $header = $('#history-section .content-table-header');
        if (!$historyContent.length || !$noHistoryMsg.length || !$header.length) { return; }
        const requests = getRequests();
        const finalizedRequests = requests.filter(r => r.status?.toLowerCase() === 'rejected' || r.userConfirmedCompletion === true);
        $historyContent.empty(); $('.tooltip').tooltip('dispose');
        if (finalizedRequests.length === 0) {
            $noHistoryMsg.show().find('p').text("No finalized requests found."); $header.hide();
        } else {
            $noHistoryMsg.hide(); $header.removeClass('d-none').addClass('d-md-flex');
            finalizedRequests.sort((a, b) => (b.completionTimestamp || b.lastUpdated || b.submissionTimestamp || 0) - (a.completionTimestamp || a.lastUpdated || a.submissionTimestamp || 0));
            finalizedRequests.forEach(req => {
                const displayTicket = String(req.ticketNumber || 'N/A');
                const statusBadgeClass = getStatusBadgeClass(req.status);
                const finalizedDate = formatDate(req.completionTimestamp || req.lastUpdated);
                const actionButtonsHtml = `<button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="View Details"><i class="fas fa-eye d-inline d-sm-none"></i><span class="d-none d-sm-inline">View</span></button>`;
                const cardHtml = `<div class="card mb-2 history-request-card" data-request-id="${req.id}"><div class="card-body d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center px-3 py-2"><div class="col-content" data-label="Ticket:" title="Internal ID: ${req.id}"><span class="text-muted ticket-display">${displayTicket}</span></div><div class="col-content" data-label="Subject:" title="${req.requestTitle||'N/A'}"><span>${req.requestTitle||'N/A'}</span></div><div class="col-content" data-label="Status:"><span class="badge ${statusBadgeClass} text-truncate status-badge">${req.status||'N/A'}</span></div><div class="col-content text-md-left" data-label="Finalized:"><span class="text-muted small finalized-date">${finalizedDate}</span></div><div class="col-content" data-label="Action:"><div class="action-buttons">${actionButtonsHtml}</div></div></div></div>`;
                $historyContent.append(cardHtml);
            });
             $historyContent.find('[data-bs-toggle="tooltip"]').tooltip({ container: 'body', trigger: 'hover' });
        }
    }


    function initializeSettingsPage() {
        $('#settings-edit-profile-btn').off('click').on('click', function() {
            populateAndConfigureProfileModal('edit');
        });
    }

    // --- Event Handlers ---
    $('#logout-link').on('click', function(event) {
        event.preventDefault();
        showConfirmationModal({ question: "Are you sure you want to logout?", title: "Confirm Logout", confirmBtnTxt: "Logout", confirmBtnClass: "btn-danger", confirmCb: () => { showToast("Logged out successfully!", "info"); setTimeout(() => { window.location.href = "../"; }, 1500); } });
    });

    $('body').on('click', '.cancel-request-btn', function() {
        const reqId = $(this).data('id'); const reqs = getRequests(); const index = reqs.findIndex(r => r.id === reqId);
        if (index > -1 && cancelReasonModal) {
            const req = reqs[index];
            if (!['pending', 'approved'].includes(req.status?.toLowerCase())) { showToast('This request cannot be cancelled.', 'warning'); return; }
            $('#cancel-confirmation-text').text(`Provide reason for cancelling Request #${req.ticketNumber || 'N/A'} (optional):`);
            $('#cancel-reason-input').val('');
            const confirmBtn = document.getElementById('confirmCancelWithReasonBtn');
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', () => {
                const reason = $('#cancel-reason-input').val().trim();
                req.status = 'Rejected'; req.completionTimestamp = Date.now(); req.lastUpdated = Date.now();
                req.notes = reason ? `Cancelled by user. Reason: ${reason}` : 'Cancelled by user.';
                req.userConfirmedCompletion = false;
                saveRequests(reqs); cancelReasonModal.hide();
                showToast(`Request #${req.ticketNumber || 'N/A'} cancelled.`, 'success');
                initializeStatusPage(); initializeHistoryPage();
                if (isHomePageActive()) initializeHomePage();
            }, { once: true });
            cancelReasonModal.show();
        } else { showToast("Error cancelling request.", "danger"); }
    });

    $('body').on('click', '.view-details-btn', function() {
        const reqId = $(this).data('id'); const request = getRequests().find(r => r.id === reqId); const $modal = $('#viewRequestModal');
        if (request && $modal.length && viewRequestModalEl) {
            const displayTicket = String(request.ticketNumber || 'N/A');
            $modal.find('#viewRequestModalLabel').text(`Request Details - #${displayTicket}`);
            $('#view-ticket-id').text(displayTicket);
            const fullName = [request.firstName, request.middleName, request.lastName, request.suffix].filter(Boolean).join(' ');
            $('#view-submitter-name').val(fullName || 'N/A');
            $('#view-request-type').val(request.requestTypeText || 'N/A');
            $('#view-priority').val(request.priorityText || 'N/A');
            $('#view-request-title').val(request.requestTitle || 'N/A');
            $('#view-request-details').val(request.requestDetails || 'N/A');
            const attachments = request.attachments?.length ? request.attachments.map(a => `<span>${a}</span>`).join('<br>') : '<span class="text-muted fst-italic">None</span>';
            $('#view-attachments').html(attachments);
            const statusBadgeClass = getStatusBadgeClass(request.status);
            $('#view-status').html(`<span class="badge ${statusBadgeClass}">${request.status || 'N/A'}</span>`);
            $('#view-submitted').text(formatDate(request.submissionTimestamp));
            $('#view-last-updated').text(formatDate(request.lastUpdated));
            $('#view-completed').text(formatDate(request.completionTimestamp));
            if (request.notes?.trim()) { $('#view-notes').val(request.notes); $('#view-notes-row').show(); }
            else { $('#view-notes').val(''); $('#view-notes-row').hide(); }
            const modalInstance = bootstrap.Modal.getOrCreateInstance(viewRequestModalEl);
            if (modalInstance) { modalInstance.show(); }
            else { showToast("Error showing request details.", "danger"); }
        } else { showToast('Error finding request details or modal.', 'danger'); }
    });

    $('body').on('click', '.confirm-completion-btn', function() {
        const reqId = $(this).data('id'); const requests = getRequests(); const index = requests.findIndex(r => r.id === reqId);
        if (index > -1) {
            const request = requests[index];
            if (request.status?.toLowerCase() === 'completed') {
                showConfirmationModal({
                    question: `Confirm Request #${request.ticketNumber || 'N/A'} has been resolved?`,
                    title: "Confirm Completion", confirmBtnTxt: "Yes, Confirm", confirmBtnClass: "btn-success",
                    confirmCb: () => {
                        request.userConfirmedCompletion = true; request.lastUpdated = Date.now(); saveRequests(requests);
                        showToast(`Request #${request.ticketNumber || 'N/A'} confirmed as completed.`, 'success');
                        initializeStatusPage(); initializeHistoryPage();
                        if (isHomePageActive()) initializeHomePage();
                    }
                });
            } else { showToast("Request is not marked as 'Completed'.", "warning"); }
        } else { showToast("Error finding request.", "danger"); }
    });

    $('body').on('click', '.report-issue-btn', function() {
        const reqId = $(this).data('id'); const request = getRequests().find(r => r.id === reqId);
        if (request && reportIssueModal) {
            if (request.status?.toLowerCase() === 'completed') {
                $('#report-request-id-display').text(String(request.ticketNumber || 'N/A'));
                $('#report-request-id-input').val(request.id);
                $('#report-issue-form')[0].reset(); $('#report-issue-form').removeClass('was-validated');
                reportIssueModal.show();
            } else { showToast("Can only report an issue on 'Completed' requests.", "warning"); }
        } else { showToast("Error preparing report form.", "danger"); }
    });

    $('#submitReportBtn').on('click', function() {
        const $form = $('#report-issue-form'); const formElement = $form[0];
        $form.addClass('was-validated');
        if (!formElement.checkValidity()) { showToast("Please fill required report fields.", "warning"); return; }
        const reqId = $('#report-request-id-input').val(); const comments = $('#report-comments').val().trim();
        const reportFilesInput = document.getElementById('report-attachments'); let reportedFileNames = [];
        if (reportFilesInput?.files.length > 0) {
             reportedFileNames = Array.from(reportFilesInput.files).map(file => file.name);
        }
        if (!reqId || !comments) { showToast("Missing report information.", "danger"); return; }
        const requests = getRequests(); const index = requests.findIndex(r => r.id === reqId);
        if (index > -1) {
            const request = requests[index]; const now = Date.now(); const reportTimestamp = formatDate(now);
            request.status = 'Reported'; request.completionTimestamp = null; request.userConfirmedCompletion = false; request.lastUpdated = now;
            let reportNote = `\n---\nReported Issue (${reportTimestamp}):\n${comments}`;
            if (reportedFileNames.length > 0) { reportNote += `\nAttached Files (Report): ${reportedFileNames.join(', ')}`; }
            request.notes = (request.notes || '') + reportNote;
            saveRequests(requests); reportIssueModal.hide();
            showToast(`Issue reported for Request #${request.ticketNumber || 'N/A'}.`, 'reported');
            initializeStatusPage(); initializeHistoryPage();
            if (isHomePageActive()) initializeHomePage();
        } else { showToast("Error updating request with report.", "danger"); }
    });


    // --- Profile Modal Handlers ---
    function populateAndConfigureProfileModal(mode = 'view') {
        if (!userProfileModal || !userProfileModalEl) { return; }
        const profileData = getUserProfile();
        const $form = $('#edit-profile-form');
        const $preview = $('#profile-picture-preview'); const $iconPlaceholder = $('#profile-icon-placeholder-edit');
        const $base64Input = $('#profile-picture-base64');
        const $pictureChangeBtn = $('label[for="profile-picture-input"]'); const $pictureRemoveBtn = $('#remove-profile-picture-btn');
        const $passwordSection = $('#profile-password-section');
        const $newPasswordInput = $('#profile-edit-new-password'); const $confirmPasswordInput = $('#profile-edit-confirm-password');
        const $saveBtn = $('#save-profile-btn');
        const $modalTitle = $('#userProfileModalLabel');
        const $firstNameInput = $('#profile-edit-firstname'); const $lastNameInput = $('#profile-edit-lastname');
        const $middleNameInput = $('#profile-edit-middlename'); const $suffixInput = $('#profile-edit-suffix');
        const $emailInput = $('#profile-edit-email'); const $phoneInput = $('#profile-edit-phone');
        const $employeeIdInput = $('#profile-edit-employee-id'); const $collegeInput = $('#profile-edit-college');
        const $positionInput = $('#profile-edit-position');
        const allInputs = $form.find('input:not([type=file]), textarea, select');

        $firstNameInput.val(profileData.firstName); $lastNameInput.val(profileData.lastName); $middleNameInput.val(profileData.middleName);
        $suffixInput.val(profileData.suffix); $emailInput.val(profileData.email); $phoneInput.val(profileData.phone);
        $employeeIdInput.val(profileData.employeeId); $collegeInput.val(profileData.college); $positionInput.val(profileData.position);

        $preview.off('error'); $base64Input.val(''); $iconPlaceholder.hide();
        const pictureSrc = profileData.profilePicture || DEFAULT_PROFILE_PIC;
        $preview.show().attr('src', pictureSrc).on('error', function() { $(this).hide(); $iconPlaceholder.show(); $(this).attr('src', DEFAULT_PROFILE_PIC); $base64Input.val(''); });

        if (mode === 'view') {
            $modalTitle.text('View User Profile');
             [$firstNameInput, $lastNameInput, $middleNameInput, $suffixInput, $emailInput, $phoneInput, $employeeIdInput, $collegeInput, $positionInput, $newPasswordInput, $confirmPasswordInput]
                .forEach($field => {
                    $field.prop('readonly', true);
                    if (!$field.hasClass('form-control-plaintext')) {
                         $field.removeClass('form-control').addClass('form-control-plaintext');
                    }
                 });
            $pictureChangeBtn.hide(); $pictureRemoveBtn.hide(); $passwordSection.hide(); $saveBtn.hide();
        } else {
            $modalTitle.text('Edit User Profile');
            [$firstNameInput, $lastNameInput, $middleNameInput, $suffixInput, $emailInput, $phoneInput]
                .forEach($field => {
                    $field.prop('readonly', false);
                    if (!$field.hasClass('form-control')) {
                        $field.removeClass('form-control-plaintext').addClass('form-control');
                    }
                 });
             [$employeeIdInput, $collegeInput, $positionInput]
                .forEach($field => {
                    $field.prop('readonly', true);
                     if (!$field.hasClass('form-control-plaintext')) {
                         $field.removeClass('form-control').addClass('form-control-plaintext');
                     }
                 });
              [$newPasswordInput, $confirmPasswordInput]
                .forEach($field => {
                    $field.prop('readonly', false);
                    if (!$field.hasClass('form-control')) {
                        $field.removeClass('form-control-plaintext').addClass('form-control');
                    }
                 });
            $pictureChangeBtn.show(); $pictureRemoveBtn.show(); $passwordSection.show(); $saveBtn.show();
        }

        $newPasswordInput.val('').removeClass('is-invalid is-valid');
        $confirmPasswordInput.val('').removeClass('is-invalid is-valid');
        $('#new-password-feedback').text(''); $('#confirm-password-feedback').text('Passwords do not match.');
        $form.removeClass('was-validated');

        userProfileModal.show();
    }


    $('body').on('click', '#profile-icon-link', function(event) {
        event.preventDefault();
        populateAndConfigureProfileModal('view');
    });

    $('#profile-picture-input').on('change', function(event) {
        const file = event.target.files[0];
        const $preview = $('#profile-picture-preview'); const $iconPlaceholder = $('#profile-icon-placeholder-edit');
        const $base64Input = $('#profile-picture-base64');
        if (file) {
            if (!file.type.startsWith('image/')) { showToast("Invalid image file type.", "warning"); $(this).val(''); return; }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { showToast(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`, "warning"); $(this).val(''); return; }
            const reader = new FileReader();
            reader.onload = (e) => { $iconPlaceholder.hide(); $preview.attr('src', e.target.result).show(); $base64Input.val(e.target.result); }
            reader.onerror = () => { showToast("Error reading image.", "danger"); $preview.hide(); $iconPlaceholder.show(); $base64Input.val(''); }
            reader.readAsDataURL(file);
        } else { $base64Input.val(''); }
    });

    $('#remove-profile-picture-btn').on('click', function() {
         $('#profile-picture-preview').attr('src', DEFAULT_PROFILE_PIC).show();
         $('#profile-icon-placeholder-edit').hide();
         $('#profile-picture-base64').val('REMOVE');
         $('#profile-picture-input').val('');
         showToast("Profile picture marked for removal.", "info");
    });

    $('#save-profile-btn').on('click', function() {
        const $form = $('#edit-profile-form'); const formElement = $form[0];
        let passwordChangeAttempted = false; let passwordIsValid = true; let generalFieldsValid = true;

        const $newPasswordInput = $('#profile-edit-new-password'); const $confirmPasswordInput = $('#profile-edit-confirm-password');
        const newPassword = $newPasswordInput.val(); const confirmPassword = $confirmPasswordInput.val();
        $newPasswordInput.removeClass('is-invalid is-valid'); $confirmPasswordInput.removeClass('is-invalid is-valid');
        $('#new-password-feedback').text(''); $('#confirm-password-feedback').text('Passwords do not match.');
        if (newPassword || confirmPassword) {
            passwordChangeAttempted = true;
            if (!newPassword) { $newPasswordInput.addClass('is-invalid'); $('#new-password-feedback').text('New password required.'); passwordIsValid = false; }
            if (newPassword !== confirmPassword) { $confirmPasswordInput.addClass('is-invalid'); passwordIsValid = false; }
            if(passwordIsValid && newPassword) { $newPasswordInput.addClass('is-valid'); $confirmPasswordInput.addClass('is-valid'); }
        }

         $form.addClass('was-validated');
         if (!$('#profile-edit-firstname')[0].checkValidity()) generalFieldsValid = false;
         if (!$('#profile-edit-lastname')[0].checkValidity()) generalFieldsValid = false;
         if (!$('#profile-edit-email')[0].checkValidity()) generalFieldsValid = false;

        if (!generalFieldsValid || !passwordIsValid) {
             if (!generalFieldsValid) { showToast("Fill required fields (First Name, Last Name, Email).", "warning"); }
             else if (!passwordIsValid) { showToast("Correct password errors.", "warning"); }
             if(!passwordIsValid && passwordChangeAttempted) {
                if (!$newPasswordInput.val()) $newPasswordInput.addClass('is-invalid');
                if ($newPasswordInput.val() !== $confirmPasswordInput.val()) $confirmPasswordInput.addClass('is-invalid');
             }
            return;
        }

        const $base64Input = $('#profile-picture-base64'); const newBase64Data = $base64Input.val();
        const currentProfile = getUserProfile(); let finalPictureData = currentProfile.profilePicture;
        if (newBase64Data === 'REMOVE') { finalPictureData = DEFAULT_PROFILE_PIC; }
        else if (newBase64Data && newBase64Data.startsWith('data:image')) { finalPictureData = newBase64Data; }

        const editableProfileData = {
            firstName: $form.find('#profile-edit-firstname').val().trim(),
            lastName: $form.find('#profile-edit-lastname').val().trim(),
            middleName: $form.find('#profile-edit-middlename').val().trim(),
            suffix: $form.find('#profile-edit-suffix').val().trim(),
            email: $form.find('#profile-edit-email').val().trim(),
            phone: $form.find('#profile-edit-phone').val().trim(),
            profilePicture: finalPictureData
        };

        let profileSaved = saveUserProfile(editableProfileData); let passwordMessage = "";

        if (passwordChangeAttempted && passwordIsValid && newPassword) {
            console.log("Simulating password change:", newPassword);
            passwordMessage = " Password change requested (simulated).";
            $newPasswordInput.val(''); $confirmPasswordInput.val('');
            $newPasswordInput.removeClass('is-valid is-invalid'); $confirmPasswordInput.removeClass('is-valid is-invalid');
        }

        if (profileSaved) {
            showToast("Profile updated!" + passwordMessage, "success");
            userProfileModal.hide();
             const newPicSrc = editableProfileData.profilePicture || DEFAULT_PROFILE_PIC;
             const $profileIconLink = $('#profile-icon-link');
             $profileIconLink.find('img').remove();
             $profileIconLink.find('i').show();
              if (newPicSrc !== DEFAULT_PROFILE_PIC && (newPicSrc.startsWith('data:image') || newPicSrc.includes('.'))) {
                const $img = $('<img>').attr('src', newPicSrc).addClass('rounded-circle').css({'width': '24px', 'height': '24px', 'object-fit': 'cover', 'vertical-align': 'middle'});
                 $profileIconLink.prepend($img);
                 $profileIconLink.find('i').hide();
                 $img.on('error', function() { $(this).remove(); $profileIconLink.find('i').show(); });
              }
        } else if (!profileSaved && passwordChangeAttempted && passwordIsValid && newPassword) {
             showToast("Error saving profile, but password change requested (simulated).", "warning"); userProfileModal.hide();
        } else { showToast("Failed to save profile updates.", "danger"); }
    });


     if (userProfileModalEl) {
        userProfileModalEl.addEventListener('hide.bs.modal', function () {
            const $form = $('#edit-profile-form');
            $form.removeClass('was-validated');

            $('#profile-edit-new-password').val('').removeClass('is-invalid is-valid');
            $('#profile-edit-confirm-password').val('').removeClass('is-invalid is-valid');
            $('#new-password-feedback').text('');
            $('#confirm-password-feedback').text('Passwords do not match.');

            $('#profile-picture-base64').val('');
            $('#profile-picture-input').val('');

            const fieldsToResetStyle = [
                 $('#profile-edit-firstname'), $('#profile-edit-lastname'), $('#profile-edit-middlename'),
                 $('#profile-edit-suffix'), $('#profile-edit-email'), $('#profile-edit-phone')
             ];
             fieldsToResetStyle.forEach($field => {
                 if (!$field.hasClass('form-control')) {
                    $field.removeClass('form-control-plaintext').addClass('form-control');
                 }
                 $field.removeClass('is-invalid is-valid');
             });

             $('#profile-edit-employee-id, #profile-edit-college, #profile-edit-position').each(function() {
                 if (!$(this).hasClass('form-control-plaintext')) {
                    $(this).removeClass('form-control').addClass('form-control-plaintext');
                 }
             });
        });
    }


    // --- Sidebar Navigation ---
    $('.sidebar .nav-link').on('click', function(event) {
        if ($(this).attr('id') === 'logout-link') return;
        const targetId = $(this).attr('href'); if (!targetId || !targetId.startsWith('#') || targetId.length === 1) return;
        event.preventDefault();
        $('.content-section').hide();
        try {
            $(targetId).show();
        } catch (e) {
            console.error("Error showing section:", targetId, e);
            $('#home-section').show();
            targetId = '#home-section';
        }
        $('.sidebar .nav-link').removeClass('active').removeAttr('aria-current'); $(this).addClass('active').attr('aria-current', 'page');
        switch (targetId) {
            case '#home-section': initializeHomePage(); break;
            case '#request-section': initializeRequestPage(); break;
            case '#status-section': initializeStatusPage(); break;
            case '#history-section': initializeHistoryPage(); break;
            case '#settings-section': initializeSettingsPage(); break;
        }
        $('.content-area').scrollTop(0);
    });


    // --- Internal Navigation (e.g., View All Links) ---
    $('body').on('click', '.internal-nav', function(event) {
        event.preventDefault();
        const targetSectionId = $(this).attr('href');
        const $targetNavLink = $(`.sidebar .nav-link[href="${targetSectionId}"]`);
        if ($targetNavLink.length) {
            $targetNavLink.trigger('click');
            $('.main-content .content-area').animate({ scrollTop: 0 }, 300);
        } else {
            console.warn("Internal nav target sidebar link not found:", targetSectionId);
        }
    });


    // --- Helper ---
    function isHomePageActive() {
        return $('#home-section').is(':visible');
    }

    // --- Initial Load Setup ---
    addSampleDataIfNeeded();

    $('.content-section').hide();
    $('#home-section').show();
    $('.sidebar .nav-link').removeClass('active').removeAttr('aria-current');
    $('.sidebar .nav-link[href="#home-section"]').addClass('active').attr('aria-current', 'page');

    initializeHomePage();
    initializeRequestPage();
    initializeSettingsPage();
    initializeStatusPage();
    initializeHistoryPage();

    $('body').tooltip({ selector: '[data-bs-toggle="tooltip"]', container: 'body', trigger: 'hover' });

    const initialProfile = getUserProfile();
    const initialPicSrc = initialProfile.profilePicture || DEFAULT_PROFILE_PIC;
    const $profileLinkHeader = $('#profile-icon-link');
    if (initialPicSrc !== DEFAULT_PROFILE_PIC && (initialPicSrc.startsWith('data:image') || initialPicSrc.includes('.'))) {
        const $img = $('<img>').attr('src', initialPicSrc).addClass('rounded-circle').css({'width': '24px', 'height': '24px', 'object-fit': 'cover', 'vertical-align': 'middle'});
        $profileLinkHeader.prepend($img);
        $profileLinkHeader.find('i').hide();
        $img.on('error', function() { $(this).remove(); $profileLinkHeader.find('i').show(); });
    }

});
