import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";
import Header from "../components/Header";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import ItemToolbar from "../components/ItemToolbar";
import { isConsumableLow } from "../utils/itemStatus";
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
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const syncTimeout = useRef({});
    const holdTimeoutRef = useRef(null);
    const holdIntervalRef = useRef(null);
    const holdStartRef = useRef(null);
    const pendingUpdatesRef = useRef({});
    const nameInputRef = useRef(null);

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
        window.addEventListener("pointerup", stopHold);

        return () => {
            window.removeEventListener("openAddConsumable", openForm);
            window.removeEventListener("pointerup", stopHold);

            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
            Object.values(syncTimeout.current).forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        if (showForm && nameInputRef.current) {
            setTimeout(() => {
                nameInputRef.current.focus();
                nameInputRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [showForm]);

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

    const queueUpdate = async (id, quantity) => {
        // clear previous sync timer
        if (syncTimeout.current[id]) {
            clearTimeout(syncTimeout.current[id]);
        }

        // debounce backend sync
        syncTimeout.current[id] = setTimeout(async () => {
            try {
                await API.put(`/consumables/${id}`, {
                    quantity,
                });

                delete pendingUpdatesRef.current[id];
            } catch (err) {
                console.error(err);

                fetchItems();

                toast.error("Sync failed");
            }
        }, 350);
    };

    const startHold = (id, currentQty, change) => {
        holdStartRef.current = Date.now();

        let localQty = currentQty;

        const runUpdate = async () => {
            const heldFor = Date.now() - holdStartRef.current;

            // 🔥 acceleration curve
            let step = 1;

            if (heldFor > 4000) {
                step = 10;
            } else if (heldFor > 2500) {
                step = 5;
            } else if (heldFor > 1200) {
                step = 2;
            }

            localQty += change * step;

            if (localQty < 0) {
                localQty = 0;
            }

            // instant UI update
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              consumable: {
                                  ...item.consumable,
                                  quantity: localQty,
                              },
                          }
                        : item,
                ),
            );

            pendingUpdatesRef.current[id] = localQty;

            queueUpdate(id, localQty);
        };

        // initial single press
        runUpdate();

        holdTimeoutRef.current = setTimeout(() => {
            holdIntervalRef.current = setInterval(runUpdate, 120);
        }, 300);
    };

    const stopHold = () => {
        clearTimeout(holdTimeoutRef.current);
        clearInterval(holdIntervalRef.current);
    };

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const isLow = isConsumableLow(item);

            if (activeFilter === "Low") {
                return matchesSearch && isLow;
            }

            if (activeFilter === "OK") {
                return matchesSearch && !isLow;
            }

            return matchesSearch;
        })
        .sort((a, b) => {
            const aLow = a.consumable.quantity <= a.consumable.minThreshold;

            const bLow = b.consumable.quantity <= b.consumable.minThreshold;

            // low stock first
            if (aLow !== bLow) {
                return aLow ? -1 : 1;
            }

            // then lower quantity first
            if (a.consumable.quantity !== b.consumable.quantity) {
                return a.consumable.quantity - b.consumable.quantity;
            }

            // alphabetical
            return a.name.localeCompare(b.name);
        });

    return (
        <div className="container">
            <Header title="Consumables" />

            <ItemToolbar
                search={search}
                setSearch={setSearch}
                filters={["All", "Low", "OK"]}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                addLabel={showForm ? "✕ Cancel" : "+ Add New Item"}
                onAddClick={() => setShowForm(!showForm)}
            />

            {/* FORM (hidden by default) */}
            {showForm && (
                <div className="form-wrapper">
                    <form onSubmit={handleAdd}>
                        <div className="card">
                            <div className="input-group">
                                <label className="input-label">Item name</label>

                                <input
                                    ref={nameInputRef}
                                    className="date-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Quantity</label>

                                <input
                                    type="number"
                                    className="date-input"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Min Threshold
                                </label>

                                <input
                                    type="number"
                                    className="date-input"
                                    value={minThreshold}
                                    onChange={(e) =>
                                        setMinThreshold(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Unit (kg, litres, units etc)
                                </label>

                                <input
                                    className="date-input"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                />
                            </div>

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
                <>
                    {filteredItems.map((item) => {
                        const isLow = isConsumableLow(item);

                        return (
                            <SwipeCard
                                key={item.id}
                                isActive={activeSwipeId === item.id}
                                onActivate={() => setActiveSwipeId(item.id)}
                                onCloseOther={() => setActiveSwipeId(null)}
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
                                                    onPointerDown={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();

                                                        startHold(
                                                            item.id,
                                                            item.consumable
                                                                .quantity,
                                                            -1, // or +1
                                                        );
                                                    }}
                                                    onTouchStart={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onTouchMove={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onTouchEnd={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onPointerUp={stopHold}
                                                    onPointerLeave={stopHold}
                                                    onPointerCancel={stopHold}
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
                                                    onPointerDown={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();

                                                        startHold(
                                                            item.id,
                                                            item.consumable
                                                                .quantity,
                                                            1,
                                                        );
                                                    }}
                                                    onTouchStart={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onTouchMove={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onTouchEnd={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onPointerUp={stopHold}
                                                    onPointerLeave={stopHold}
                                                    onPointerCancel={stopHold}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span className="card-subtext">
                                                Min:{" "}
                                                {item.consumable.minThreshold}{" "}
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
                                                            handleUpdate(
                                                                item.id,
                                                            )
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
                    })}
                </>
            )}
        </div>
    );
}
