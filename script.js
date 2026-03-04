// Initialize appointments from localStorage
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Current calendar state
let currentDate = new Date();

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Save appointments to localStorage
function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Set minimum date for appointment date input (today)
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
}

// Appointment Form Submission
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        appointmentType: document.getElementById('appointmentType').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        reason: document.getElementById('reason').value,
        createdAt: new Date().toISOString()
    };
    
    appointments.push(formData);
    saveAppointments();
    
    showToast('Appointment booked successfully!', 'success');
    this.reset();
    
    // Refresh the calendar display
    renderCalendar();
    
    // Scroll to schedule section
    document.getElementById('schedule').scrollIntoView({ behavior: 'smooth' });
});

// Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In a real application, this would send data to a server
    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    this.reset();
});

// Delete appointment
function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(apt => apt.id !== id);
        saveAppointments();
        renderCalendar();
        showToast('Appointment deleted successfully', 'success');
    }
}

// Calendar rendering
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set header
    currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    let html = '';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        html += `<div class="calendar-day header">${day}</div>`;
    });
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = appointments.filter(apt => apt.appointmentDate === dateStr);
        const hasAppointment = dayAppointments.length > 0;
        
        html += `
            <div class="calendar-day ${hasAppointment ? 'has-appointment' : ''}" 
                 ${hasAppointment ? `onclick="showDayAppointments('${dateStr}')"` : ''}>
                ${day}
                ${hasAppointment ? `<span class="appointment-count">${dayAppointments.length}</span>` : ''}
            </div>
        `;
    }
    
    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
        html += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    calendarGrid.innerHTML = html;
}

// Show appointments for a specific day
function showDayAppointments(dateStr) {
    const dayAppointments = appointments.filter(apt => apt.appointmentDate === dateStr);
    
    if (dayAppointments.length === 0) return;
    
    const formattedDate = formatDate(dateStr);
    let message = `Appointments on ${formattedDate}:\n\n`;
    
    dayAppointments.forEach((apt, index) => {
        message += `${index + 1}. ${apt.fullName} - ${apt.appointmentType}\n`;
        message += `   Time: ${formatTime(apt.appointmentTime)}\n`;
        message += `   Reason: ${apt.reason}\n\n`;
    });
    
    alert(message);
}

// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setMinDate();
    renderCalendar();
});