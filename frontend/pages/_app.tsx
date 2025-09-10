import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../styles/complete.css'
import '../styles/map.css'
import '../styles/map-enhanced.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
