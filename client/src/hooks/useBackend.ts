import { useState, useEffect } from 'react';

const BASE_URL = 'https://api.example.com'; // Your base URL
const AUTH_TOKEN = 'your-auth-token'; // Replace with a token from your auth system

export const useApi = (endpoint, options = {}) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Set default headers and merge with options
				const fetchOptions = {
					...options,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${AUTH_TOKEN}`, // Attach the auth token
						...options.headers, // Allow overriding headers if needed
					},
				};

				const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}

				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [endpoint, options]);

	return { data, loading, error };
};
