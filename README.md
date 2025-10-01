# POS Systems - Offline-First Mobile/Web Applications

A lightweight, offline-first Point of Sale system built with React for food trucks and mobile vendors.

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

## Features

### Core POS Functionality
- **Product Catalog**: Search, filter by category, virtual scrolling for 1000+ products
- **Order Customization**: Size options, add-ons, special requests
- **Cart Management**: Real-time updates, quantity controls, live totals
- **Order Queue**: Status tracking (pending → preparing → ready → completed)
- **Print System**: Receipt and kitchen order printing with retry logic

### Offline-First Architecture
- **Complete Offline Operation**: Works without internet connectivity
- **IndexedDB Storage**: Transaction support with rollback capability
- **Data Synchronization**: Automatic sync when connectivity returns
- **Conflict Resolution**: Last-write-wins with timestamps
- **Event Sourcing**: Timestamps and device IDs for data integrity

### Performance Optimizations
- **Bundle Size**: <200KB total (optimized for 2GB RAM devices)
- **Cart Operations**: Sub-100ms response time with optimistic updates
- **Virtual Scrolling**: Efficient rendering of large product catalogs
- **Memory Management**: Object pooling and LRU caching
- **Web Workers**: Background sync without UI blocking
- **Debounced Search**: 300ms delay for better performance
- **Lazy Loading**: Components load on demand

### Multi-Device Coordination
- **Real-time Updates**: Order status sync between devices
- **Device Discovery**: Auto-pairing and network scanning
- **Print Queue Management**: Priority-based job processing
- **Heartbeat Monitoring**: Device connection status

### Data Management
- **Compound Indexes**: Efficient querying (category+price, name+availability)
- **Data Compression**: Storage optimization with simple encoding
- **Storage Monitoring**: Alerts when approaching limits
- **Data Pruning**: Automatic cleanup of orders older than 30 days
- **ESC/POS Commands**: Thermal printer support with templates

### User Experience
- **Responsive Design**: Optimized for tablets and mobile devices
- **Touch Interface**: Finger-friendly controls
- **Keyboard Shortcuts**: Ctrl+Enter (submit), Escape (clear cart)
- **Visual Status**: Online/offline indicators
- **Error Handling**: Graceful failure with retry logic

## Testing the Application

### Demo Features
- Add products to cart (quick add or customize)
- Search and filter products by category
- Submit orders and view order history
- Test offline functionality

### Testing Offline Mode
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Continue using the app - it works offline
5. Orders sync when you go back online

## Technical Architecture

### Core Components
- **OfflineDataStore**: IndexedDB with sync queue and compression
- **PrintJobManager**: ESC/POS command generation with retry logic
- **SyncEngine**: Bidirectional sync with conflict resolution
- **DeviceManager**: Multi-device coordination and discovery
- **StorageMonitor**: Usage alerts and automatic pruning

### Performance Targets Met
- Bundle size: <200KB
- Cart operations: <100ms
- Works completely offline
- Handles 1000+ product catalogs
- Optimized for constrained hardware

## Browser Support

- Chrome/Edge 88+
- Firefox 84+
- Safari 14+
- Mobile browsers with IndexedDB support

## Troubleshooting

If you encounter issues:
1. Clear browser cache
2. Delete `node_modules` and run `npm install` again
3. Check browser console for errors
4. Ensure IndexedDB is supported in your browser