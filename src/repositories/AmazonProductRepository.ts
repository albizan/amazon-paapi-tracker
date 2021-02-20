import { getRepository } from "typeorm";
import { AmazonProduct } from "../entities/AmazonProduct";

class AmazonProductRepository {
  async getAsins(): Promise<string[]> {
    const amazonProductRepository = getRepository(AmazonProduct);
    // Get a list of object containing only the asin (Partial<AmazonProduct>)
    const partials: Partial<AmazonProduct>[] = await amazonProductRepository
      .createQueryBuilder("amazonProduct")
      .select("amazonProduct.asin")
      .getMany();

    // Return all the asins as a list
    return partials.map((partial) => partial.asin);
  }
}

export default new AmazonProductRepository();
