import API from "../api/api";
import toast from "react-hot-toast";

export function deleteWithUndo({
    id,
    item,
    setItems,
    endpoint,
    restoreEndpoint = null,
}) {
    // 1. backup current list item
    const backup = item;

    // 2. remove immediately from UI
    setItems((prev) => prev.filter((i) => i.id !== id));

    // 3. delete from backend immediately
    API.delete(`${endpoint}/${id}`).catch((err) => {
        console.error(err);
        toast.error("Delete failed");
    });

    // 4. show undo toast
    toast(
        (t) => (
            <div className="undo-toast">
                <span>Item deleted</span>

                <button
                    onClick={async () => {
                        try {
                            const payload = {
                                name: backup.name,
                                category: "CONSUMABLE",
                                quantity: backup.consumable.quantity,
                                minThreshold: backup.consumable.minThreshold,
                                unit: backup.consumable.unit,
                            };

                            await API.post(
                                restoreEndpoint || endpoint,
                                payload,
                            );

                            setItems((prev) => [...prev, backup]);

                            toast.dismiss(t.id);
                        } catch (err) {
                            console.error(err);
                            toast.error("Restore failed");
                        }
                    }}
                >
                    Undo
                </button>
            </div>
        ),
        {
            duration: 5000,
        },
    );
}
