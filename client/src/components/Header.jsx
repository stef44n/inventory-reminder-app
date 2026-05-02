export default function Header({ title }) {
    return (
        <div
            style={{
                padding: "16px",
                fontSize: "20px",
                fontWeight: "bold",
            }}
        >
            {title}
        </div>
    );
}
