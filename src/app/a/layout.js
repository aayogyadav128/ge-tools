import SidebarMenu from '../components/sidebar';
import "../globals.css"

export default function Layout({ children }) {
  return (
    <div className="flex" style={{background:'black'}}>
      <SidebarMenu />
      <main className="flex-1">{children}</main>
    </div>
  );
}