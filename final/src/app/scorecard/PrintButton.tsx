'use client';
export default function PrintButton({ label = 'Print the scorecard' }: { label?: string }) {
  return <button className="sc-print" onClick={() => print()}>{label}</button>;
}
