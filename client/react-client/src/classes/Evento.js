function generateEventId() {
  return `evt-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export default class Event {
  constructor({ 
    id = null, 
    title, 
    description = "", 
    year, 
    color = "#00fff7" 
  }) 
  {
    if (!title || year === undefined || year === null) {
      throw new Error("Event requires a title and a year.");
    }

    this.id = id || generateEventId();
    this.title = title;
    this.description = description;
    this.year = parseInt(year);
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      year: this.year,
      color: this.color
    };
  }
}
