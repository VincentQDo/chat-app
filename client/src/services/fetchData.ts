export default function fetchData(subRoute: string, options?: RequestInit) {
    return fetch(`http://localhost:8080${subRoute}`, options);
}
