import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Get,
  HttpCode,
  Query,
  Redirect,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Controller('shopify-oauth')
export class AppController {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  store = 'next-ecommerce-ts';
  global_access_token = '';

  @Get('init')
  @HttpCode(302)
  @Redirect()
  async init(@Query() query: any) {
    console.log('i am in init');
    const myres = {
      url: `https://${
        query.shop
      }/admin/oauth/authorize?client_id=${this.configService.get(
        'shopify.appProxy.clientId',
      )}&scope=${this.configService
        .get('shopify.appProxy.scopes')
        .join(',')}&redirect_uri=${this.configService.get(
        'apiUrl',
      )}/shopify-oauth/redirect&state={nonce}&grant_options[]={access_mode}`,
    };
    console.log(
      'Scopes solicitados:',
      this.configService.get('shopify.appProxy.scopes'),
    );
    console.log(myres);
    return myres;
  }

  @Get('redirect')
  @HttpCode(302)
  @Redirect()
  async oauthRedirect(@Query() query: any) {
    console.log('i am in redirect ' + query.code);
    const response = await lastValueFrom(
      this.httpService.post(`https://${query.shop}/admin/oauth/access_token`, {
        client_id: this.configService.get('shopify.appProxy.clientId'),
        client_secret: this.configService.get('shopify.appProxy.clientSecret'),
        code: query.code,
      }),
    );

    console.log('Token Response - ' + String(response.data));
    console.log('Token Response2 - ' + response.data.access_token);
    this.global_access_token = response.data.access_token;

    return {
      url: `https://${query.shop}/admin/apps?shop=${query.shop}`,
    };
  }

  @Post('calculate-price')
  async calculatePrice(
    @Body() body: { productId: string; variantIds: string[]; store: string },
  ): Promise<any> {
    const productRes = await lastValueFrom(
      this.httpService.get(
        `https://${body.store}.myshopify.com/admin/api/2024-01/products/${body.productId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.global_access_token,
          },
        },
      ),
    );
    const product = productRes.data.product;
    let total = parseFloat(product.variants[0].price);

    for (const variantId of body.variantIds) {
      const variant = product.variants.find((v) => v.id == variantId);
      if (variant) {
        total += parseFloat(variant.price);
      }
    }

    return { totalPrice: total };
  }

  @Get ('get-customer-by-id')
  async getCustomerById(@Query() query: any): Promise<any> {
    console.log('Fetching customer with ID:', query.customerId, 'from store:', query.store);
    const customerResponse = await lastValueFrom(
      this.httpService.get(
        `https://${query.store}.myshopify.com/admin/api/2024-01/customers/${query.customerId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.global_access_token,
          },
        },
      ),
    );
    console.log('Customer Response:', customerResponse.data.customer);
    return customerResponse.data.customer;
  } 

  @Post('create-draft-order')
  async createDraftOrder(
    @Body() body: { email: string; lineItems: any[]; store: string },
  ): Promise<any> {
    console.log(
      'Intentando crear draft order para:',
      body.email,
      body.lineItems,
      body.store,
    );
    console.log('Access Token:');

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `https://${body.store}.myshopify.com/admin/api/2024-01/draft_orders.json`,
          {
            draft_order: {
              email: body.email,
              line_items: body.lineItems,
            },
          },
          {
            headers: {
              'X-Shopify-Access-Token': this.global_access_token,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return { invoice_url: response.data.draft_order.invoice_url };
    } catch (error) {
      console.error('Error al crear draft order:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      }
      throw error;
    }
  }



  @Get('getproduct')
  async getProduct(@Query() query: any): Promise<any> {
    console.log(
      'Fetching product from shopify shore ' +
        query.store +
        ' with Product id' +
        query.productid,
    );

    const productResponse = await lastValueFrom(
      this.httpService.get(
        `https://${query.store}.myshopify.com/admin/api/2024-01/products/${query.productid}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.global_access_token,
          },
        },
      ),
    );

    console.log('Product Response2 - ' + productResponse.data.product);
    console.log('Product Response - ' + JSON.stringify(productResponse.data));

    const productData = JSON.stringify(productResponse.data);

    return productData;
  }
}
