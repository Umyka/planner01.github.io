// Global variables
let currentDate = new Date();
const TODAY = new Date();
let events = [];

// DOM elements
const currentDateElement = document.getElementById('currentDate');
const prevDayButton = document.getElementById('prevDay');
const nextDayButton = document.getElementById('nextDay');
const eventContainer = document.getElementById('eventContainer');
const eventForm = document.getElementById('eventForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const closeEditModalButton = document.getElementById('closeEditModal');
const filterButtons = {
    all: document.getElementById('filterAll'),
    schedule: document.getElementById('filterSchedule'),
    todos: document.getElementById('filterTodos'),
    done: document.getElementById('filterDone')
};
const calendarButton = document.querySelector('a[href="#"]');
const calendarPopup = document.getElementById('calendarPopup');
const closeCalendarButton = document.getElementById('closeCalendar');
let calendar;

// Update date display
function updateDateDisplay() {
    const dateDiff = Math.round((currentDate - TODAY) / (1000 * 60 * 60 * 24));
    let dateText;

    if (dateDiff === 0) {
        dateText = 'Today';
    } else if (dateDiff === -1) {
        dateText = 'Yesterday';
    } else if (dateDiff === 1) {
        dateText = 'Tomorrow';
    } else {
        dateText = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    document.querySelector('.text-white.tracking-light.text-\\[32px\\]').textContent = dateText;
    currentDateElement.textContent = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Navigate between days
prevDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    displayEvents();
});

nextDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    displayEvents();
});

// Add new event
function addNewEvent(event) {
    events.push(event);
    if (calendar) {
        calendar.addEvent({
            id: event.id,
            title: event.title,
            start: new Date(event.date + ' ' + event.time),
            allDay: event.type === 'todo'
        });
    }
}

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('eventTitle').value;
    const time = document.getElementById('eventTime').value;
    const type = document.getElementById('eventType').value;
    
    const newEvent = {
        id: Date.now().toString(),
        date: currentDate.toDateString(),
        title,
        time,
        type,
        done: false
    };
    
    addNewEvent(newEvent);
    eventForm.reset();
    displayEvents();
});

// Create event element
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = 'event-item p-4 mb-2 bg-[#2e2b36] rounded';
    eventElement.innerHTML = `
        <h3 class="text-white font-bold">${event.title}</h3>
        <p class="text-[#a6a1b5]">${event.time} - ${event.type}</p>
        ${event.type === 'todo' ? 
            `<button class="toggle-done bg-white text-[#131217] p-1 rounded mt-2" data-id="${event.id}">
                ${event.done ? 'Mark as Undone' : 'Mark as Done'}
            </button>` : ''}
        <button class="edit-event bg-blue-500 text-white p-1 rounded mt-2 ml-2" data-id="${event.id}">Edit</button>
        <button class="delete-event bg-red-500 text-white p-1 rounded mt-2 ml-2" data-id="${event.id}">Delete</button>
    `;
    return eventElement;
}

// Display events
function displayEvents(filter = 'all') {
    eventContainer.innerHTML = '';
    const filteredEvents = events.filter(event => event.date === currentDate.toDateString());

    if (filter === 'all') {
        const scheduleEvents = filteredEvents.filter(event => event.type === 'schedule');
        const todoEvents = filteredEvents.filter(event => event.type === 'todo' && !event.done);
        const doneEvents = filteredEvents.filter(event => event.type === 'todo' && event.done);

        if (scheduleEvents.length > 0) {
            const scheduleSection = createSection('Schedule');
            scheduleEvents.forEach(event => {
                scheduleSection.appendChild(createEventElement(event));
            });
            eventContainer.appendChild(scheduleSection);
        }

        if (todoEvents.length > 0) {
            const todoSection = createSection('To-do');
            todoEvents.forEach(event => {
                todoSection.appendChild(createEventElement(event));
            });
            eventContainer.appendChild(todoSection);
        }

        if (doneEvents.length > 0) {
            const doneSection = createSection('Done');
            doneEvents.forEach(event => {
                doneSection.appendChild(createEventElement(event));
            });
            eventContainer.appendChild(doneSection);
        }
    } else {
        let sectionTitle;
        let sectionEvents;

        if (filter === 'schedule') {
            sectionTitle = 'Schedule';
            sectionEvents = filteredEvents.filter(event => event.type === 'schedule');
        } else if (filter === 'todos') {
            sectionTitle = 'To-do';
            sectionEvents = filteredEvents.filter(event => event.type === 'todo' && !event.done);
        } else if (filter === 'done') {
            sectionTitle = 'Done';
            sectionEvents = filteredEvents.filter(event => event.type === 'todo' && event.done);
        }

        if (sectionEvents.length > 0) {
            const section = createSection(sectionTitle);
            sectionEvents.forEach(event => {
                section.appendChild(createEventElement(event));
            });
            eventContainer.appendChild(section);
        }
    }

    // Add event listeners for buttons
    document.querySelectorAll('.toggle-done').forEach(button => {
        button.addEventListener('click', toggleDone);
    });

    document.querySelectorAll('.edit-event').forEach(button => {
        button.addEventListener('click', openEditModal);
    });

    document.querySelectorAll('.delete-event').forEach(button => {
        button.addEventListener('click', deleteEvent);
    });
}

// Toggle done status
function toggleDone(e) {
    const id = e.target.getAttribute('data-id');
    const event = events.find(event => event.id === id);
    if (event) {
        event.done = !event.done;
        displayEvents();
        if (calendar) {
            calendar.getEventById(id).remove();
            calendar.addEvent({
                id: event.id,
                title: event.title,
                start: new Date(event.date + ' ' + event.time),
                allDay: event.type === 'todo'
            });
        }
    }
}

// Open edit modal
function openEditModal(e) {
    const id = e.target.getAttribute('data-id');
    const event = events.find(event => event.id === id);
    if (event) {
        document.getElementById('editEventId').value = event.id;
        document.getElementById('editEventTitle').value = event.title;
        document.getElementById('editEventTime').value = event.time;
        document.getElementById('editEventType').value = event.type;
        editModal.classList.remove('hidden');
    }
}

// Close edit modal
closeEditModalButton.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

// Edit event
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editEventId').value;
    const event = events.find(event => event.id === id);
    if (event) {
        event.title = document.getElementById('editEventTitle').value;
        event.time = document.getElementById('editEventTime').value;
        event.type = document.getElementById('editEventType').value;
        displayEvents();
        if (calendar) {
            calendar.getEventById(id).remove();
            calendar.addEvent({
                id: event.id,
                title: event.title,
                start: new Date(event.date + ' ' + event.time),
                allDay: event.type === 'todo'
            });
        }
        editModal.classList.add('hidden');
    }
});

// Delete event
function deleteEvent(e) {
    const id = e.target.getAttribute('data-id');
    events = events.filter(event => event.id !== id);
    displayEvents();
    if (calendar) {
        calendar.getEventById(id).remove();
    }
}

// Create a section for events
function createSection(title) {
    const section = document.createElement('div');
    section.className = 'mb-4';
    section.innerHTML = `<h2 class="text-white text-xl font-bold mb-2">${title}</h2>`;
    return section;
}

// Set up filter buttons
Object.entries(filterButtons).forEach(([filter, button]) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        Object.values(filterButtons).forEach(btn => btn.classList.remove('border-b-white', 'text-white'));
        button.classList.add('border-b-white', 'text-white');
        displayEvents(filter);
    });
});

// Create calendar
function createCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events.map(event => ({
            id: event.id,
            title: event.title,
            start: new Date(event.date + ' ' + event.time),
            allDay: event.type === 'todo'
        })),
        dateClick: function(info) {
            currentDate = info.date;
            updateDateDisplay();
            displayEvents();
            calendarPopup.classList.add('hidden');
        }
    });
    calendar.render();
}

// Add event listener for the Calendar button
calendarButton.addEventListener('click', (e) => {
    e.preventDefault();
    calendarPopup.classList.remove('hidden');
    if (!calendar) {
        createCalendar();
    } else {
        calendar.refetchEvents();
    }
});

// Add event listener for the Close button
closeCalendarButton.addEventListener('click', () => {
    calendarPopup.classList.add('hidden');
});

// Initial setup
updateDateDisplay();
displayEvents();
