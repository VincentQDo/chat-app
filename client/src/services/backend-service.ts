export function getBackendBaseUrl() {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    } else {
        return "http://localhost:8080";
    }
}

export function fetchData(method: string, url: string, options?: RequestInit): Promise<Response> {
    return fetch(`${getBackendBaseUrl()}${url}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        ...options
    })
}
