
export default class Timeline {
  constructor({ id = null, name, description = "", anioInicio, anioFin, segmentos = 1, events = [] }) {
    if (!name || !anioInicio || !anioFin) {
      throw new Error("Timeline requires a name, anioInicio, and anioFin");
    }

    this.id = id || Timeline.generateId();
    this.name = name;
    this.description = description;
    this.anioInicio = anioInicio;
    this.anioFin = anioFin;
    this.segmentos = segmentos;
    this.events = events;
  }

  static generateId() {
    return `timeline-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  getDuration() {
    return this.anioFin - this.anioInicio;
  }

  // returns value in [0,1] (can be <0 or >1 if outside range)
  normalizedPositionForYear(year) {
    const dur = this.getDuration() || 1;
    return (year - this.anioInicio) / dur;
  }

  // convenience: events sorted by year
  getSortedEvents() {
    return [...this.events].sort((a, b) => a.year - b.year);
  }

  // optional: get events inside range (inclusive)
  getEventsInRange(startYear, endYear) {
    return this.getSortedEvents().filter(e => e.year >= startYear && e.year <= endYear);
  }
}
