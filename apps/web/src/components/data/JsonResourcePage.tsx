import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { DashboardShell } from '../layout/DashboardShell';
import { apiGet, apiPost, apiPatch } from '../../lib/api-client';

type JsonResourcePageProps = {
  title: string;
  navItems: Array<{ label: string; to: string }>;
  endpoint: string;
  description?: string;
  postEndpoint?: string;
  patchEndpoint?: string;
  defaultPayload?: Record<string, unknown>;
};

export function JsonResourcePage({ title, navItems, endpoint, description, postEndpoint, patchEndpoint, defaultPayload = {} }: JsonResourcePageProps) {
  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2));
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['resource', endpoint], queryFn: () => apiGet<unknown>(endpoint), retry: false });
  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = payload ? JSON.parse(payload) : {};
      return patchEndpoint ? apiPatch(patchEndpoint, parsed) : apiPost(postEndpoint ?? endpoint, parsed);
    },
    onSuccess: async () => {
      setMessage('Saved.');
      await queryClient.invalidateQueries({ queryKey: ['resource', endpoint] });
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    mutation.mutate();
  }

  return (
    <DashboardShell title={title} navItems={navItems}>
      <div className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p> : null}
        </header>
        {(postEndpoint || patchEndpoint) ? (
          <form className="rounded-lg border border-[#ded4c4] bg-white/80 p-4 shadow-sm" onSubmit={submit}>
            <label className="text-sm font-medium text-slate-800">Payload JSON</label>
            <textarea className="mt-2 min-h-40 w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] p-3 font-mono text-sm text-slate-900 outline-none focus:border-[#8b6f2f]" onChange={(event) => setPayload(event.target.value)} value={payload} />
            <button className="mt-3 rounded-md bg-[#173b34] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" type="submit">
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
            {mutation.isError ? <p className="mt-3 text-sm text-red-700">{String(mutation.error.message)}</p> : null}
            {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          </form>
        ) : null}
        <section className="rounded-lg border border-[#ded4c4] bg-white/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-slate-950">API response</h3>
            <button className="rounded-md border border-[#cfc5b5] bg-white/70 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-white" onClick={() => query.refetch()} type="button">Refresh</button>
          </div>
          {query.isLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {query.isError ? <p className="text-sm text-red-700">{String(query.error.message)}</p> : null}
          {query.data !== undefined ? <pre className="max-h-[520px] overflow-auto rounded-md border border-[#e3d9c9] bg-[#fbfaf6] p-4 text-xs text-slate-800">{JSON.stringify(query.data, null, 2)}</pre> : null}
        </section>
      </div>
    </DashboardShell>
  );
}
