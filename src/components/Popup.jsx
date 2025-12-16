import "./Popup.css";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Popup({
    open,
    message,
    withCopy = false,
    copyText = "",
    onConfirm,
}) {
    const okButtonRef = useRef(null);

    useEffect(() => {
    if (open && okButtonRef.current) {
        okButtonRef.current.focus();
    }
  }, [open]);
  if (!open) return null;

  return createPortal (
    <div className="popup-overlay tampil">
      <div className="popup-box">
        <p className="popup-text">
          {typeof message === "string" ? (
            <span dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            message
          )}
        </p>
        
        <div className="popup-actions">
          {withCopy && copyText && (
            <button
                type="button"
                className="popup-btn popup-copy-btn"
                style={{ marginBottom: "10px" }}
                onClick={async (e) => {
                try {
                    await navigator.clipboard.writeText(copyText);
                    e.target.textContent = "Disalin!";
                    e.target.disabled = true;
                } catch {
                    e.target.textContent = "Gagal salin";
                }
                }}
            >
                Salin PIN
            </button>
            )}

            <button
            ref={okButtonRef}
            type="button"
            className="popup-btn"
            onClick={onConfirm} 
            >
            OK
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
