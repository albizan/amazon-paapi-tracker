import {
  GetItemsRequest,
  GetItemsPayload,
  PartnerType,
  Host,
  Region,
  GetItemsResponse,
} from "paapi5-typescript-sdk";
import PaapiCredentials from "../PaapiCredentials";
import { format } from "date-fns";
import italianLocale from "date-fns/locale/it";

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
      Condition: "Any",
      ItemIdType: "ASIN",
      ItemIds: asins,
      Resources: ["ItemInfo.Title", "Offers.Summaries.LowestPrice"],
    };
  }

  getTag(): string {
    return this.credentials.tag;
  }

  private log(message) {
    console.log(
      `[${format(new Date(), "HH:mm:ss - dd MMMM yyyy", {
        locale: italianLocale,
      })}] [Paapi] ${message}`
    );
  }

  private error(message) {
    console.error(
      `[${format(new Date(), "HH:mm:ss - dd MMMM yyyy", {
        locale: italianLocale,
      })}] [Paapi] ${message}`
    );
  }
}
