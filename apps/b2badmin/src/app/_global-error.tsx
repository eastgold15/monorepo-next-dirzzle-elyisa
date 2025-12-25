"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            fontFamily: "system-ui, sans-serif",
            padding: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
              color: "#111",
            }}
          >
            Something went wrong!
          </h2>
          <p style={{ color: "#666", margin: 0, textAlign: "center" }}>
            {error.message || "An unexpected error occurred"}
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            onMouseOut={(e) =>
              // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
              (e.currentTarget.style.backgroundColor = "#3b82f6")
            }
            onMouseOver={(e) =>
              // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
