document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      dateClick: function(info) {
        events: [
          {
            title: 'Test Event',
            start: new Date().toISOString().split('T')[0] // Today's date
          }
        ]
        const date = info.dateStr;
        const checked = confirm(`Did you follow your habit on ${date}?`);
        // Here we could send this data to the backend for tracking
        if (checked) {
          alert('Great job!');
        }
        
      }
    });
    calendar.render();
  });
  