import { dbService } from "@/services/db.service";
import { logger } from "@/helpers/logger.helper";

class SettingsService {
    private cache: Map<string, { value: string; expiresAt: number }> =
        new Map();
    private readonly TTL_MS = 60 * 1000; // 1 minute

    public async get(key: string): Promise<string | null> {
        const cached = this.cache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value;
        }

        try {
            const setting = await dbService.client.setting.findUnique({
                where: { key },
            });

            if (setting) {
                this.cache.set(key, {
                    value: setting.value,
                    expiresAt: Date.now() + this.TTL_MS,
                });
                return setting.value;
            }
        } catch (error) {
            logger.error(
                `Error fetching setting ${key}: ${(error as Error).message}`
            );
        }

        return null;
    }

    public async getNumber(key: string, defaultValue: number): Promise<number> {
        const val = await this.get(key);
        if (val === null) return defaultValue;
        const parsed = Number(val);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    public async getBoolean(
        key: string,
        defaultValue: boolean
    ): Promise<boolean> {
        const val = await this.get(key);
        if (val === null) return defaultValue;
        return val.toLowerCase() === "true" || val === "1";
    }

    public async getString(key: string, defaultValue: string): Promise<string> {
        const val = await this.get(key);
        return val === null ? defaultValue : val;
    }

    public invalidate(key: string): void {
        this.cache.delete(key);
    }
}

export const settingsService = new SettingsService();
