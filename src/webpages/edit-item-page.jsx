import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditItemPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [errors, setErrors] = useState({});

    // Modal state
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingField, setPendingField] = useState(null);
    const [pendingValue, setPendingValue] = useState(null);
    const [pendingLabel, setPendingLabel] = useState("");

    useEffect(() => {
        const paddedId = id.toString().padStart(12, "0");
        fetch(`http://localhost:5000/api/items/${paddedId}`)
            .then(res => res.json())
            .then(data => setItem(data));
    }, [id]);

    // Validation
    function validateField(field, value) {
        const newErrors = {};

        if (field === "item_name") {
            if (!value.trim()) newErrors[field] = "Item name is required.";
            else if (value.length < 3) newErrors[field] = "Item name must be at least 3 characters.";
        }

        if (field === "item_description") {
            if (!value.trim()) newErrors[field] = "Description is required.";
            else if (value.length < 10) newErrors[field] = "Description must be at least 10 characters.";
        }

        if (field === "allergen_description") {
            if (!value.trim()) newErrors[field] = "Allergen info is required.";
            else if (value.length < 3) newErrors[field] = "Allergen info must be at least 3 characters.";
        }

        if (field === "discount") {
            if (isNaN(value)) newErrors[field] = "Discount must be a number.";
            else if (value < 0 || value > 100) newErrors[field] = "Discount must be between 0 and 100.";
        }

        if (field === "item_price") {
            if (isNaN(value)) newErrors[field] = "Price must be a number.";
            else if (value <= 0) newErrors[field] = "Price must be greater than 0.";
        }

        if (field === "restriction") {
            if (!Number.isInteger(Number(value))) newErrors[field] = "Restriction must be an integer.";
            else if (value < 0) newErrors[field] = "Restriction cannot be negative.";
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    }

    // Backend update
    function handleUpdate(field, value) {
        if (!validateField(field, value)) return;

        fetch(`http://localhost:5000/api/edit-item/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ [field]: value }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setItem(prev => ({ ...prev, [field]: value }));
                } else {
                    alert("Update failed: " + data.error);
                }
            });
    }

    // Image upload
    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrors(prev => ({ ...prev, image: "File must be an image." }));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: "Image must be under 2MB." }));
            return;
        }

        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64 = reader.result;

            const res = await fetch(`http://localhost:5000/api/edit-item/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ image: base64 }),
            });

            const data = await res.json();

            if (data.success) {
                setItem(prev => ({ ...prev, image: data.url }));
            } else {
                alert("Image upload failed");
            }
        };

        reader.readAsDataURL(file);
    }

    // Open modal
    function requestConfirmation(label, field, value) {
        setPendingLabel(label);
        setPendingField(field);
        setPendingValue(value);
        setShowConfirm(true);
    }

    if (!item) return <p>Loading item...</p>;

    return (
        <div className="edit-item-page">
            <header className="edititem-name-header">
                <h1>Edit: {item.item_name}</h1>
            </header>

            {/* ITEM NAME */}
            <div className="edit-block wide">
                <label>Edit item name</label>
                <input className="edit-input" type="text" defaultValue={item.item_name} name="itemname" />
                {errors.item_name && <p className="error-text">{errors.item_name}</p>}

                <button
                    className="edit-save"
                    onClick={() => {
                        const value = document.querySelector("[name=itemname]").value;
                        requestConfirmation("item name", "item_name", value);
                    }}
                >
                    Save
                </button>
            </div>

            {/* DESCRIPTION + ALLERGEN */}
            <div className="edit-row">
                <div className="edit-block half wide">
                    <label>Item description</label>
                    <textarea className="edit-input tall" name="description" defaultValue={item.item_description} />
                    {errors.item_description && <p className="error-text">{errors.item_description}</p>}

                    <button
                        className="edit-save"
                        onClick={() => {
                            const value = document.querySelector("[name=description]").value;
                            requestConfirmation("description", "item_description", value);
                        }}
                    >
                        Save
                    </button>
                </div>

                <div className="edit-block half wide">
                    <label>Allergen information</label>
                    <textarea className="edit-input tall" name="allergen" defaultValue={item.allergen_description} />
                    {errors.allergen_description && <p className="error-text">{errors.allergen_description}</p>}

                    <button
                        className="edit-save"
                        onClick={() => {
                            const value = document.querySelector("[name=allergen]").value;
                            requestConfirmation("allergen information", "allergen_description", value);
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* SMALL FIELDS */}
            <div className="edit-row">
                <div className="edit-block quarter">
                    <label>Edit discount</label>
                    <input className="edit-input short" type="number" step="0.01" defaultValue={item.discount * 100} name="discount" />
                    {errors.discount && <p className="error-text">{errors.discount}</p>}

                    <button
                        className="edit-save"
                        onClick={() => {
                            const value = document.querySelector("[name=discount]").value;
                            requestConfirmation("discount", "discount", Number(value));
                        }}
                    >
                        Save
                    </button>
                </div>

                <div className="edit-block quarter">
                    <label>Edit item price</label>
                    <input className="edit-input short" type="number" step="0.01" defaultValue={item.item_price} name="price" />
                    {errors.item_price && <p className="error-text">{errors.item_price}</p>}

                    <button
                        className="edit-save"
                        onClick={() => {
                            const value = document.querySelector("[name=price]").value;
                            requestConfirmation("price", "item_price", Number(value));
                        }}
                    >
                        Save
                    </button>
                </div>

                <div className="edit-block quarter">
                    <label>Edit restriction</label>
                    <input className="edit-input short" type="number" defaultValue={item.restriction} name="restriction" />
                    {errors.restriction && <p className="error-text">{errors.restriction}</p>}

                    <button
                        className="edit-save"
                        onClick={() => {
                            const value = document.querySelector("[name=restriction]").value;
                            requestConfirmation("restriction", "restriction", Number(value));
                        }}
                    >
                        Save
                    </button>
                </div>

                <div className="edit-block quarter">
                    <label>Upload new image</label>
                    <input className="edit-input short" type="file" accept="image/*" onChange={(e) => requestConfirmation("image", "image", e)} />
                    {errors.image && <p className="error-text">{errors.image}</p>}
                </div>
            </div>

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Confirm Change</h2>
                        <p>
                            Are you sure you want to update the <strong>{pendingLabel}</strong>?
                        </p>

                        <div className="modal-actions">
                            <button
                                className="confirm-delete"
                                onClick={() => {
                                    if (pendingField === "image") {
                                        handleImageUpload(pendingValue);
                                    } else {
                                        handleUpdate(pendingField, pendingValue);
                                    }
                                    setShowConfirm(false);
                                }}
                            >
                                Confirm
                            </button>

                            <button className="cancel-delete" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
