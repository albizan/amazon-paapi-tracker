import { GetItemsRequest, GetItemsPayload, PartnerType, Host, Region, GetItemsResponse } from "paapi5-typescript-sdk";
import PaapiCredentials from "../../PaapiCredentials";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale

export default class Paapi {
  private credentials: PaapiCredentials;

  constructor(paapiCredentials: PaapiCredentials) {
    this.credentials = paapiCredentials;
  }

  async getItems(asins: string[]): Promise<GetItemsResponse> {
    const payload: GetItemsPayload = this.generatePayload(asins);
    const request = new GetItemsRequest(
      payload,
      this.credentials.tag,
      PartnerType.ASSOCIATES,
      this.credentials.key,
      this.credentials.secret,
      Host.ITALY,
      Region.ITALY
    );
    try {
      const data: GetItemsResponse = await request.send();

      return data;
    } catch (error) {
      this.error(error.message);
    }
  }

  private generatePayload(asins: string[]): GetItemsPayload {
    return {
      Condition: "New",
      ItemIdType: "ASIN",
      ItemIds: asins,
      OfferCount: 1,
      Resources: ["ItemInfo.Title", "Images.Primary.Large", "Offers.Summaries.LowestPrice", "Offers.Listings.Price", "Offers.Listings.MerchantInfo"],
    };
  }

  getTag(): string {
    return this.credentials.tag;
  }

  private error(message) {
    console.error(`[${dayjs().locale("it").format("HH:mm:ss")}] {Paapi} ${message}`);
  }
}
