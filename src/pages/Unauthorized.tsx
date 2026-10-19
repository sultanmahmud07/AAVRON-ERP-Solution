import { Link } from "react-router";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center px-4">
      <div className="bg-secondary p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-red-500 mb-4">
           🚫 Access Denied!
        </h1>
        <p className=" text-lg mb-6">
Sorry! You are not authorized to view this page. 🙅‍♂️

        </p>

        <Link
          to="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-primary/90 transition"
        >
          ⬅ Back to Home
        </Link>
      </div>
    </div>
  );
}
