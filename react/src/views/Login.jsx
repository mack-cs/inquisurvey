import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvide";
import { useState } from "react";
import axiosClient from "../axios";

export default function Login() {
  const { setUserToken, setCurrentUser } = useStateContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ __html: "" });
  const [isLoading, setIsLoading] = useState(false); // For showing a loading state if needed

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({ __html: "" });
    setIsLoading(true);

    axiosClient
      .post("/login", { email, password })
      .then(({ data }) => {
        setCurrentUser(data.user);
        setUserToken(data.token);
        console.log(data);
      })
      .catch((error) => {
        if (error.response) {
          const status = error.response.status;

          if (status === 422) {
            const errorData = error.response.data.errors;

            if (errorData && typeof errorData === "object") {
              const serverErrors = Object.values(errorData).reduce(
                (accum, next) => [...accum, ...next],
                []
              );
              setErrors({ __html: serverErrors.join("<br>") });
            } else {
              setErrors({ __html: error.response.data.error });
            }
          } else if (status === 401) {
            setErrors({ __html: "Invalid credentials, please try again." });
          } else {
            setErrors({
              __html: "An unexpected error occurred. Please try again later.",
            });
          }
        } else {
          setErrors({
            __html:
              "Unable to connect to the server. Please check your internet connection and try again.",
          });
        }
        console.log("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="pb-6">
          {errors.__html && (
            <div
              className="bg-red-500 rounded py-2 px-2 text-white"
              dangerouslySetInnerHTML={errors}
            ></div>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              placeholder="Email address"
              required
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-label="Password"
              placeholder="Password"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="/signup"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
