import { getRepository } from "typeorm";
import { AmazonProduct } from "../entities/AmazonProduct";
import { OfferNotification } from "../entities/OfferNotification";

class OfferNotificationRepository {
  async save(offerNotification: OfferNotification) {
    try {
      const offerNotificationRepository = getRepository(OfferNotification);
      await offerNotificationRepository.save(offerNotification);
    } catch (error) {
      console.error(error);
      console.error("Error saving offer notification on Database");
    }
  }

  async findOne(id: string) {
    const offerNotificationRepository = getRepository(OfferNotification);
    return await offerNotificationRepository.findOne(id, { relations: ["product"] });
  }
}

export default new OfferNotificationRepository();
