'use client';

import { useEffect, useState } from "react";

export function useAuth() {
	const [userToken, setUserToken] = useState('');
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			console.log(token)
			setUserToken(token);
		} else {
			setUserToken('');
		}
	}, [])
	return userToken;
}
