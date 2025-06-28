const CalendarManager = require('./calendar');

class SchedulerInterface {
  constructor() {
    this.calendar = new CalendarManager();
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.calendar.initialize();
      this.initialized = true;
    }
  }

  async getUpcomingEvents(days = 14) {
    await this.init();
    
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);
    
    const events = await this.calendar.getEvents(timeMin, timeMax);
    
    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description || '',
      location: event.location || ''
    }));
  }

  async addPersonalEvent(title, startTime, endTime, description = '', location = '') {
    await this.init();
    
    const eventDetails = {
      summary: title,
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York'
      },
      description: description,
      location: location
    };

    return await this.calendar.addEvent(eventDetails);
  }

  async updateEvent(eventId, updates) {
    await this.init();
    return await this.calendar.updateEvent(eventId, updates);
  }

  async removeEvent(eventId) {
    await this.init();
    return await this.calendar.deleteEvent(eventId);
  }

  // Helper method for daily briefing
  async getTodaysEvents() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await this.calendar.getEvents(today, tomorrow);
  }
}

module.exports = SchedulerInterface;