declare const _default: () => {
    port: number;
    environment: string;
    apiUrl: string;
    corsAllowedUrls: string;
    shopify: {
        appProxy: {
            clientId: string;
            clientSecret: string;
            scopes: string[];
        };
    };
};
export default _default;
