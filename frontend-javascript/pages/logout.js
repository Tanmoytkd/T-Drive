import Router from "next/router";
import {useState} from "react";

export default function MyFilesPage() {

    const [logoutError, setLogoutError] = useState("");

    async function logout() {
        const url = 'http://localhost:3000/logout';
        const response = await fetch(url, {
            withCredentials: true,
            credentials: 'include',
        });

        const data = await response.json();
        console.log(data);

        if ('error' in data) {
            setLogoutError(data.error);
        } else {
            await Router.push('/');
        }
    }

    logout();

    return (
        <div>{logoutError}</div>
    )
}
