document.addEventListener('DOMContentLoaded', async () => {
    const yearlySummaryContainer = document.getElementById('yearly-summary-container');

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
            return { events: [], holidays: [] };
        }
    };

    const generateYearlySummary = (events, holidays) => {
        const currentYear = new Date().getFullYear();
        const months = Array.from({ length: 12 }, (e, i) => new Date(currentYear, i, 1).toLocaleString('it-IT', { month: 'long' }));

        let summaryHtml = `<h2>Riepilogo per l'anno ${currentYear}</h2>`;
        summaryHtml += `<table>
                            <thead>
                                <tr>
                                    <th>Mese</th>
                                    <th>Giorni Effettivi</th>
                                    <th>Ferie</th>
                                    <th>Malattia</th>
                                </tr>
                            </thead>
                            <tbody>`;

        months.forEach((monthName, index) => {
            const month = index; // 0-indexed month
            const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
            let totalWorkingDaysInMonth = 0;

            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(currentYear, month, i);
                const dayOfWeek = date.getDay();
                const dateString = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const isHoliday = holidays.some(h => h.date === dateString);

                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
                    totalWorkingDaysInMonth++;
                }
            }

            const vacationDaysTakenThisMonth = events.filter(e => e.type === 'ferie' && new Date(e.date).getFullYear() === currentYear && new Date(e.date).getMonth() === month).length;
            const sickDaysTakenThisMonth = events.filter(e => e.type === 'malattia' && new Date(e.date).getFullYear() === currentYear && new Date(e.date).getMonth() === month).length;
            const actualWorkedDays = totalWorkingDaysInMonth - vacationDaysTakenThisMonth - sickDaysTakenThisMonth;

            summaryHtml += `<tr>
                                <td>${monthName}</td>
                                <td>${actualWorkedDays}</td>
                                <td>${vacationDaysTakenThisMonth}</td>
                                <td>${sickDaysTakenThisMonth}</td>
                            </tr>`;
        });

        summaryHtml += `</tbody></table>`;
        yearlySummaryContainer.innerHTML = summaryHtml;

        const totalVacationInput = document.getElementById('total-vacation-days');
        const remainingVacationSpan = document.getElementById('remaining-vacation-days');

        const calculateRemainingVacation = () => {
            const totalVacationDays = parseInt(totalVacationInput.value, 10) || 0;
            const totalVacationTaken = events.filter(e => e.type === 'ferie' && new Date(e.date).getFullYear() === currentYear).length;
            const remainingDays = totalVacationDays - totalVacationTaken;
            remainingVacationSpan.textContent = remainingDays;
        };

        totalVacationInput.addEventListener('input', calculateRemainingVacation);
        calculateRemainingVacation(); // Initial calculation
    };

    const data = await fetchEvents();
    generateYearlySummary(data.events, data.holidays);
});