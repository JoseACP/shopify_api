import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class AppController {
  private configService;
  private httpService;
  constructor(configService: ConfigService, httpService: HttpService);
  store: string;
  global_access_token: string;
  init(query: any): Promise<{
    url: string;
  }>;
  oauthRedirect(query: any): Promise<{
    url: string;
  }>;
  calculatePrice(body: {
    productId: string;
    variantIds: string[];
    store: string;
  }): Promise<any>;
  createDraftOrder(body: {
    email: string;
    lineItems: any[];
    store: string;
  }): Promise<any>;
  getProduct(query: any): Promise<any>;
}
