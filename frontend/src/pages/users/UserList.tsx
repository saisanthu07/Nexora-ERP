import { useState, FormEvent, ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listUsers, createUser } from '../../api/auth.api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/FormControls';
import { Role, User } from '../../types';

export function UserList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES' as Role });
  const [submitting, setSubmitting] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => listUsers(),
  });

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser(form);
      toast.success('User account created');
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'SALES' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User & Employee Directory</h2>
          <p>Manage system accounts, employee credentials, and RBAC roles.</p>
        </div>
        <Button variant="brass" onClick={() => setIsModalOpen(true)}>
          + Create Employee User
        </Button>
      </div>

      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="role-tag">{u.role}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="ledger-empty">
                  No employee accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal title="Create Employee User" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Full Name">
              <Input
                required
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </Field>

            <Field label="Email Address">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
            </Field>

            <Field label="Password">
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
              />
            </Field>

            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({ ...form, role: e.target.value as Role })}
              >
                <option value="ADMIN">Admin</option>
                <option value="SALES">Sales</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="ACCOUNTS">Accounts</option>
              </Select>
            </Field>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
