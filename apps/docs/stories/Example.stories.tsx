// Simple example component
const Example = ({ label }: { label: string }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded">{label}</button>
);

const meta: any = {
  title: 'Example/Button',
  component: Example,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = any;

export const Primary: Story = {
  args: {
    label: 'Button',
  },
};