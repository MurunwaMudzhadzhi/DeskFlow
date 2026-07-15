/**
 * components/TicketForm.jsx
 * -----------------------------------------------------------------------
 * Ticket creation form used on the Employee Dashboard. Performs
 * client-side validation (required fields + minimum lengths) that
 * mirrors the backend's express-validator rules, then delegates the
 * actual submission to the onSubmit prop.
 * -----------------------------------------------------------------------
 */

import { useState } from 'react';
import styles from '../styles/TicketForm.module.css';

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const initialState = { title: '', description: '', priority: 'Low', category: 'Other' };

export default function TicketForm({ onSubmit, submitting = false }) {
  const [form, setForm] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = 'Title is required.';
    } else if (form.title.trim().length < 5) {
      errors.title = 'Title needs at least 5 characters.';
    }

    if (!form.description.trim()) {
      errors.description = 'Description is required.';
    } else if (form.description.trim().length < 10) {
      errors.description = 'Description needs at least 10 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await onSubmit(form);
    if (ok) {
      setForm(initialState);
      setFieldErrors({});
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          className={`${styles.input} ${fieldErrors.title ? styles.inputError : ''}`}
          placeholder="e.g. Laptop will not power on"
          value={form.title}
          onChange={handleChange('title')}
          maxLength={120}
        />
        {fieldErrors.title && <span className={styles.error}>{fieldErrors.title}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          className={`${styles.textarea} ${fieldErrors.description ? styles.inputError : ''}`}
          placeholder="Describe what's happening, what you've already tried, and any error messages."
          rows={4}
          value={form.description}
          onChange={handleChange('description')}
          maxLength={2000}
        />
        {fieldErrors.description && <span className={styles.error}>{fieldErrors.description}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="priority" className={styles.label}>
            Priority
          </label>
          <select id="priority" className={styles.select} value={form.priority} onChange={handleChange('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select id="category" className={styles.select} value={form.category} onChange={handleChange('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Filing ticket…' : 'File ticket'}
      </button>
    </form>
  );
}
