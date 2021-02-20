import {
  GetItemsRequest,
  GetItemsPayload,
  PartnerType,
  Host,
  Region,
  ItemsResult,
  GetItemsResponse,
} from "paapi5-typescript-sdk";
import PaapiCredentials from "../PaapiCredentials";

export default class Paapi {
  private credentials: PaapiCredentials;

  constructor(paapiCredentials: PaapiCredentials) {
    this.credentials = paapiCredentials;
  }

  async getItems(asins: string[]) {
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

    const data: GetItemsResponse = await request.send();
    if (data.Errors) {
      console.log(data.Errors);
    }
    data.ItemsResult.Items.forEach((item) => {
      console.log(item);
    });
  }

  private generatePayload(asins: string[]): GetItemsPayload {
    return {
      Condition: "Any",
      ItemIdType: "ASIN",
      ItemIds: asins,
      Resources: ["ItemInfo.Title"],
    };
  }

  getTag(): string {
    return this.credentials.tag;
  }
}
