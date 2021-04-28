import useUser from "../lib/useUser";

export default function MyFilesPage() {

    useUser({redirectTo: '/', redirectIfFound: false})

    return (
        <div>MyFiles Page</div>
    )
}
