"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AppController = class AppController {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.store = 'next-ecommerce-ts';
        this.global_access_token = '';
    }
    async init(query) {
        console.log('i am in init');
        const myres = {
            url: `https://${query.shop}/admin/oauth/authorize?client_id=${this.configService.get('shopify.appProxy.clientId')}&scope=${this.configService
                .get('shopify.appProxy.scopes')
                .join(',')}&redirect_uri=${this.configService.get('apiUrl')}/shopify-oauth/redirect&state={nonce}&grant_options[]={access_mode}`,
        };
        console.log('Scopes solicitados:', this.configService.get('shopify.appProxy.scopes'));
        console.log(myres);
        return myres;
    }
    async oauthRedirect(query) {
        console.log('i am in redirect ' + query.code);
        const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`https://${query.shop}/admin/oauth/access_token`, {
            client_id: this.configService.get('shopify.appProxy.clientId'),
            client_secret: this.configService.get('shopify.appProxy.clientSecret'),
            code: query.code,
        }));
        console.log('Token Response - ' + String(response.data));
        console.log('Token Response2 - ' + response.data.access_token);
        this.global_access_token = response.data.access_token;
        return {
            url: `https://${query.shop}/admin/apps?shop=${query.shop}`,
        };
    }
    async calculatePrice(body) {
        const productRes = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`https://${body.store}.myshopify.com/admin/api/2024-01/products/${body.productId}.json`, {
            headers: {
                'X-Shopify-Access-Token': this.global_access_token,
            },
        }));
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
    async createDraftOrder(body) {
        console.log('Intentando crear draft order para:', body.email, body.lineItems, body.store);
        console.log('Access Token:');
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`https://${body.store}.myshopify.com/admin/api/2024-01/draft_orders.json`, {
                draft_order: {
                    email: body.email,
                    line_items: body.lineItems,
                },
            }, {
                headers: {
                    'X-Shopify-Access-Token': this.global_access_token,
                    'Content-Type': 'application/json',
                },
            }));
            return { invoice_url: response.data.draft_order.invoice_url };
        }
        catch (error) {
            console.error('Error al crear draft order:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                console.error('Headers:', error.response.headers);
            }
            throw error;
        }
    }
    async getProduct(query) {
        console.log('Fetching product from shopify shore ' +
            query.store +
            ' with   Product id' +
            query.productid);
        const productResponse = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`https://${query.store}.myshopify.com/admin/api/2024-01/products/${query.productid}.json`, {
            headers: {
                'X-Shopify-Access-Token': this.global_access_token,
            },
        }));
        console.log('Product Response2 - ' + productResponse.data.product);
        console.log('Product Response - ' + JSON.stringify(productResponse.data));
        const productData = JSON.stringify(productResponse.data);
        return productData;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('init'),
    (0, common_1.HttpCode)(302),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "init", null);
__decorate([
    (0, common_1.Get)('redirect'),
    (0, common_1.HttpCode)(302),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "oauthRedirect", null);
__decorate([
    (0, common_1.Post)('calculate-price'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Post)('create-draft-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createDraftOrder", null);
__decorate([
    (0, common_1.Get)('getproduct'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getProduct", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('shopify-oauth'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], AppController);
//# sourceMappingURL=app.controller.js.map