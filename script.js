document.addEventListener('DOMContentLoaded', () => {
    const eventContainer = document.getElementById('eventContainer');
    const eventForm = document.getElementById('eventForm');
    const currentDateElement = document.getElementById('currentDate');
    let currentDate = new Date();
  
    // Load events from localStorage
    let events = JSON.parse(localStorage.getItem('events')) || [];
  
    function saveEvents() {
      localStorage.setItem('events', JSON.stringify(events));
    }
  
    function renderEvents() {
      eventContainer.innerHTML = '';
      const dateString = currentDate.toDateString();
      currentDateElement.textContent = dateString;
  
      const filteredEvents = events.filter(event => new Date(event.date).toDateString() === dateString);
  
      if (filteredEvents.length === 0) {
        eventContainer.innerHTML = '<p class="text-white text-center">No events for this day</p>';
        return;
      }
  
      filteredEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'flex gap-4 bg-[#131217] px-4 py-3 justify-between';
        eventElement.innerHTML = `
          <div class="flex flex-1 flex-col justify-center">
            <p class="text-white text-base font-medium leading-normal">${event.title}</p>
            <p class="text-[#a6a1b5] text-sm font-normal leading-normal">${event.time}</p>
            <p class="text-[#a6a1b5] text-sm font-normal leading-normal">${event.type}</p>
          </div>
        `;
        eventContainer.appendChild(eventElement);
      });
    }
  
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('eventTitle').value;
      const time = document.getElementById('eventTime').value;
      const type = document.getElementById('eventType').value;
  
      events.push({
        date: currentDate.toISOString().split('T')[0],
        title,
        time,
        type
      });
  
      saveEvents();
      renderEvents();
      eventForm.reset();
    });
  
    // Navigation
    function changeDate(days) {
      currentDate.setDate(currentDate.getDate() + days);
      renderEvents();
    }
  
    // Add these buttons to your HTML and use these functions
    // document.getElementById('prevDay').addEventListener('click', () => changeDate(-1));
    // document.getElementById('nextDay').addEventListener('click', () => changeDate(1));
  
    // Initial render
    renderEvents();
  });