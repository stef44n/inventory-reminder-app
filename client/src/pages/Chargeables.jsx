import { useEffect, useState } from "react";
import API from "../api/api";

export default function Chargeables() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [chargeCycleDays, setChargeCycleDays] = useState("");

    const fetchItems = async () => {
        try {
            const res = await API.get("/chargeables");
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
            await API.post("/chargeables", {
                name,
                category: "CHARGEABLE",
                chargeCycleDays: Number(chargeCycleDays),
            });

            setName("");
            setChargeCycleDays("");

            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error adding item");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/chargeables/${id}`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkCharged = async (id) => {
        try {
            await API.put(`/chargeables/${id}/charge`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Chargeables</h2>

            {/* Add Form */}
            <form onSubmit={handleAdd}>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br />
                <br />

                <input
                    type="number"
                    placeholder="Charge Cycle (days)"
                    value={chargeCycleDays}
                    onChange={(e) => setChargeCycleDays(e.target.value)}
                />
                <br />
                <br />

                <button type="submit">Add</button>
            </form>

            <hr />

            {/* List */}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <strong>{item.name}</strong>

                        <button onClick={() => handleMarkCharged(item.id)}>
                            Mark Charged
                        </button>

                        <button onClick={() => handleDelete(item.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
