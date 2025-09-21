import * as React from 'react';
import { Input, Label, TextArea, Select, Field } from '../../../apps/web/src/design-system/components/Form';

export default {
  title: 'Design System/Components/Forms',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form components including inputs, textareas, selects, and form field wrapper.',
      },
    },
  },
  tags: ['autodocs'],
};

// Basic Input
export const BasicInput = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label htmlFor="basic-input">Email Address</Label>
      <Input id="basic-input" type="email" placeholder="Enter your email" />
    </div>
  ),
};

// Input with validation states
export const InputStates = {
  render: () => (
    <div className="w-80 space-y-4">
      <Field label="Valid Input" error="">
        <Input placeholder="This input is valid" className="border-green-300 focus:border-green-500" />
      </Field>

      <Field label="Input with Error" error="This field is required">
        <Input placeholder="This input has an error" />
      </Field>

      <Field label="Disabled Input" error="">
        <Input placeholder="This input is disabled" disabled />
      </Field>
    </div>
  ),
};

// TextArea
export const TextAreaExample = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label htmlFor="message">Message</Label>
      <TextArea
        id="message"
        placeholder="Enter your message here..."
        rows={4}
      />
    </div>
  ),
};

// Select
export const SelectExample = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select
        id="country"
        placeholder="Select a country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'au', label: 'Australia' },
        ]}
      />
    </div>
  ),
};

// Complete Form Example
export const CompleteForm = {
  render: () => (
    <form className="w-96 space-y-6 p-6 bg-white rounded-lg border">
      <div>
        <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
      </div>

      <Field label="Full Name" error="">
        <Input placeholder="John Doe" />
      </Field>

      <Field label="Email Address" error="">
        <Input type="email" placeholder="john@example.com" />
      </Field>

      <Field label="Phone Number" error="">
        <Input type="tel" placeholder="+1 (555) 123-4567" />
      </Field>

      <Field label="Subject" error="">
        <Select
          placeholder="Select a subject"
          options={[
            { value: 'general', label: 'General Inquiry' },
            { value: 'support', label: 'Support' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </Field>

      <Field label="Message" error="">
        <TextArea
          placeholder="Tell us how we can help you..."
          rows={4}
        />
      </Field>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-klynaa-primary text-white py-2 px-4 rounded-lg hover:bg-klynaa-darkgreen transition-colors"
        >
          Send Message
        </button>
        <button
          type="reset"
          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  ),
  parameters: {
    layout: 'centered',
  },
};