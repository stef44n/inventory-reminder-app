import { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";

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
        <div className="container">
            <Header title="Chargeables" />

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
                        placeholder="Charge Cycle (days)"
                        value={chargeCycleDays}
                        onChange={(e) => setChargeCycleDays(e.target.value)}
                    />
                    <br />
                    <br />

                    <button type="submit">Add</button>
                </div>
            </form>

            <hr className="divider" />

            {/* List */}

            {items.length === 0 ? (
                <p className="empty-text">No items yet</p>
            ) : (
                items.map((item) => {
                    const lastCharged = new Date(item.chargeable.lastChargedAt);
                    const nextCharge = new Date(lastCharged);
                    nextCharge.setDate(
                        nextCharge.getDate() + item.chargeable.chargeCycleDays,
                    );

                    const now = new Date();
                    const isDue = now >= nextCharge;

                    return (
                        <div className="card" key={item.id}>
                            <div className="card-row">
                                {/* LEFT */}
                                <div className="card-left">
                                    <span className="card-title">
                                        {item.name}
                                    </span>
                                    <span className="card-subtext">
                                        Every {item.chargeable.chargeCycleDays}{" "}
                                        days
                                    </span>
                                </div>

                                {/* RIGHT */}
                                <div className="card-right">
                                    {/* STATUS */}
                                    <div
                                        className={`status ${
                                            isDue ? "status-due" : "status-ok"
                                        }`}
                                    >
                                        {isDue ? "Due" : "OK"}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="card-actions">
                                        <button
                                            className="button-small"
                                            onClick={() =>
                                                handleMarkCharged(item.id)
                                            }
                                        >
                                            Charged
                                        </button>

                                        <button
                                            className="button-small"
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
