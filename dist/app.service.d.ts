import { HttpService } from '@nestjs/axios';
export declare class AppService {
    private httpService;
    constructor(httpService: HttpService);
    getHello(): string;
}
