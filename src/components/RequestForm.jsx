import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../css/components/request-form.scss';

const RequestForm = ({ 
    initialValues, 
    validationSchema, 
    onSubmit, 
    formFields, 
    submitButtonText,
    showFileUpload = false,
    showSubmitButton = true,
}) => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileSizeError, setFileSizeError] = useState('');
    
    // Handle file selection with size validation
    const handleFileChange = (e, setFieldValue) => {
        const file = e.target.files[0];
        
        if (file) {
            // Check file size (300MB = 300 * 1024 * 1024 bytes)
            const maxSize = 300 * 1024 * 1024; // 300MB in bytes
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            
            if (file.size > maxSize) {
                setFileSizeError(`File size is too large (${fileSizeMB}MB). Maximum allowed size is 300MB.`);
                setSelectedFile(null);
                setFieldValue('projectDesign', null);
                // Clear the file input
                e.target.value = '';
                return;
            } else {
                setFileSizeError('');
                setSelectedFile(file);
                setFieldValue('projectDesign', file);
            }
        } else {
            setFileSizeError('');
            setSelectedFile(null);
            setFieldValue('projectDesign', null);
        }
    };

    // Handle form submission
    const handleFormSubmit = (values, formikBag) => {
        console.log('📝 RequestForm: handleFormSubmit called');
        console.log('📝 RequestForm: values received:', values);
        console.log('📝 RequestForm: selectedFile:', selectedFile);
        console.log('📝 RequestForm: fileSizeError:', fileSizeError);
        
        // Prevent submission if there's a file size error
        if (fileSizeError) {
            console.log('📝 RequestForm: Form submission blocked due to file size error');
            return;
        }
        
        if (selectedFile) {
            values.projectDesign = selectedFile;
        }
        
        console.log('📝 RequestForm: calling onSubmit with values:', values);
        onSubmit(values, formikBag);
        setSelectedFile(null);
        setFileSizeError('');
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
        >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form className="request-form">
                    {/* Dynamic Form Fields */}
                    {formFields.map((field, index) => (
                        <div key={index} className="form-group mb-3">
                            <div className="input-wrapper">
                                {field.icon && (
                                    <i className={`${field.icon} input-icon`}></i>
                                )}
                                {field.unitLabel && (
                                    <span className="unit-label">{field.unitLabel}</span>
                                )}
                                
                                {field.type === 'file' ? (
                                    <>
                                        <input 
                                            type="file"
                                            id={`file-upload-${index}`}
                                            onChange={(e) => handleFileChange(e, setFieldValue)}
                                            style={{ color: 'transparent' }}
                                            className={`form-control ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''} ${fileSizeError ? 'is-invalid' : ''}`}
                                        />
                                        {!selectedFile ? (
                                            <label htmlFor={`file-upload-${index}`} className="file-placeholder">
                                                {field.placeholder}
                                            </label>
                                        ) : (
                                            <div className="selected-file-info">
                                                <span className="file-name">{selectedFile.name}</span>
                                                <span className="file-size">({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)</span>
                                            </div>
                                        )}
                                        {/* File size error display */}
                                        {fileSizeError && (
                                            <div className="file-size-error">
                                                <i className="fas fa-exclamation-triangle"></i>
                                                {fileSizeError}
                                            </div>
                                        )}
                                    </>
                                ) : field.type === 'textarea' ? (
                                    <Field
                                        as="textarea"
                                        name={field.name}
                                        className={`form-control description-textarea ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
                                        placeholder={field.placeholder}
                                        rows={field.rows || 4}
                                    />
                                ) : field.type === 'date' ? (
                                    <>
                                        <i 
                                            className="fas fa-calendar input-icon" 
                                            onClick={() => {
                                                const dateInput = document.getElementById(`date-input-${index}`);
                                                dateInput.focus();
                                                if (typeof dateInput.showPicker === 'function') {
                                                    dateInput.showPicker();
                                                } else {
                                                    dateInput.click();
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        ></i>
                                        <Field
                                            type="date" 
                                            id={`date-input-${index}`}
                                            name={field.name}
                                            className={`form-control ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
                                            placeholder={field.placeholder}
                                        />
                                    </>
                                ) : field.type === 'select' ? (
                                    <Field
                                        as="select"
                                        name={field.name}
                                        className={`form-control ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
                                    >
                                        <option value="">{field.placeholder}</option>
                                        {field.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Field>
                                ) : (
                                    <Field
                                        type={field.type || 'text'} 
                                        name={field.name}
                                        className={`form-control ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
                                        placeholder={field.placeholder}
                                        onChange={(e) => {
                                            setFieldValue(field.name, e.target.value);
                                            if (field.onChange) {
                                                field.onChange(e.target.value, setFieldValue);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                            <ErrorMessage name={field.name} component="div" className="error-message" />
                        </div>
                    ))}

                    {/* Submit Button */}
                    {showSubmitButton && (
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn btn w-100"
                                disabled={isSubmitting || fileSizeError}
                                onClick={() => {
                                    console.log('🔘 Submit button clicked');
                                    console.log('🔘 Form values at click:', values);
                                    console.log('🔘 Form errors:', errors);
                                    console.log('🔘 Form touched:', touched);
                                    console.log('🔘 File size error:', fileSizeError);
                                }}
                            >
                                {isSubmitting ? t('common.sending') : submitButtonText}
                            </button>
                        </div>
                    )}
                </Form>
            )}
        </Formik>
    );
};

export default RequestForm;