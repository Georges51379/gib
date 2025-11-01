import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  Home,
  User,
  GraduationCap,
  Folder,
  Lightbulb,
  Mail,
  LogOut,
  Menu,
  DollarSign,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout, session } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/settings', icon: Settings, label: 'Site Settings' },
    { to: '/admin/hero', icon: Home, label: 'Hero Section' },
    { to: '/admin/about', icon: User, label: 'About Section' },
    { to: '/admin/education', icon: GraduationCap, label: 'Education' },
    { to: '/admin/projects', icon: Folder, label: 'Projects' },
    { to: '/admin/pricing', icon: DollarSign, label: 'Pricing Plans' },
    { to: '/admin/future', icon: Lightbulb, label: 'Future Projects' },
    { to: '/admin/contact', icon: Mail, label: 'Contact Messages' },
  ];

  const Sidebar = () => (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
