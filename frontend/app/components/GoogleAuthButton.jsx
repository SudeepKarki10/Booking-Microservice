"use client";
import { useEffect } from "react";
import Script from "next/script";
import config from "../config"; 

export default function GoogleAuthButton({label = "Continue with google"}) {
    useEffect(() => {
        console.log("Config backend url:", config.BACKEND_URL);
    },[]);
    const handleGoogleResponse = async (response) => {
        try{
            //1. Send the ID token to your backend for verification and authentication
            const res = await fetch(`${config.BACKEND_URL}/api/v1/auth/google-auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ idToken: response.credential }),
                credentials: "include" 
            });

            if(!res.ok){
                throw new Error("Failed to authenticate with Google");
            }

            //if response is redirected to the dashboard or home page, you can handle that logic here
            window.location.href = "/dashboard"; // redirect to dashboard after successful login
        }catch(error){
            console.error("Google Sign-In failed", error);
        }
    }

    const initializeGoogleSignIn = () => {
        if(window.google){
            //1. Initialize the Google Sign-In client with your client ID and a callback function to handle the response
            window.google.accounts.id.initialize({
                client_id: config.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });

            //2. Render the Google Sign-In button in a container element with the specified theme and size
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large" }
            );
        }
    };

    useEffect(() => {
        initializeGoogleSignIn();
    }, []);

    return (
        <>
            <Script src="https://accounts.google.com/gsi/client" onLoad={initializeGoogleSignIn} strategy="afterInteractive" />
            <div id="googleSignInDiv" className="w-full flex justify-center">
                {label}
            </div>
        </>
    );
}