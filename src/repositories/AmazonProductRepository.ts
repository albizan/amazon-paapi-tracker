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

  async save(amazonProduct: AmazonProduct) {
    try {
      const amazonProductRepository = getRepository(AmazonProduct);
      await amazonProductRepository.save(amazonProduct);
    } catch (error) {
      console.error("Error saving amazon product on Database");
    }
  }

  async findOne(asin: string) {
    const amazonProductRepository = getRepository(AmazonProduct);
    return await amazonProductRepository.findOne(asin);
  }

  async addAsinToDB(asin: string) {
    const newAmazonProduct = new AmazonProduct();
    newAmazonProduct.asin = asin;
    await this.save(newAmazonProduct);
  }
}

export default new AmazonProductRepository();
