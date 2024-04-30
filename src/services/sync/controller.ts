import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import bunjiEventApi from "../events/bundjiApi";
import { BunjiEvent } from "../events/types";

// une notion d'UserId est implementee mais n'est pas valide du cote googleApi.
// import { isExistingUserId } from "../users/helpers";
import GoogleApi from "../google/googleApi";
import { GoogleEvent } from "../google/types";

export const syncGoogleEvents = async () => {
  const googleEvents: GoogleEvent[] = await GoogleApi.getAll();
  const bunjiEvents: BunjiEvent[] = bunjiEventApi.getAll();

  googleEvents.forEach((googleEvent) => {
    const bunjiEvent = bunjiEvents.find(
      (bunjiEvent) => bunjiEvent?.googleEventId === googleEvent.id
    );
    // Si mon event google n'existe pas coté Bunji, je l'ajoute
    if (!bunjiEvent) {
      bunjiEventApi.create({
        id: uuidv4(),
        isDone: false,
        description: googleEvent.description,
        startAtDate: googleEvent.startAt.split("T")[0],
        startAtTime: googleEvent.startAt.split("T")[1].slice(0, 5),
        endAtDate: googleEvent.endAt.split("T")[0],
        endAtTime: googleEvent.endAt.split("T")[1].slice(0, 5),
        userId: googleEvent.ownerId,
        googleEvent: true,
        googleEventId: googleEvent.id,
      });
    } else {
      // Si il existe, je le met à jour
      bunjiEventApi.update(bunjiEvent.id, {
        ...bunjiEvent,
        description: googleEvent.description,
        startAtDate: googleEvent.startAt.split("T")[0],
        startAtTime: googleEvent.startAt.split("T")[1].slice(0, 5),
        endAtDate: googleEvent.endAt.split("T")[0],
        endAtTime: googleEvent.endAt.split("T")[1].slice(0, 5),
      });
    }
  });

  bunjiEvents.forEach(async (bunjiEvent) => {
    // si googleEventId n'existe pas cela veut dire que l'event bunji ne sait pas synchroniser avec google
    if (!bunjiEvent?.googleEventId) {
      const response = await GoogleApi.create({
        description: bunjiEvent.description,
        startAt: bunjiEvent.startAtDate + "T" + bunjiEvent.startAtTime + ":00Z",
        endAt: bunjiEvent.endAtDate + "T" + bunjiEvent.endAtTime + ":00Z",
        ownerId: bunjiEvent.userId,
      });

      // je met a jour l'event bunji
      bunjiEventApi.update(bunjiEvent.id, {
        ...bunjiEvent,
        googleEventId: response.id,
        googleEvent: true,
      });
    } else {
      // si googleEventId existe je vais regarder si il existe toujours dans google
      const googleEvent = googleEvents.find(
        (googleEvent) => googleEvent.id === bunjiEvent.googleEventId
      );
      // si il n'existe plus chez google, je supprime l'event bunji
      if (!googleEvent) {
        bunjiEventApi.delete(bunjiEvent.id);
      }
    }
  });
};

export const sync = async (_req: Request, res: Response) => {
  try {
    await syncGoogleEvents();

    return res.json("Success");
  } catch (error) {
    return res.status(404).json({ error: "Event not found", errors: error });
  }
};
