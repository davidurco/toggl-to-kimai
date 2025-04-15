import type { KimaiProjectDetailed, KimaiActivity, KimaiTimesheetPayload } from "../types";
import { Client } from "./Client";

export class KimaiClient extends Client {
    constructor(
        apiUrl: string,
        apiKey: string
    ) {
        super(apiUrl, apiKey);
    }

    async getProjects() {
        return await this.GET<KimaiProjectDetailed[]>('/projects');
    }

    async getActivities(projectId?: string) {
        return await this.GET<KimaiActivity[]>(`/activities`, {
            project: projectId
        });
    }

    async createTimeEntry(entry: KimaiTimesheetPayload) {
        return this.POST('/timesheets', entry);
    }
}
