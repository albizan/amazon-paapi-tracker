import { getRepository } from "typeorm";
import { AmazonProduct } from "../entities/AmazonProduct";

class AmazonProductRepository {
  async getAsins(): Promise<string[]> {
    const amazonProductRepository = getRepository(AmazonProduct);
    return await amazonProductRepository
      .createQueryBuilder("amazonProduct")
      .select("amazonProduct.asin")
      .getRawMany();
  }
}

export default new AmazonProductRepository();
