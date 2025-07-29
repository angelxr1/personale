console.log('main.js loaded and executing...');

document.addEventListener('DOMContentLoaded', () => {
    const monthYearElement = document.getElementById('month-year');
    const calendarElement = document.getElementById('calendar');
    const calendarWeekdaysElement = document.getElementById('calendar-weekdays');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const vacationDaysElement = document.getElementById('vacation-days');
    const sickDaysElement = document.getElementById('sick-days');
    const actualWorkedDaysElement = document.getElementById('actual-worked-days');
    const vacationDatesList = document.getElementById('vacation-dates');
    const eventModal = document.getElementById('event-modal');
    const closeModalButton = document.querySelector('.close-button');
    const eventForm = document.getElementById('event-form');
    const eventIdInput = document.getElementById('event-id');
    const eventDateInput = document.getElementById('event-date');
    const eventTypeInput = document.getElementById('event-type');
    const deleteEventButton = document.getElementById('delete-event');

    let currentDate = new Date();
    let events = [];
    let holidays = [];

    const fetchEvents = async () => {
        console.log('Fetching events...');
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            events = data.events;
            holidays = data.holidays;
            console.log('Fetched events:', events);
            console.log('Fetched holidays:', holidays);
            renderCalendar();
            updateSummary();
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const renderCalendar = () => {
        console.log('Rendering calendar...');
        calendarElement.innerHTML = '';
        calendarWeekdaysElement.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearElement.textContent = `${currentDate.toLocaleString('it-IT', { month: 'long' })} ${year}`;

        const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        weekdays.forEach(day => {
            const dayNameElement = document.createElement('div');
            dayNameElement.classList.add('day-name');
            dayNameElement.textContent = day;
            calendarWeekdaysElement.appendChild(dayNameElement);
        });

        const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Lunedì = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarElement.innerHTML += '<div></div>';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            const date = new Date(year, month, i);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) { // Sunday
                dayElement.classList.add('sunday');
            } else if (dayOfWeek === 6) { // Saturday
                dayElement.classList.add('saturday');
            }

            const event = events.find(e => e.date === dateString);
            if (event) {
                dayElement.classList.add(event.type);
            }

            const holiday = holidays.find(h => h.date === dateString);
            if (holiday) {
                dayElement.classList.add('holiday');
            }

            dayElement.addEventListener('click', () => openModal(dateString, event));
            calendarElement.appendChild(dayElement);
        }
        updateSummary(); // Update summary after rendering calendar
    };

    const updateSummary = () => {
        console.log('Updating summary...');
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let totalWorkingDaysInMonth = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isHoliday = holidays.some(h => h.date === dateString);

            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
                totalWorkingDaysInMonth++;
            }
        }

        const vacationDaysTakenThisMonth = events.filter(e => e.type === 'ferie' && new Date(e.date).getMonth() === month).length;
        const sickDaysTakenThisMonth = events.filter(e => e.type === 'malattia' && new Date(e.date).getMonth() === month).length;
        const actualWorkedDays = totalWorkingDaysInMonth - vacationDaysTakenThisMonth - sickDaysTakenThisMonth;

        vacationDaysElement.textContent = vacationDaysTakenThisMonth;
        sickDaysElement.textContent = sickDaysTakenThisMonth;
        actualWorkedDaysElement.textContent = actualWorkedDays;

        vacationDatesList.innerHTML = '';
        const monthVacations = events.filter(e => e.type === 'ferie' && new Date(e.date).getMonth() === month).sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Month Vacations:', monthVacations);
        if (monthVacations.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nessuna ferie inserita per questo mese.';
            vacationDatesList.appendChild(li);
        } else {
            monthVacations.forEach(v => {
                const li = document.createElement('li');
                li.textContent = new Date(v.date).toLocaleDateString('it-IT');
                vacationDatesList.appendChild(li);
            });
        }
    };

    const openModal = (date, event) => {
        eventModal.style.display = 'block';
        eventDateInput.value = date;
        if (event) {
            eventIdInput.value = event.id;
            eventTypeInput.value = event.type;
            deleteEventButton.style.display = 'block';
        } else {
            eventIdInput.value = '';
            eventTypeInput.value = 'ferie'; // Default to ferie
            deleteEventButton.style.display = 'none';
        }
    };

    const closeModal = () => {
        eventModal.style.display = 'none';
    };

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = eventIdInput.value;
        const date = eventDateInput.value;
        const type = eventTypeInput.value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/events/${id}` : '/api/events';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, type }),
        });

        closeModal();
        fetchEvents();
    });

    deleteEventButton.addEventListener('click', async () => {
        const id = eventIdInput.value;
        if (id) {
            await fetch(`/api/events/${id}`, { method: 'DELETE' });
            closeModal();
            fetchEvents();
        }
    });

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            closeModal();
        }
    });

    fetchEvents();
});