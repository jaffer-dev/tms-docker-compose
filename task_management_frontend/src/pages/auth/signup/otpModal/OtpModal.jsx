import React, { useRef, useEffect, useState } from 'react';
import { Modal, Button, Typography, Input, Form as AntForm } from 'antd';
import { Formik } from 'formik';
import { validationSchema } from './Validation';
import "./OtpModal.css";
import { CInput } from '../../../../uiComponents';

const { Title } = Typography;

const OtpModal = ({
  open,
  onCancel,
  onVerify,
  isVerifying,
  otp,
  setOtp,
  email,
  handleResendOTP
}) => {
  const [form] = AntForm.useForm();
  const formikRef = useRef();
  const [timeLeft, setTimeLeft] = useState(60);

  const handleCancel = () => {
    formikRef.current?.resetForm();
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (open) {
      formikRef.current?.resetForm();
      form.resetFields();
      setTimeLeft(60);
    }
  }, [open, form]);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const onResendClick = async () => {
    if (handleResendOTP) {
      await handleResendOTP();
      setTimeLeft(60);
    }
  };


  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={450}
      destroyOnClose
      forceRender
    >
      <div className="verify-otp-container">
        <div className="otpModal-card">
          <Title level={4}>OTP Verification</Title>
          <p className="otp-instructions">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>

          <Formik
            innerRef={formikRef}
            initialValues={{ otp: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              onVerify(values.otp);
            }}
            enableReinitialize
          >
            {({ values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue, submitCount }) => (
              <AntForm layout="vertical" onFinish={handleSubmit} form={form}>

                <CInput
                  name="otp"
                  value={values.otp}
                  maxLength={6}
                  autoFocus
                  inputMode="numeric"
                  placeHolder="Enter 6-digit OTP"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange(e);
                    setOtp?.(value);
                    setFieldValue('otp', value);
                  }}
                  onBlur={handleBlur}
                  error={submitCount ? errors.otp : touched.otp && errors.otp}
                />

                <Button
                  htmlType="submit"
                  block
                  type="default"
                  className="auth-btn auth-btn-primary"
                  loading={isVerifying}
                >
                  Verify OTP
                </Button>
                <Button
                  htmlType="button"
                  block
                  className="auth-btn auth-btn-dark"
                  onClick={onResendClick}
                >
                  Resend OTP {timeLeft > 0 && `(${formatTime(timeLeft)})`}
                </Button>
              </AntForm>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  );
};

export default OtpModal;