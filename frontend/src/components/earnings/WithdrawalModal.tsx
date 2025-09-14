/**
 * WithdrawalModal Component
 * Modal for requesting withdrawals with form validation
 */

import React, { useState } from 'react';
import Button from '../../components/buttons/Button';
import Input from '../../components/forms/Input';
import styles from './WithdrawalModal.module.css';
import type { WithdrawalRequest, PaymentMethod } from '../../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: WithdrawalRequest) => Promise<boolean>;
  availableBalance: number;
  loading?: boolean;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableBalance,
  loading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('orange_money');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount < 10000) {
      newErrors.amount = 'Minimum withdrawal amount is 10,000 XAF';
    } else if (numAmount > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    // Phone validation for mobile money methods
    if ((method === 'orange_money' || method === 'mtn_momo') && !phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone && !/^(\+237)?[6-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Cameroonian phone number';
    }

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const request: WithdrawalRequest = {
      amount: parseFloat(amount),
      method,
      details: {
        phone: phone.trim(),
        name: name.trim(),
      },
    };

    const success = await onSubmit(request);

    if (success) {
      // Reset form and close modal
      setAmount('');
      setPhone('');
      setName('');
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setPhone('');
      setName('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Request Withdrawal</h3>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={loading}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.balanceInfo}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <p className={styles.balanceAmount}>{formatAmount(availableBalance)}</p>
          </div>

          <div className={styles.formGroup}>
            <Input
              label="Withdrawal Amount (XAF)"
              type="number"
              value={amount}
              onChange={(value) => setAmount(value)}
              placeholder="Enter amount"
              error={errors.amount}
              disabled={loading}
              required
            />
            <p className={styles.helperText}>
              Minimum: 10,000 XAF
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className={styles.select}
              disabled={loading}
              required
            >
              <option value="orange_money">Orange Money</option>
              <option value="mtn_momo">MTN Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {(method === 'orange_money' || method === 'mtn_momo') && (
            <div className={styles.formGroup}>
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(value) => setPhone(value)}
                placeholder="+237 6XX XXX XXX"
                error={errors.phone}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <Input
              label="Account Holder Name"
              type="text"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Full name as registered"
              error={errors.name}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.processingInfo}>
            <p className={styles.processingText}>
              Processing time: 24-48 hours<br />
              You will receive an SMS confirmation once processed.
            </p>
          </div>

          <div className={styles.modalFooter}>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;