import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { BunjiEvent } from "./types";
import { createEventSchema, patchEventSchema } from "./validation";
import { isExistingUserId } from "../users/helpers";
import GoogleApi from "../google/googleApi";

// Data
import bunjiEvents from "./bundjiApi";

// In-memory storage for events

export const createEvent = async (req: Request, res: Response) => {
  try {
    await createEventSchema.validate(req.body, {
      stripUnknown: false,
      abortEarly: false,
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ error: error.message, details: error.errors });
  }

  const {
    description,
    isDone,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtTime,
    userId,
  } = req.body;

  if (!isExistingUserId(userId)) {
    return res.status(400).json({ error: "User not found" });
  }

  const newEvent: BunjiEvent = {
    id: uuidv4(),
    isDone,
    description: description || null,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtTime,
    userId,
  };

  // Create event in Google
  const response = await GoogleApi.create({
    description: newEvent.description,
    startAt: newEvent.startAtDate + "T" + newEvent.startAtTime + ":00Z",
    endAt: newEvent.endAtDate + "T" + newEvent.endAtTime + ":00Z",
    ownerId: newEvent.userId,
  });

  bunjiEvents.create({ ...newEvent, googleEventId: response.id });
  res.status(201).json(newEvent);
};

export const getEvents = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if page query parameter is not provided
  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const allBunjiEvents = bunjiEvents.getAll();
  const results = allBunjiEvents.slice(startIndex, endIndex);

  res.json({
    total: allBunjiEvents.length,
    totalPages: Math.ceil(allBunjiEvents.length / limit),
    currentPage: page,
    data: results,
  });
};

export const getEvent = async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = bunjiEvents.getById(eventId);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: "Event not found" });
  }
};

export const patchEvent = async (req: Request, res: Response) => {
  const eventId = req.params.id;

  try {
    await patchEventSchema.validate(req.body, {
      stripUnknown: false,
      abortEarly: false,
    });
  } catch (error: any) {
    console.log(error);

    return res
      .status(400)
      .json({ error: error.message, details: error.errors });
  }

  const {
    description,
    isDone,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtDateTime,
    userId,
  } = req.body;

  if (userId && !isExistingUserId(userId)) {
    return res.status(400).json({ error: "User not found" });
  }

  const event = bunjiEvents.getById(eventId);

  if (event) {
    // Update fields
    const updatedEvent = {
      ...event,
      isDone: isDone || event.isDone,
      description: description || event.description,
      startAtDate: startAtDate || event.startAtDate,
      startAtTime: startAtTime || event.startAtTime,
      endAtDate: endAtDate || event.endAtDate,
      endAtTime: endAtDateTime || event.endAtTime,
      userId: userId || event.userId,
    };

    bunjiEvents.update(eventId, updatedEvent);
    // Update event in memory
    if (updatedEvent.googleEventId) {
      await GoogleApi.update(updatedEvent.googleEventId, {
        eventId: updatedEvent.googleEventId,
        description: updatedEvent.description,
        startAt:
          updatedEvent.startAtDate + "T" + updatedEvent.startAtTime + ":00Z",
        endAt: updatedEvent.endAtDate + "T" + updatedEvent.endAtTime + ":00Z",
        ownerId: updatedEvent.userId,
      });
    }
    return res.json(updatedEvent);
  } else {
    return res.status(404).json({ error: "Event not found" });
  }
};

export const deleteEvent = (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = bunjiEvents.getById(eventId);
  bunjiEvents.delete(eventId);
  if (event?.googleEventId) {
    GoogleApi.delete(event.googleEventId);
  }
  res.sendStatus(204);
};
