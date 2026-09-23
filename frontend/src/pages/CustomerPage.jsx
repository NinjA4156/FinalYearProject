import { useState, useEffect } from "react";
import { createToken, getTokenById } from "../services/tokenApi";
import { connectSocket } from "../services/socket";
import StatusBadge from "../components/StatusBadge";

function CustomerPage() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGetToken = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await createToken();
            // Expecting API response like { id, token_number, status }
            setToken(data);
        } catch (err) {
            console.error(err);
            setError("Failed to get token. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token?.id) return;

        const updateStatus = async () => {
            try {
                const updated = await getTokenById(token.id);
                if (updated) {
                    setToken(updated);
                }
            } catch (err) {
                console.error("Failed to fetch token status update:", err);
            }
        };

        const socket = connectSocket(() => {
            updateStatus();
        });

        return () => {
            if (socket && typeof socket.close === "function") {
                socket.close();
            }
        };
    }, [token?.id]);

    const getStatusMessage = (status) => {
        switch (status) {
            case "calling":
            case "called":
                return {
                    text: "🎉 Your token is being called! Please proceed to the service counter.",
                    color: "bg-blue-50 text-blue-700 border-blue-200",
                };
            case "completed":
                return {
                    text: "✅ Your token has been completed. Thank you for visiting!",
                    color: "bg-green-50 text-green-700 border-green-200",
                };
            case "waiting":
            default:
                return {
                    text: "⏳ Waiting in queue. Please wait for your token to be called.",
                    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
                };
        }
    };

    const statusInfo = token ? getStatusMessage(token.status) : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
            {/* Header */}
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Queue Management System
                </h1>
            </header>

            {/* Card */}
            <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm text-center">
                {!token ? (
                    <>
                        <p className="text-gray-600 mb-6">
                            Click below to get your queue token.
                        </p>
                        <button
                            onClick={handleGetToken}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? "Getting Token..." : "Get Token"}
                        </button>
                    </>
                ) : (
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Your Token</p>
                        <p className="text-5xl font-bold text-gray-800 mb-4">
                            {token.token_number}
                        </p>
                        <div className="mb-4">
                            <StatusBadge status={token.status || "waiting"} />
                        </div>

                        {/* Status detail box */}
                        {statusInfo && (
                            <div
                                className={`text-xs font-medium px-3 py-2.5 rounded-lg border mb-6 ${statusInfo.color}`}
                            >
                                {statusInfo.text}
                            </div>
                        )}

                        <button
                            onClick={handleGetToken}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
                        >
                            Get Another Token
                        </button>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>

            <p className="text-gray-400 text-xs mt-8">
                Staff? Go to <a href="/staff" className="underline">/staff</a>
            </p>
        </div>
    );
}

export default CustomerPage;