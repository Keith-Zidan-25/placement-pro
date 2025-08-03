let serverAlive: boolean = false

export async function checkServerStatus(): Promise<boolean> {
    const SERVER_URL = process.env.FASTAPI_SERVER_URL;

    if (!SERVER_URL) {
        throw new Error('Server url not found');
    }

    try {
        const response = await fetch(`${SERVER_URL}`).then(
            response => {
                if (!response.ok) {
                    throw new Error(`Connection Failed: ${response.status}`);
                }
                return true;
        });

        if (response) {
            serverAlive = true;
        }
    } catch (err) {
        console.log(err);
        serverAlive = false;
    } finally {
        return serverAlive;
    }
}