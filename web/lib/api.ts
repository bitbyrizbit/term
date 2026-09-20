const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchWithBypass(url: string, options: any = {}) {
  const headers = options.headers || {};
  headers['ngrok-skip-browser-warning'] = 'true';
  return fetch(url, { ...options, headers });
}


export interface Obligation {
  owner: string;
  action: string;
  condition_or_event: string | null;
  explicit_deadline_or_null: string | null;
  implicit_time_rule_or_null: string | null;
}

export interface Clause {
  id: string;
  contract_id: string;
  section_ref: string;
  text: string;
  extracted_data: {
    parties_mentioned: string[];
    clause_type: string;
    obligations: Obligation[];
    references_to_other_sections: string[];
  } | null;
}

export interface Contract {
  id: string;
  filename: string;
  status: string;
  clauses?: Clause[];
}

export async function uploadContract(file: File): Promise<Contract> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetchWithBypass(`${API_BASE}/contracts/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload contract");
  }

  return res.json();
}

export async function getContractStatus(id: string): Promise<Contract> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch contract");
  }
  return res.json();
}

export async function getContractGraph(id: string): Promise<{nodes: any[], edges: any[]}> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function getContractObligations(id: string): Promise<any> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/obligations`);
  if (!res.ok) throw new Error('Failed to fetch obligations');
  return res.json();
}


export async function simulateEvent(id: string, query: string): Promise<any> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to simulate event');
  return res.json();
}

export async function askQuestion(id: string, query: string): Promise<any> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to ask question');
  return res.json();
}


export async function computeVersionDiff(id: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/diff`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to compute diff');
  return res.json();
}

export async function getRiskRadar(id: string): Promise<any> {
  const res = await fetchWithBypass(`${API_BASE}/contracts/${id}/risk`);
  if (!res.ok) throw new Error('Failed to get risk radar');
  return res.json();
}


export async function getAllContracts(): Promise<any[]> {
  const res = await fetchWithBypass(`${API_BASE}/contracts`);
  if (!res.ok) throw new Error('Failed to fetch contracts');
  return res.json();
}

