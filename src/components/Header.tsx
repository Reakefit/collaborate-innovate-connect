
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, User, Home, Briefcase, MessageSquare, Search } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-background border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              S-S Connect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/projects" className="text-foreground hover:text-primary transition-colors">
                  Find Projects
                </Link>
                <Link to="/messages" className="text-foreground hover:text-primary transition-colors">
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </>
            )}
          </nav>

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === "startup" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/create-project")}
                      className="cursor-pointer"
                    >
                      Create Project
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate("/signin")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/signup")}>Sign Up</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-2 space-y-3 bg-background border-t">
            <Link
              to="/"
              className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Projects
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Messages
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Link>
                {user.role === "startup" && (
                  <Link
                    to="/create-project"
                    className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Project
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/how-it-works"
                  className="flex items-center py-2 text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => {
                      navigate("/signin");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
