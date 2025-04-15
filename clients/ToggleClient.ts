import { TogglProject, TogglTimeEntry } from "../types";
import { Client } from "./Client";

export class TogglClient extends Client {
    constructor(
        apiUrl: string,
        apiKey: string
    ) {
        super(apiUrl, apiKey, 'Basic');
    }

    async getProjects() {
        return await this.GET<TogglProject[]>(`/me/projects`);
    }

    async getTimeEntries(startDate: string, endDate: string) {
        return await this.GET<TogglTimeEntry[]>('/me/time_entries', {
            start_date: startDate,
            end_date: endDate,
        });
    }
}
