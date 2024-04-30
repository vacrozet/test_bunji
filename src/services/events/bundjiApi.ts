import { defaultEvents } from "./data";
import { BunjiEvent } from "./types";

class BunjiEventApi {
  private events: BunjiEvent[];
  constructor() {
    this.events = defaultEvents;
  }

  public create(data: BunjiEvent): BunjiEvent {
    const newEvent = data;
    this.events.push(newEvent);
    return newEvent;
  }

  public getById(eventId: string): BunjiEvent | undefined {
    const event = this.events.find((event) => event.id === eventId);
    return event;
  }

  public getAll(): BunjiEvent[] {
    return this.events;
  }

  public update(eventId: string, data: BunjiEvent): BunjiEvent {
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index === -1) {
      throw new Error("Event not found");
    }
    this.events[index] = data;
    return data;
  }

  public delete(eventId: string): void {
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index === -1) {
      throw new Error("Event not found");
    }
    this.events.splice(index, 1);
  }
}

const bunjiEventApi = new BunjiEventApi();

export default bunjiEventApi;
