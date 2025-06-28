// Configuration and setup utilities
const SchedulerInterface = require('./scheduler');

class CalendarBridge {
  constructor() {
    this.scheduler = new SchedulerInterface();
  }

  async testConnection() {
    try {
      await this.scheduler.init();
      console.log('✅ Calendar bridge connected successfully!');
      
      const events = await this.scheduler.getTodaysEvents();
      console.log(`📅 Found ${events.length} events for today`);
      
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }
}

module.exports = CalendarBridge;