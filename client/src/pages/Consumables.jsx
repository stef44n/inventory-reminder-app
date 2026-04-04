import { useEffect, useState } from "react";
import API from "../api/api";

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
        <div style={{ padding: "20px" }}>
            <h2>Consumables</h2>

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

                <button type="submit">Add</button>
            </form>

            <hr />

            {/* List */}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <strong>{item.name}</strong> —{" "}
                        {item.consumable.quantity} {item.consumable.unit}
                        <button
                            onClick={() => {
                                setEditingItemId(item.id);
                                setEditQuantity(item.consumable.quantity);
                            }}
                        >
                            Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)}>
                            Delete
                        </button>
                        {editingItemId === item.id && (
                            <div>
                                <input
                                    type="number"
                                    value={editQuantity}
                                    onChange={(e) =>
                                        setEditQuantity(e.target.value)
                                    }
                                />

                                <button onClick={() => handleUpdate(item.id)}>
                                    Save
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
