import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await API.get("/dashboard");
                setData(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Dashboard</h2>

            {!data ? (
                <p>Loading...</p>
            ) : (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
}
