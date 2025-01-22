import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAuth, UserModel } from '../auth';
import { useIntl } from 'react-intl';
import Swal from 'sweetalert2';
import { uploadPayment } from '../auth/core/_requests';
import "../../../styles/paymentUpload.css";

const PaymentUpload = () => {
    const { currentUser, setCurrentUser } = useAuth();
    if (!currentUser) {
        throw new Error('Current user is undefined');
    }
    const intl = useIntl();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isFileUploaded, setIsFileUploaded] = useState(!!currentUser?.paymentReceiptPath);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            try {
                setIsUploading(true);
                let result = await uploadPayment(file, currentUser.id);
                setCurrentUser({
                    ...(currentUser as UserModel),
                    paymentReceiptPath: result.filePath,
                });

                Swal.fire({
                    icon: 'success',
                    title: intl.formatMessage({ id: 'UPLOAD_SUCCESS_TITLE' }),
                    text: intl.formatMessage({ id: 'UPLOAD_SUCCESS_TEXT' }),
                });
                setIsFileUploaded(true);
                setIsUploading(false);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: intl.formatMessage({ id: 'UPLOAD_ERROR_TITLE' }),
                    text: intl.formatMessage({ id: 'UPLOAD_ERROR_TEXT' }),
                });
                setIsUploading(false);
            }
        }
    };

    const filePreview = () => {
        if (!currentUser.paymentReceiptPath) return null;

        const fileUrl = `${process.env.REACT_APP_API_URL}${currentUser.paymentReceiptPath}`;
        const fileExtension = currentUser.paymentReceiptPath.split('.').pop()?.toLowerCase();

        if (fileExtension && ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return (
                <img
                    src={fileUrl}
                    alt="Uploaded Preview"
                    className="img-thumbnail-preview"
                    onClick={() => setShowModal(true)} // Fotoğraf modal'ını aç
                />
            );
        }

        let iconClass = 'fas fa-file-alt'; // Varsayılan ikon
        let bgColor = '#e0e0e0'; // Varsayılan arka plan
        let iconColor = '#555'; // Varsayılan ikon rengi
        let label = 'File';

        if (fileExtension === 'pdf') {
            iconClass = 'fas fa-file-pdf';
            bgColor = '#ffccd5';
            iconColor = '#d9534f';
            label = 'PDF';
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
            iconClass = 'fas fa-file-word';
            bgColor = '#cce5ff';
            iconColor = '#007bff';
            label = 'Word';
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            iconClass = 'fas fa-file-excel';
            bgColor = '#d4edda';
            iconColor = '#28a745';
            label = 'Excel';
        } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
            iconClass = 'fas fa-file-powerpoint';
            bgColor = '#ffe5b4';
            iconColor = '#f0ad4e';
            label = 'PowerPoint';
        }

        return (
            <div
                className="file-icon-container"
                style={{
                    width: '150px',
                    height: '150px',
                    backgroundColor: bgColor,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease',
                }}
                onClick={handleSave} // İndirme işlemini tetikler
            >
                <i className={`${iconClass} fa-4x`} style={{color: iconColor}}></i>
                <span style={{marginTop: '10px', color: '#555', fontWeight: 'bold'}}>{label}</span>
            </div>

        );
    };


    const handleSave = async () => {
        try {
            const fileUrl = `${process.env.REACT_APP_API_URL}${currentUser.paymentReceiptPath}`;
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Failed to fetch the file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const fileExtension = currentUser.paymentReceiptPath.split('.').pop();

            const fileName = `${currentUser.name}_${currentUser.surname}_payment-receipt.${fileExtension}`;

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error during file download:", error);
        }
    };





    return (
        <div className="mt-5">
            <div className="d-flex align-items-center gap-4">
                {isFileUploaded && currentUser.paymentReceiptPath && filePreview()}
                {!isUploading && (
                    <label htmlFor="file-upload" className="btn btn-primary">
                        <FormattedMessage id="UPLOAD_PAYMENT_RECEIPT" />
                    </label>
                )}
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
            {isUploading && (
                <div className="mt-3 text-gray-700">
                    <FormattedMessage id="UPLOAD_IN_PROGRESS" />
                </div>
            )}

            {/* Modal for full image preview */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()} // Modal dışına tıklanınca kapanmasını engeller
                    >
                        <img
                            src={`${process.env.REACT_APP_API_URL}${currentUser.paymentReceiptPath}`}
                            alt="Preview"
                            className="modal-image"
                        />
                        <button
                            className="modal-save-btn"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentUpload;
