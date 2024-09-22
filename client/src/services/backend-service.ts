import { env } from "process";

export function getBackendBaseUrl() {
    if (env.NEXT_PUBLIC_API_URL) {
        return env.NEXT_PUBLIC_API_URL;
    } else {
        return "http://localhost:8080";
    }
}
