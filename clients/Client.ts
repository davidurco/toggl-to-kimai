import { axios } from "../utils/axios";

export class Client {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly authorizationType: string;

    constructor(
        apiUrl: string,
        apiKey: string,
        authorizationType: string = "Bearer"
    ) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.authorizationType = authorizationType;
    }

    private getAuthHeader(): string {
        return this.authorizationType === "Basic"
            ? `Basic ${Buffer.from(this.apiKey).toString("base64")}`
            : `Bearer ${this.apiKey}`;
    }

    async GET<R = unknown, Q = object>(endpoint: string, params?: Q) {
        return axios.get<R>(`${this.apiUrl}${endpoint}`, {
            headers: {
                Authorization: this.getAuthHeader(),
            },
            params,
        });
    }

    async POST<R = unknown, B = object>(endpoint: string, body: B) {
        return axios.post<R>(`${this.apiUrl}${endpoint}`, body, {
            headers: {
                Authorization: this.getAuthHeader(),
            },
        });
    }
}
