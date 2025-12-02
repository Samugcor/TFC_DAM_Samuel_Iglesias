import Event from "./Evento.js";

export default class Timeline {
  constructor({ 
    id = null, 
    name, 
    description = "", 
    anioInicio, 
    anioFin, 
    yearSegments = 1, 
    events = [], 
    elements = [] 
  }) {
    if (!name || !anioInicio || !anioFin) {
      throw new Error("Timeline requires a name, anioInicio, and anioFin");
    }

    this.id = id || Timeline.generateId();
    this.name = name;
    this.description = description;
    this.anioInicio = anioInicio;
    this.anioFin = anioFin;
    this.yearSegments = yearSegments;

    this.events = events.map(ev => ev instanceof Event ? ev : new Event(ev));
    this.elements = elements;
  }

  static generateId() {
    return `timeline-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  getDuration() {
    return this.anioFin - this.anioInicio;
  }

  normalizedPositionForYear(year) {
    const dur = this.getDuration() || 1;
    return (year - this.anioInicio) / dur;
  }

  yearForNormalizedPosition(norm) {
    const dur = this.getDuration() || 1;
    return this.anioInicio + norm * dur;
  }

  getSortedEvents() {
    return [...this.events].sort((a, b) => a.year - b.year);
  }

  getEventsInRange(startYear, endYear) {
    return this.getSortedEvents().filter(e => e.year >= startYear && e.year <= endYear);
  }

  addEvent(evento) {
    this.events.push(evento instanceof Event ? evento : new Event(evento));
  }

  updateEvent(updatedEvent) {
    if (!updatedEvent || !updatedEvent.id) {
      throw new Error("updateEvent requires an event with a valid id");
    }

    const index = this.events.findIndex(ev => ev.id === updatedEvent.id);
    if (index === -1) {
      console.warn("updateEvent: event not found", updatedEvent.id);
      return;
    }

    this.events[index] = updatedEvent instanceof Event ? updatedEvent : new Event(updatedEvent);
  }

  addElement(el) {
    this.elements.push(el);
  }

  removeLastElement() {
    return this.elements.pop();
  }

  printEvents() {
    console.log("EVENTOS:");
    for (const ev of this.events) {
      console.log("\t", ev);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      anioInicio: this.anioInicio,
      anioFin: this.anioFin,
      yearSegments: this.yearSegments,
      events: this.events.map(ev => ev.toJSON()),
      elements: this.elements,
    };
  }
}
