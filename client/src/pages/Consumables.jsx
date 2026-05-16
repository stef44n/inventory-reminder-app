import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";
import Header from "../components/Header";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import toast from "react-hot-toast";

export default function Consumables() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [minThreshold, setMinThreshold] = useState("");
    const [unit, setUnit] = useState("");
    const [editingItemId, setEditingItemId] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [showForm, setShowForm] = useState(false);
    const holdInterval = useRef(null);

    const fetchItems = async () => {
        try {
            setLoading(true);

            const res = await API.get("/consumables");

            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();

        const openForm = () => setShowForm(true);

        window.addEventListener("openAddConsumable", openForm);

        return () => {
            window.removeEventListener("openAddConsumable", openForm);

            clearInterval(holdInterval.current);
        };
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
            setShowForm(false);

            fetchItems();
            toast.success("Item added");
        } catch (err) {
            console.error(err);
            toast.error("Error adding item");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/consumables/${id}`);
            fetchItems();
            toast.success("Item deleted");
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
            toast.success("Item updated");
        } catch (err) {
            console.error(err);
            toast.error("Error updating item");
        }
    };

    const handleQuickAdjust = async (id, currentQuantity, amount) => {
        const newQuantity = Math.max(0, currentQuantity + amount);

        // instant frontend update
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          consumable: {
                              ...item.consumable,
                              quantity: newQuantity,
                          },
                      }
                    : item,
            ),
        );

        try {
            await API.put(`/consumables/${id}`, {
                quantity: newQuantity,
            });
        } catch (err) {
            console.error(err);

            // rollback if failed
            fetchItems();

            toast.error("Update failed");
        }
    };

    const startAdjusting = (id, quantity, amount) => {
        // immediate first update
        handleQuickAdjust(id, quantity, amount);

        let currentQuantity = quantity + amount;

        holdInterval.current = setInterval(() => {
            handleQuickAdjust(id, currentQuantity, amount);

            currentQuantity += amount;

            if (currentQuantity < 0) {
                stopAdjusting();
            }
        }, 180);
    };

    const stopAdjusting = () => {
        clearInterval(holdInterval.current);
    };

    return (
        <div className="container">
            <Header title="Consumables" />

            {/* ADD BUTTON */}
            <button
                className="add-item-button"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? "✕ Cancel" : "+ Add New Item"}
            </button>

            {/* FORM (hidden by default) */}
            {showForm && (
                <div className="form-wrapper">
                    <form onSubmit={handleAdd}>
                        <div className="card">
                            <input
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Min Threshold"
                                value={minThreshold}
                                onChange={(e) =>
                                    setMinThreshold(e.target.value)
                                }
                            />

                            <input
                                placeholder="Unit (kg, litres, units)"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            />

                            <button type="submit" className="button-primary">
                                Save Item
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <hr className="divider" />

            {/* List */}
            {loading ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : items.length === 0 ? (
                <p className="empty-text">No items yet</p>
            ) : (
                items.map((item) => {
                    const isLow =
                        item.consumable.quantity <=
                        item.consumable.minThreshold;

                    return (
                        <SwipeCard
                            key={item.id}
                            leftAction={(close) => (
                                <button
                                    type="button"
                                    className="swipe-btn"
                                    onClick={() => {
                                        setEditingItemId(item.id);
                                        setEditQuantity(
                                            item.consumable.quantity,
                                        );
                                        close();
                                    }}
                                >
                                    Edit
                                </button>
                            )}
                            rightAction={(close) => (
                                <button
                                    type="button"
                                    className="swipe-btn"
                                    onClick={() => {
                                        handleDelete(item.id);
                                        close();
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        >
                            <Card icon="🧃">
                                <div className="card-row">
                                    {/* LEFT */}
                                    <div className="card-left">
                                        <span className="card-title">
                                            {item.name}
                                        </span>

                                        <div className="quantity-row">
                                            <button
                                                type="button"
                                                className="quantity-btn"
                                                onMouseDown={() =>
                                                    startAdjusting(
                                                        item.id,
                                                        item.consumable
                                                            .quantity,
                                                        -1,
                                                    )
                                                }
                                                onMouseUp={stopAdjusting}
                                                onMouseLeave={stopAdjusting}
                                                onTouchStart={() =>
                                                    startAdjusting(
                                                        item.id,
                                                        item.consumable
                                                            .quantity,
                                                        -1,
                                                    )
                                                }
                                                onTouchEnd={stopAdjusting}
                                            >
                                                −
                                            </button>

                                            <span className="quantity-value">
                                                {item.consumable.quantity}{" "}
                                                {item.consumable.unit}
                                            </span>

                                            <button
                                                type="button"
                                                className="quantity-btn"
                                                onMouseDown={() =>
                                                    startAdjusting(
                                                        item.id,
                                                        item.consumable
                                                            .quantity,
                                                        1,
                                                    )
                                                }
                                                onMouseUp={stopAdjusting}
                                                onMouseLeave={stopAdjusting}
                                                onTouchStart={() =>
                                                    startAdjusting(
                                                        item.id,
                                                        item.consumable
                                                            .quantity,
                                                        1,
                                                    )
                                                }
                                                onTouchEnd={stopAdjusting}
                                            >
                                                +
                                            </button>
                                        </div>

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
                                                isLow
                                                    ? "status-due"
                                                    : "status-ok"
                                            }`}
                                        >
                                            {isLow ? "Low" : "OK"}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="card-actions"></div>

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
                                                    type="button"
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
                        </SwipeCard>
                    );
                })
            )}
        </div>
    );
}
