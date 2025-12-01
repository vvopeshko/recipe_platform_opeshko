'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBarWrapper } from './SearchBarWrapper';
import { CategoryFilterWrapper } from './CategoryFilterWrapper';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-red-600">
              <ChefHat className="w-6 h-6" />
              <span>RecipeShare</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-red-600">
            <ChefHat className="w-6 h-6" />
            <span>RecipeShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 mx-8">
            <SearchBarWrapper />
            <CategoryFilterWrapper />
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/my-recipes">
                  <Button variant="ghost" size="sm">
                    My Recipes
                  </Button>
                </Link>
                <Link href="/recipes/new">
                  <Button variant="primary" size="sm">
                    Create Recipe
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              <SearchBarWrapper />
              <CategoryFilterWrapper />
              <div className="flex flex-col gap-2 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/my-recipes">
                      <Button variant="ghost" size="sm" className="w-full">
                        My Recipes
                      </Button>
                    </Link>
                    <Link href="/recipes/new">
                      <Button variant="primary" size="sm" className="w-full">
                        Create Recipe
                      </Button>
                    </Link>
                    <div className="px-2 py-1 text-sm text-gray-600">{user?.email}</div>
                    <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

