import useUser from "../lib/useUser";

export default function UploadFilePage() {

    useUser({redirectTo: '/', redirectIfFound: false})

    return (
        <div>Upload Page</div>
    )
}
