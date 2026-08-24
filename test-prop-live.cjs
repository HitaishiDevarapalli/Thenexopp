fetch('https://thenexopp.com/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Property API Fix',
    category: 'Flats',
    status: 'Buy',
    city: 'Hyderabad',
    state: 'Telangana',
    price: 1000,
    priceDisplay: '1000',
    description: 'Test description',
    published: false,
    areaSqFt: '1000',
    propertyType: 'Residential',
    ownershipType: 'Freehold',
    furnishing: 'Unfurnished'
  })
})
.then(res => res.json().then(body => ({ status: res.status, body })))
.then(data => console.log('Response:', data))
.catch(err => console.error('Fetch error:', err));
