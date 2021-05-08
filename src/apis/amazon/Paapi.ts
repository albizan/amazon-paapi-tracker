import { GetItemsRequest, GetItemsPayload, PartnerType, Host, Region, GetItemsResponse } from "paapi5-typescript-sdk";
import PaapiCredentials from "../../PaapiCredentials";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale

export default class Paapi {
  private credentials: PaapiCredentials;
  private errors: Set<string>;

  constructor(paapiCredentials: PaapiCredentials) {
    this.credentials = paapiCredentials;
    this.errors = new Set();
  }

  async getItems(asins: string[], condition = "New"): Promise<GetItemsResponse> {
    const payload: GetItemsPayload = this.generatePayload(asins, condition);
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
      this.errors.add(error.message);
    }
  }

  getTag(): string {
    return this.credentials.tag;
  }

  getErrors(): string[] {
    return Array.from(this.errors);
  }

  flushErrors() {
    this.errors.clear();
  }

  /* PRIVATE METHODS BELOW */

  private generatePayload(asins: string[], condition): GetItemsPayload {
    return {
      Condition: condition,
      ItemIdType: "ASIN",
      ItemIds: asins,
      OfferCount: 1,
      Resources: [
        "ItemInfo.Title",
        "Images.Primary.Large",
        "Offers.Summaries.LowestPrice",
        "Offers.Listings.Price",
        "Offers.Listings.MerchantInfo",
        "Offers.Listings.Condition",
        "Offers.Listings.Condition.SubCondition",
      ],
    };
  }

  private error(message) {
    console.error(`[${dayjs().locale("it").format("HH:mm:ss")}] {${this.getTag()}} ${message}`);
  }
}
