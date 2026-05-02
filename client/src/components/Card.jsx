export default function Card({ children }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
        >
            {children}
        </div>
    );
}
