import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Server, XCircle } from 'lucide-react';
import { apiGet } from '../../lib/api-client';

type HealthResponse = {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
};

export function HealthPanel() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: () => apiGet<HealthResponse>('/health')
  });

  const isHealthy = query.data?.status === 'ok';

  return (
    <section className="rounded-lg border border-[#ded4c4] bg-white/85 p-5 shadow-xl shadow-[#b9aa8f]/20">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">System status</h3>
          <p className="text-sm text-slate-500">Frontend to backend connectivity</p>
        </div>
        <Server className="text-[#8b6f2f]" size={22} />
      </div>

      {query.isLoading ? (
        <div className="rounded-md bg-[#f4efe6] p-4 text-sm text-slate-600">Checking API health...</div>
      ) : query.isError ? (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <XCircle className="mt-0.5 text-red-600" size={18} />
          <div>
            <p className="text-sm font-medium text-red-900">API is not reachable</p>
            <p className="mt-1 text-sm text-red-700">Start the backend at port 4000 and try again.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 text-emerald-700" size={18} />
          <div>
            <p className="text-sm font-medium text-emerald-950">API is healthy</p>
            <p className="mt-1 text-sm text-emerald-700">
              {isHealthy ? query.data?.service : 'Unexpected response'} at {query.data?.timestamp}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
