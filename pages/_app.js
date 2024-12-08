import "@/styles/globals.css";
import AppBar from "@/components/appbar";
import { Toaster } from "@/components/ui/toaster"


export default function App({ Component, pageProps }) {
  return <div>
    <AppBar />
    <Component {...pageProps} />
    <Toaster />
  </div>
  ;
}
