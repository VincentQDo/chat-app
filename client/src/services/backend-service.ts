export function getBackendBaseUrl() {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    } else {
        return "http://192.168.50.113:8080";
    }
}

export function fetchData(url: string, options?: RequestInit): Promise<Response> {
    return fetch(`${getBackendBaseUrl()}${url}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        ...options
    })
}
