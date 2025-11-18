import { useEffect, useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('TestPage: Fetching directly from http://localhost:3000/api/menu');
    
    // Use fetch instead of axios to debug
    fetch('http://localhost:3000/api/menu', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        console.log('TestPage: Response status:', response.status);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('TestPage: Response data:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('TestPage: Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>Total items: {data.data?.length || 0}</p>
      {data.data && data.data.map(item => (
        <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{item.name}</h3>
          <img src={item.image} alt={item.name} style={{ width: '100px', maxHeight: '100px', objectFit: 'cover' }} />
          <p>Price: {item.price}</p>
        </div>
      ))}
    </div>
  );
}
