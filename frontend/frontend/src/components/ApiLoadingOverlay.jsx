import { useApiStatus } from "../context/ApiStatusContext";

export const ApiLoadingOverlay = () => {
  const { isConnected, isChecking } = useApiStatus();

  if (isConnected) return null;

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        {isChecking && (
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
        <h2 className="text-xl font-semibold text-foreground">
          {isChecking ? "Waking up server..." : "Unable to connect"}
        </h2>
        <p className="text-foreground/60 max-w-sm">
          {isChecking
            ? "The server is starting up. This may take a moment on first load."
            : "Could not connect to the server. Please try starting it manually."
          }
        </p>
        <a
          href="https://housemarketpredictor.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-primary hover:underline"
        >
          Start server manually &rarr;
        </a>
      </div>
    </div>
  );
};
