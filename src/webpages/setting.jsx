import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, deleteAccount } from "../store/userSlice";

export default function Setting() {
    const dispatch = useDispatch();

    const passwordStatus = useSelector(state => state.user.passwordStatus);
    const passwordError = useSelector(state => state.user.passwordError);
    const deleteError = useSelector(state => state.user.deleteError);

    const [password, setPassword] = useState("");
    const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const validatePassword = () => password.length >= 6;

    return (
        <>
            <header className="settings-header">
                <h1>Settings</h1>
            </header>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (validatePassword()) setShowPasswordConfirm(true);
                }}
            >
                <div className="password-card">
                    <label>Password</label>
                </div>

                <div className="inputfield">
                    <input
                        className="inpfield"
                        type="password"
                        placeholder="Edit your password here"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="button-group">
                        <button type="submit" className="save-button">
                            Save
                        </button>

                        {passwordError && (
                            <div className="tooltip-wrapper">
                                <button
                                    type="button"
                                    className="error-hint-button"
                                    onClick={() =>
                                        setShowPasswordTooltip(!showPasswordTooltip)
                                    }
                                >
                                    ?
                                </button>

                                {showPasswordTooltip && (
                                    <div className="tooltip-box">{passwordError}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {passwordStatus && <p className="success-msg">{passwordStatus}</p>}
            </form>

            <div className="delete-section">
                <button
                    className="delete-button"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    Delete Account
                </button>
            </div>

            {showPasswordConfirm && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Confirm Password Change</h2>
                        <p>Are you sure you want to update your password?</p>

                        <div className="modal-actions">
                            <button
                                className="confirm-delete"
                                onClick={() => {
                                    dispatch(updatePassword(password));
                                    setShowPasswordConfirm(false);
                                }}
                            >
                                Confirm
                            </button>

                            <button
                                className="cancel-delete"
                                onClick={() => setShowPasswordConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Confirm Account Deletion</h2>
                        <p>This action cannot be undone.</p>

                        {deleteError && <p className="error-msg">{deleteError}</p>}

                        <div className="modal-actions">
                            <button
                                className="confirm-delete"
                                onClick={() => dispatch(deleteAccount())}
                            >
                                Yes, delete my account
                            </button>

                            <button
                                className="cancel-delete"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}