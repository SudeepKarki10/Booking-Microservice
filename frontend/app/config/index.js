
const config = () => {
    return {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4001",
    }
}


if(!config().NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required in environment variables');
}

export default config();
