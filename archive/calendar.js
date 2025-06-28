const { google } = require('googleapis');
const GoogleAuth = require('./auth');

class CalendarManager {
  constructor() {
    this.auth = new GoogleAuth();
    this.calendar = null;
  }

  async initialize() {
    const authClient = await this.auth.authenticate();
    this.calendar = google.calendar({ version: 'v3', auth: authClient });
    return this.calendar;
  }

  async getEvents(timeMin = new Date(), timeMax = null) {
    if (!timeMax) {
      timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 14); // Next 14 days
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async addEvent(eventDetails) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: eventDetails,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId, eventDetails) {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: eventDetails,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

module.exports = CalendarManager;