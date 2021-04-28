import useUser from "../lib/useUser";

export default function SharedWithMePage() {

    useUser({redirectTo: '/', redirectIfFound: false})

    return (
        <div>SharedWithMe Page</div>
    )
}
