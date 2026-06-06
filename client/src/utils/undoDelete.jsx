import API from "../api/api";
import toast from "react-hot-toast";

export async function undoDelete({
    item,
    endpoint,
    setItems,
    buildRestorePayload,
}) {
    try {
        await API.delete(`${endpoint}/${item.id}`);

        setItems((prev) => prev.filter((existing) => existing.id !== item.id));

        const toastId = toast(
            (t) => (
                <span>
                    Item deleted
                    <button
                        className="undo-btn"
                        onClick={async () => {
                            try {
                                const payload = buildRestorePayload(item);

                                await API.post(endpoint, payload);

                                setItems((prev) => [...prev, item]);

                                toast.dismiss(t.id);
                            } catch (err) {
                                console.error(err);
                                toast.error("Restore failed");
                            }
                        }}
                    >
                        Undo
                    </button>
                </span>
            ),

            // {
            //     duration: 5000,
            // },
        );
        setTimeout(() => {
            toast.dismiss(toastId);
        }, 5000);
    } catch (err) {
        console.error(err);
        toast.error("Delete failed");
    }
}
