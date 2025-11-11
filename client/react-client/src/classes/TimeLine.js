
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
}
