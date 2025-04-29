$(function() {
    'use strict';

    const STORAGE_KEY = 'facultyRequests';
    const NOTIFICATION_EXPIRY_DAYS = 3;

    const confirmationModalEl = document.getElementById('confirmationModal');
    const confirmationModal = confirmationModalEl ? new bootstrap.Modal(confirmationModalEl) : null;
    const confirmationModalBody = document.getElementById('confirmationModalBody');
    const confirmationModalTitle = document.getElementById('confirmationModalLabel');
    const confirmActionButton = document.getElementById('confirmActionButton');
    const viewRequestModalEl = document.getElementById('viewRequestModal');
    const userProfileModalEl = document.getElementById('userProfileModal');
    const userProfileModal = userProfileModalEl ? new bootstrap.Modal(userProfileModalEl) : null;

    function injectSampleData() {
        const existingRequests = localStorage.getItem(STORAGE_KEY);
        let requestsArray = [];
        try {
            requestsArray = existingRequests ? JSON.parse(existingRequests) : [];
        } catch (e) {
            console.error("Parse error", e);
            localStorage.removeItem(STORAGE_KEY);
        }
        const needsInjection = !Array.isArray(requestsArray) || requestsArray.length === 0 || !requestsArray[0]?.collegeText;
        if (needsInjection) {
            console.log("Injecting sample data...");
            localStorage.removeItem(STORAGE_KEY);
            const now = Date.now(), oneDay = 86400000;
            const sampleRequests = [
                { id: "1700000001abc", status: 'Pending', submissionTimestamp: now - (oneDay * 2), completionTimestamp: null, lastUpdated: now - (oneDay * 2), notes: null, lastName: "Smith", firstName: "John", middleName: "A.", suffix: "", email: "jsmith@example.edu", employeeId: "E12345", college: "coe", collegeText: "Engineering", requestType: "technical_support", requestTypeText: "Technical Support", priority: "medium", priorityText: "Medium", requestTitle: "Projector Not Working", requestDetails: "No Signal message.", attachments: ["photo_301.jpg"] },
                { id: "1700000002def", status: 'Approved', submissionTimestamp: now - (oneDay * 5), completionTimestamp: null, lastUpdated: now - (oneDay * 1), notes: "Technician assigned.", lastName: "Garcia", firstName: "Maria", middleName: "", suffix: "", email: "mgarcia@example.edu", employeeId: "E67890", college: "cla", collegeText: "Liberal Arts", requestType: "supplies_request", requestTypeText: "Supplies Request", priority: "low", priorityText: "Low", requestTitle: "Whiteboard Markers", requestDetails: "Need markers.", attachments: [] },
                { id: "1700000003ghi", status: 'In Progress', submissionTimestamp: now - (oneDay * 3), completionTimestamp: null, lastUpdated: now - (oneDay / 2), notes: "Parts ordered.", lastName: "Chen", firstName: "Li", middleName: "", suffix: "", email: "lchen@example.edu", employeeId: "E11223", college: "csm", collegeText: "Science and Math", requestType: "maintenance", requestTypeText: "Maintenance", priority: "high", priorityText: "High", requestTitle: "Leaking Faucet", requestDetails: "Drip in Lab B.", attachments: [] },
                { id: "1700000004jkl", status: 'Completed', submissionTimestamp: now - (oneDay * 10), completionTimestamp: now - (oneDay * 7), lastUpdated: now - (oneDay * 7), notes: "Installed.", lastName: "Williams", firstName: "David", middleName: "R.", suffix: "Jr.", email: "dwilliams@example.edu", employeeId: "E44556", college: "ccs", collegeText: "Computing Studies", requestType: "classroom_issue", requestTypeText: "Classroom Issue", priority: "medium", priorityText: "Medium", requestTitle: "Software Install", requestDetails: "Need Python 3.11.", attachments: [] },
                { id: "1700000005mno", status: 'Rejected', submissionTimestamp: now - (oneDay * 6), completionTimestamp: now - (oneDay * 4), lastUpdated: now - (oneDay * 4), notes: "Handled by Security.", lastName: "Brown", firstName: "Sarah", middleName: "", suffix: "", email: "sbrown@example.edu", employeeId: "E77889", college: "che", collegeText: "Home Economics", requestType: "other", requestTypeText: "Other", priority: "low", priorityText: "Low", requestTitle: "Parking Permit", requestDetails: "Renewal question.", attachments: [] }
            ];
            saveRequests(sampleRequests);
        } else {
            console.log("Existing data found.");
        }
    }

    function getRequests() {
        const requestsJson = localStorage.getItem(STORAGE_KEY);
        try {
            const parsed = requestsJson ? JSON.parse(requestsJson) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Parse error", e);
            return [];
        }
    }

    function saveRequests(requests) {
        if (!Array.isArray(requests)) {
            console.error("Save error: not array");
            return;
        }
        try {
            requests.forEach(r => {
                r.submissionTimestamp = Number(r.submissionTimestamp);
                r.completionTimestamp = Number(r.completionTimestamp);
                r.lastUpdated = Number(r.lastUpdated);
                r.notes = r.notes ? String(r.notes) : null;
                r.collegeText = r.collegeText ? String(r.collegeText) : r.collegeText;
                r.requestTypeText = r.requestTypeText ? String(r.requestTypeText) : r.requestTypeText;
                r.priorityText = r.priorityText ? String(r.priorityText) : r.priorityText;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        } catch (e) {
            console.error("Save error", e);
            showToast("Error saving request data.", "danger");
        }
    }

    function formatDate(timestamp) {
        if (!timestamp || isNaN(Number(timestamp))) return 'N/A';
        try {
            const date = new Date(Number(timestamp));
            return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
                   ' ' +
                   date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            console.error("Date format error", e);
            return 'Invalid Date';
        }
    }

    function getStatusBadgeClass(status) {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'approved': return 'bg-success';
            case 'in progress': return 'bg-info text-dark';
            case 'completed': return 'bg-secondary';
            case 'rejected': return 'bg-danger';
            default: return 'bg-light text-dark';
        }
    }

    function showToast(message, type = 'success', delay = 5000) {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) { console.error("Toast container missing"); alert(message); return; }
        const toastId = 'toast-' + Date.now();
        const toastBg = type === 'danger' ? 'bg-danger' : (type === 'warning' ? 'bg-warning text-dark' : 'bg-success');
        const toastHtml = `<div class="toast align-items-center text-white ${toastBg} border-0" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}" data-bs-delay="${delay}"><div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        const bootstrapToast = new bootstrap.Toast(toastEl);
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        bootstrapToast.show();
    }

    function showConfirmationModal(options) {
        const { question = "Sure?", title = "Confirm", confirmBtnTxt = "Confirm", confirmBtnClass = "btn-danger", confirmCb = () => {}, cancelCb = () => {} } = options;
        if (!confirmationModal || !confirmationModalBody || !confirmationModalTitle || !confirmActionButton) { console.error("Confirm modal elements missing"); if (confirm(question)) { confirmCb(); } else { cancelCb(); } return; }
        confirmationModalTitle.textContent = title;
        confirmationModalBody.textContent = question;
        let currentConfirmBtn = document.getElementById('confirmActionButton');
        currentConfirmBtn.textContent = confirmBtnTxt;
        currentConfirmBtn.className = `btn ${confirmBtnClass}`;
        const newConfirmBtn = currentConfirmBtn.cloneNode(true);
        currentConfirmBtn.parentNode.replaceChild(newConfirmBtn, currentConfirmBtn);
        newConfirmBtn.addEventListener('click', () => { confirmCb(); confirmationModal.hide(); }, { once: true });
        confirmationModal.show();
    }

    function initializeHomePage() {
        console.log("Init Home Section");
        const $pendingCount = $('#pending-count');
        const $approvedCount = $('#approved-count');
        const $progressCount = $('#progress-count');
        const $notificationContent = $('#notification-content');
        const $noNotificationMsg = $('#no-notification-message');

        if (!$pendingCount?.length || !$approvedCount?.length || !$progressCount?.length || !$notificationContent?.length) {
            return; 
        }

        const requests = getRequests();
        let pending = 0, approved = 0, progress = 0, notificationsHtml = '';
        const notificationCutoff = Date.now() - (NOTIFICATION_EXPIRY_DAYS * 86400000);

        requests.forEach(r => {
            switch (r.status?.toLowerCase()) {
                case 'pending': pending++; break;
                case 'approved': approved++; break;
                case 'in progress': progress++; break;
            }
            if (r.lastUpdated && r.lastUpdated > notificationCutoff && r.status?.toLowerCase() !== 'pending') {
                const ago = Math.round((Date.now() - r.lastUpdated) / 3600000);
                const agoStr = ago < 1 ? '<1hr ago' : (ago < 24 ? `${ago}hr ago` : `${Math.round(ago / 24)}d ago`);
                notificationsHtml += `<p class="mb-1 small border-bottom pb-1">Req <strong>#${r.id.substring(0, 6)}</strong> (${r.requestTitle || 'N/A'}) to <strong>${r.status}</strong>. <em class="text-muted float-end">${agoStr}</em></p>`;
            }
        });

        $pendingCount.text(pending);
        $approvedCount.text(approved);
        $progressCount.text(progress);

        if (notificationsHtml) {
            $noNotificationMsg.hide();
            $notificationContent.html(notificationsHtml);
        } else {
            $noNotificationMsg.show().text('No recent notifications.');
            $notificationContent.empty().append($noNotificationMsg);
        }
    }

    function initializeRequestPage() {
        console.log("Init Request Form Logic");
        const $form = $('#request-form');
        if (!$form.length) return;

        $form.off('submit').on('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.checkValidity()) {
                $(this).addClass('was-validated'); 
                console.log("Request form validation failed.");
                return; 
            }

            const requests = getRequests();
            const newRequest = {
                id: Date.now().toString(16) + Math.random().toString(16).substring(2, 10),
                status: 'Pending',
                submissionTimestamp: Date.now(),
                completionTimestamp: null,
                lastUpdated: Date.now(),
                notes: null,
                lastName: $('#last-name').val(),
                firstName: $('#first-name').val(),
                middleName: $('#middle-name').val(),
                suffix: $('#suffix').val(),
                email: $('#email').val(),
                employeeId: $('#employee-id').val(),
                college: $('#college').val(),
                collegeText: $('#college option:selected').text(),
                requestType: $('#request-type').val(),
                requestTypeText: $('#request-type option:selected').text(),
                priority: $('#priority').val(),
                priorityText: $('#priority option:selected').text(),
                requestTitle: $('#request-title').val(),
                requestDetails: $('#request-details').val(),
                attachments: []
            };
            const attachmentInput = document.getElementById('attachments');
            if (attachmentInput?.files.length > 0) {
                for (let i = 0; i < attachmentInput.files.length; i++) {
                    newRequest.attachments.push(attachmentInput.files[i].name);
                }
            }

            requests.push(newRequest);
            saveRequests(requests);
            showToast(`Request submitted! ID: ${newRequest.id.substring(0, 6)}`, 'success');
            this.reset();
            $form.removeClass('was-validated');
        });
    }

    function initializeStatusPage() {
        console.log("Init Status Section");
        const $statusContent = $('#status-content');
        const $noStatusMsg = $('#no-status-message');
        const $header = $statusContent.prev('.content-table-header'); 
        if (!$statusContent.length) return;

        const requests = getRequests();
        const activeRequests = requests.filter(r => !['completed', 'rejected'].includes(r.status?.toLowerCase()));

        $statusContent.empty();
        $('.tooltip').tooltip('dispose'); 
        if (activeRequests.length === 0) {
            $noStatusMsg.show();
            $header.hide();
        } else {
            $noStatusMsg.hide();
            $header.show();
            activeRequests.sort((a, b) => b.submissionTimestamp - a.submissionTimestamp);

            activeRequests.forEach(req => {
                const statusBadgeClass = getStatusBadgeClass(req.status);
                const canCancel = ['pending', 'approved'].includes(req.status?.toLowerCase());
                let actionButtonsHtml = `<button class="btn btn-sm btn-outline-primary view-details-btn me-1" data-id="${req.id}" data-bs-toggle="tooltip" title="View"><span class="button-text">View</span></button>`;
                if (canCancel) {
                    actionButtonsHtml += `<button class="btn btn-sm btn-outline-warning cancel-request-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="Cancel"><span class="button-text">Cancel</span></button>`;
                }
                const cardHtml = `
                    <div class="card mb-2 status-request-card">
                        <div class="card-body d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center px-3 py-2">
                            <div class="col-content" style="flex-basis:100px;flex-grow:0;"><span class="d-md-none fw-bold me-1">#:</span><span class="text-muted">${req.id.substring(0,6)}</span></div>
                            <div class="col-content" style="flex-grow:1;"><span class="d-md-none fw-bold me-1">Subj:</span><span>${req.requestTitle||'N/A'}</span></div>
                            <div class="col-content" style="flex-basis:120px;flex-grow:0;"><span class="d-md-none fw-bold me-1">St:</span><span class="badge ${statusBadgeClass}">${req.status||'N/A'}</span></div>
                            <div class="col-content text-md-end" style="flex-basis:180px;flex-grow:0;"><span class="d-md-none fw-bold me-1">Date:</span><span class="text-muted small">${formatDate(req.submissionTimestamp)}</span></div>
                            <div class="col-content text-md-end justify-content-md-end" style="flex-basis:140px;flex-grow:0;padding-right:0;">${actionButtonsHtml}</div>
                        </div>
                    </div>`;
                $statusContent.append(cardHtml);
            });
            $statusContent.find('[data-bs-toggle="tooltip"]').tooltip();
        }
    }

    function initializeHistoryPage() {
        console.log("Init History Section");
        const $historyContent = $('#history-content');
        const $noHistoryMsg = $('#no-history-message');
        const $header = $('.content-table-container .content-table-header');
        if (!$historyContent.length) return;

        const requests = getRequests();
        const completedRequests = requests.filter(r => ['completed', 'rejected'].includes(r.status?.toLowerCase()));

        $historyContent.find('.history-request-card').remove(); 
        $('.tooltip').tooltip('dispose');

        if (completedRequests.length === 0) {
            $noHistoryMsg.show();
            $header.hide();
        } else {
            $noHistoryMsg.hide();
            $header.show();
            completedRequests.sort((a, b) => (b.completionTimestamp || b.lastUpdated || b.submissionTimestamp) - (a.completionTimestamp || a.lastUpdated || a.submissionTimestamp));

            completedRequests.forEach(req => {
                const statusBadgeClass = getStatusBadgeClass(req.status);
                const completedDate = formatDate(req.completionTimestamp || req.lastUpdated);
                 const cardHtml = `
                    <div class="card mb-2 history-request-card">
                        <div class="card-body d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center px-3 py-2">
                             <div class="col-content" style="flex-basis:100px;flex-grow:0;"><span class="d-md-none fw-bold me-1">#:</span><span class="text-muted">${req.id.substring(0,6)}</span></div>
                             <div class="col-content" style="flex-grow:1;"><span class="d-md-none fw-bold me-1">Subj:</span><span>${req.requestTitle||'N/A'}</span></div>
                             <div class="col-content" style="flex-basis:120px;flex-grow:0;"><span class="d-md-none fw-bold me-1">St:</span><span class="badge ${statusBadgeClass}">${req.status||'N/A'}</span></div>
                             <div class="col-content text-md-end" style="flex-basis:180px;flex-grow:0;"><span class="d-md-none fw-bold me-1">Date:</span><span class="text-muted small">${completedDate}</span></div>
                             <div class="col-content text-md-end justify-content-md-end" style="flex-basis:80px;flex-grow:0;padding-right:0;"><button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${req.id}" data-bs-toggle="tooltip" title="View"><span class="button-text">View</span></button></div>
                        </div>
                    </div>`;
                $historyContent.append(cardHtml);
            });
             $historyContent.find('[data-bs-toggle="tooltip"]').tooltip();
        }
    }

    $('#logout-link').on('click', function(event) {
        event.preventDefault();
        const url = $(this).attr('href');
        showConfirmationModal({
            question: "Are you sure you want to log out?",
            title: "Logout Confirmation",
            confirmButtonText: "Logout",
            confirmCb: () => { window.location.href = '../LOGIN/'; }
        });
    });

    $('body').on('click', '.cancel-request-btn', function() {
        const reqId = $(this).data('id');
        const reqs = getRequests();
        const idx = reqs.findIndex(r => r.id === reqId);
        if (idx > -1) {
            const r = reqs[idx];
            if (!['pending', 'approved'].includes(r.status?.toLowerCase())) {
                showToast('Cannot cancel now.', 'warning'); return;
            }
            showConfirmationModal({
                question: `Cancel Request #${r.id.substring(0,6)}?`,
                title: "Confirm Cancel",
                confirmButtonText: "Yes, Cancel",
                confirmButtonClass: "btn-warning text-dark",
                confirmCb: () => {
                    const reason = prompt("Reason (optional):");
                    r.status = 'Rejected';
                    r.completionTimestamp = Date.now();
                    r.lastUpdated = Date.now();
                    r.notes = reason ? `Cancelled: ${reason}` : 'Cancelled by user.';
                    saveRequests(reqs);
                    showToast('Request cancelled.', 'success');
                    initializeStatusPage();
                    if (isHomePageActive()) initializeHomePage();
                }
            });
        } else {
            showToast('Error: Request not found.', 'danger');
        }
    });

    $('body').on('click', '.view-details-btn', function() {
        const reqId = $(this).data('id');
        const reqs = getRequests();
        const r = reqs.find(r => r.id === reqId);
        const $m = $('#viewRequestModal');
        if (r && $m.length && viewRequestModalEl) {
            $m.find('#viewRequestModalLabel').text(`Details - #${r.id.substring(0,6)}`);
            $('#view-college').val(r.collegeText || r.college || '');
            $('#view-request-type').val(r.requestTypeText || r.requestType || '');
            $('#view-priority').val(r.priorityText || r.priority || '');
            $('#view-last-name').val(r.lastName || ''); $('#view-first-name').val(r.firstName || ''); $('#view-middle-name').val(r.middleName || ''); $('#view-suffix').val(r.suffix || '');
            $('#view-email').val(r.email || ''); $('#view-employee-id').val(r.employeeId || '');
            $('#view-request-title').val(r.requestTitle || ''); $('#view-request-details').val(r.requestDetails || '');
            const attHtml = r.attachments?.length ? r.attachments.join(', ') : 'None'; $('#view-attachments').text(attHtml);
            const badgeCls = getStatusBadgeClass(r.status); $('#view-status').html(`<span class="badge ${badgeCls}">${r.status || 'N/A'}</span>`);
            $('#view-submitted').text(formatDate(r.submissionTimestamp)); $('#view-last-updated').text(formatDate(r.lastUpdated)); $('#view-completed').text(formatDate(r.completionTimestamp));
            if (r.notes) { $('#view-notes').val(r.notes); $('#view-notes-row').show(); } else { $('#view-notes').val(''); $('#view-notes-row').hide(); }
            const mI = bootstrap.Modal.getOrCreateInstance(viewRequestModalEl);
            if (mI) { mI.show(); } else { showToast("Error opening details.", "danger"); }
        } else {
            showToast('Error displaying details.', 'danger');
            if (!r) console.error(`Req not found: ${reqId}`);
            if (!$m.length) console.error('View modal missing');
        }
    });

    $('.sidebar .nav-link').on('click', function(event) {
        if ($(this).attr('id') === 'logout-link') return;
        event.preventDefault();
        const targetId = $(this).attr('href'); if (!targetId || targetId === '#') return;
        $('.content-section').hide();
        $(targetId).show();
        $('.sidebar .nav-link').removeClass('active').removeAttr('aria-current');
        $(this).addClass('active').attr('aria-current', 'page');
        switch (targetId) {
            case '#home-section': initializeHomePage(); break;
            case '#status-section': initializeStatusPage(); break;
            case '#history-section': initializeHistoryPage(); break;
        }
        console.log(`Navigated to: ${targetId}`);
    });

    $('body').on('click', '.internal-nav', function(event) {
        event.preventDefault();
        const targetSectionId = $(this).attr('href');
        $(`.sidebar .nav-link[href="${targetSectionId}"]`).trigger('click');
    });

    $('body').on('click', '#notification-icon-link', function(event) {
        const $ddm = $('#notification-dropdown-menu'); if (!$ddm.length) return;
        const reqs = getRequests(); let nh=''; const co=Date.now()-(NOTIFICATION_EXPIRY_DAYS*86400000); let hasNotif = false;
        reqs.forEach(r=>{ if(r.lastUpdated && r.lastUpdated > co && r.status?.toLowerCase()!=='pending'){ const ago=Math.round((Date.now()-r.lastUpdated)/3600000); const agoStr=ago<1?'<1hr ago':(ago<24?`${ago}hr ago`:`${Math.round(ago/24)}d ago`); nh+=`<li><a class="dropdown-item small" href="#">Req <strong>#${r.id.substring(0,6)}</strong> to <strong>${r.status}</strong> <span class="text-muted float-end">${agoStr}</span></a></li>`; hasNotif=true; }});
        $ddm.empty(); if(hasNotif){ $ddm.append('<li><h6 class="dropdown-header">Recent Updates</h6></li>'); $ddm.append(nh); } else { $ddm.append('<li><p class="dropdown-item text-muted small text-center mb-0">No new notifications</p></li>'); }
    });

    $('body').on('click', '#profile-icon-link', function(event) {
        event.preventDefault();
        if (!userProfileModal) { showToast("Cannot open profile.", "danger"); return; }
        const reqs = getRequests(); let name="Faculty", email="faculty@example.edu", id="E00000", college="N/A", pos="Faculty", phone="N/A";
        if (reqs.length > 0) {
            reqs.sort((a, b) => b.submissionTimestamp - a.submissionTimestamp);
            const latest = reqs[0];
            name = `${latest.firstName||''} ${latest.lastName||'User'}`.trim();
            email = latest.email || email;
            id = latest.employeeId || id;
            college = latest.collegeText || latest.college || college;
        }
        $('#profile-name').text(name); $('#profile-email').text(email); $('#profile-employee-id').text(id); $('#profile-college').text(college); $('#profile-position').text(pos); $('#profile-phone').text(phone);
        const $pic=$('#profile-picture'), $icon=$('#profile-icon-placeholder');
        $pic.off('error'); $icon.hide();
        $pic.show().on('error', function(){ $(this).hide(); $icon.show(); }).attr('src', 'placeholder-profile.png');
        userProfileModal.show();
    });

    function isHomePageActive() { return $('#home-section').is(':visible'); }

    console.log("Init script...");
    injectSampleData(); 
    $('.content-section').hide(); 
    $('#home-section').show(); 
    $('.sidebar .nav-link').removeClass('active').removeAttr('aria-current'); 
    $('.sidebar .nav-link[href="#home-section"]').addClass('active').attr('aria-current', 'page'); 
    initializeHomePage(); 
    initializeRequestPage();
    $('[data-bs-toggle="tooltip"]').tooltip(); 
    console.log("Init complete.");

});
