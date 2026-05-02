import { useEffect, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";
import Header from "../components/Header";

export default function Consumables() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [minThreshold, setMinThreshold] = useState("");
    const [unit, setUnit] = useState("");
    const [editingItemId, setEditingItemId] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");

    const fetchItems = async () => {
        try {
            const res = await API.get("/consumables");
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
            await API.post("/consumables", {
                name,
                category: "CONSUMABLE",
                quantity: Number(quantity),
                minThreshold: Number(minThreshold),
                unit,
            });

            setName("");
            setQuantity("");
            setMinThreshold("");
            setUnit("");

            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error adding item");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/consumables/${id}`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await API.put(`/consumables/${id}`, {
                quantity: Number(editQuantity),
            });

            setEditingItemId(null);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error updating item");
        }
    };

    return (
        <div className="container">
            <Header title="Consumables" />

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
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                    <br />
                    <br />

                    <input
                        type="number"
                        placeholder="Min Threshold"
                        value={minThreshold}
                        onChange={(e) => setMinThreshold(e.target.value)}
                    />
                    <br />
                    <br />

                    <input
                        placeholder="Unit (e.g. kg, litres, units)"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    />
                    <br />
                    <br />

                    <button type="submit" className="button-primary">
                        Add
                    </button>
                </div>
            </form>

            <hr className="divider" />

            {/* List */}
            {items.length === 0 ? (
                <p className="empty-text">No items yet</p>
            ) : (
                items.map((item) => {
                    const isLow =
                        item.consumable.quantity <=
                        item.consumable.minThreshold;

                    return (
                        <Card key={item.id}>
                            <div className="card-row">
                                {/* LEFT */}
                                <div className="card-left">
                                    <span className="card-title">
                                        {item.name}
                                    </span>

                                    <span className="card-subtext">
                                        {item.consumable.quantity}{" "}
                                        {item.consumable.unit}
                                    </span>

                                    <span className="card-subtext">
                                        Min: {item.consumable.minThreshold}{" "}
                                        {item.consumable.unit}
                                    </span>
                                </div>

                                {/* RIGHT */}
                                <div className="card-right">
                                    {/* STATUS */}
                                    <div
                                        className={`status ${
                                            isLow ? "status-due" : "status-ok"
                                        }`}
                                    >
                                        {isLow ? "Low" : "OK"}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="card-actions">
                                        <button
                                            className="button-small"
                                            onClick={() => {
                                                setEditingItemId(item.id);
                                                setEditQuantity(
                                                    item.consumable.quantity,
                                                );
                                            }}
                                        >
                                            Edit
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

                                    {/* EDIT SECTION */}
                                    {editingItemId === item.id && (
                                        <div className="edit-section">
                                            <input
                                                type="number"
                                                value={editQuantity}
                                                onChange={(e) =>
                                                    setEditQuantity(
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                            <button
                                                className="button-small"
                                                onClick={() =>
                                                    handleUpdate(item.id)
                                                }
                                            >
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );
}
