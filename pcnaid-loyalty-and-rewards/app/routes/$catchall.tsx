import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { useEffect } from "react";

export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    console.log("Programs page loaded");
  }, []);

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}