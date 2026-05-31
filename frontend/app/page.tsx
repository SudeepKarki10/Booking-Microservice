import GoogleAuthButton from "./components/GoogleAuthButton";


export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Welcome to the Next.js App!</h1>
      <div className="flex justify-center mt-10"></div>
        <GoogleAuthButton />
      </>
  
  );
}
