import { useEffect, useState } from "react";
import API from "../api/api";

export default function Subscriptions() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [cycleDays, setCycleDays] = useState("");

    const fetchItems = async () => {
        try {
            const res = await API.get("/subscriptions");
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();

        try {
            await API.post("/subscriptions", {
                name,
                category: "SUBSCRIPTION",
                cycleDays: Number(cycleDays),
            });

            setName("");
            setCycleDays("");

            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error adding subscription");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/subscriptions/${id}`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRenew = async (id) => {
        try {
            await API.put(`/subscriptions/${id}/renew`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <h2>Subscriptions</h2>

            {/* Add Form */}
            <form onSubmit={handleAdd}>
                <div className="card">
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <br />
                    <br />

                    <input
                        type="number"
                        placeholder="Cycle (days)"
                        value={cycleDays}
                        onChange={(e) => setCycleDays(e.target.value)}
                    />
                    <br />
                    <br />

                    <button type="submit">Add</button>
                </div>
            </form>

            <hr />

            {/* List */}

            {items.map((item) => (
                <div className="card" key={item.id}>
                    <strong>{item.name}</strong>
                    <p></p>

                    <button
                        className="button-small"
                        onClick={() => handleRenew(item.id)}
                    >
                        Renew
                    </button>

                    <button
                        className="button-small"
                        onClick={() => handleDelete(item.id)}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
