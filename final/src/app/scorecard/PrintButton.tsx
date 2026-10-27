'use client';
export default function PrintButton() {
  return <button className="sc-print" onClick={() => print()}>Print the scorecard</button>;
}
