import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const NavbarContainer = styled.header`
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #4a6fa5;
  text-decoration: none;
  
  svg {
    margin-right: 12px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  padding: 5px 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: #4a6fa5;
    transform: scaleX(0);
    transform-origin: right center;
    transition: transform 0.3s ease;
  }
  
  &:hover::after,
  &.active::after {
    transform: scaleX(1);
    transform-origin: left center;
  }
  
  &.active {
    color: #4a6fa5;
    font-weight: 600;
  }
`;

const NavLinkButton = styled(Link)`
  background-color: #4a6fa5;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3a5a8f;
    transform: translateY(-2px);
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  
  svg {
    margin-left: 6px;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4a6fa5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  overflow: hidden;
  z-index: 10;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 10px;
    color: #4a6fa5;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 12px 16px;
  color: #d9534f;
  cursor: pointer;
  font-size: 16px;
  font-family: inherit;
  
  svg {
    margin-right: 10px;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #4a6fa5;
  padding: 5px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 99;
  padding: 20px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MobileNavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-size: 18px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  &.active {
    color: #4a6fa5;
    font-weight: 600;
  }
`;

const MobileCtaButton = styled(Link)`
  background-color: #4a6fa5;
  color: white;
  text-decoration: none;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  
  &:hover {
    background-color: #3a5a8f;
  }
`;

// Icons
const LogoIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    <line x1="6" y1="1" x2="6" y2="4"></line>
    <line x1="10" y1="1" x2="10" y2="4"></line>
    <line x1="14" y1="1" x2="14" y2="4"></line>
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const RecipeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const PreferencesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Animation variants
const dropdownVariants = {
  hidden: { 
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { 
      duration: 0.2 
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const mobileMenuVariants = {
  hidden: { 
    opacity: 0,
    x: "100%",
    transition: { 
      duration: 0.3 
    }
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Main component
const EnhancedNavigation = ({ isAuthenticated, user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-menu')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };
  
  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  return (
    <NavbarContainer>
      <NavInner>
        <Logo to="/">
          <LogoIcon />
          AI Chef
        </Logo>
        
        <NavLinks>
          <NavLink 
            to="/" 
            className={location.pathname === "/" ? "active" : ""}
          >
            Home
          </NavLink>
          <NavLink 
            to="/chat" 
            className={location.pathname === "/chat" ? "active" : ""}
          >
            Chef Assistant
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/recipes" 
                className={location.pathname === "/recipes" ? "active" : ""}
              >
                Saved Recipes
              </NavLink>
              <NavLink 
                to="/preferences" 
                className={location.pathname === "/preferences" ? "active" : ""}
              >
                Preferences
              </NavLink>
            </>
          ) : (
            <NavLinkButton to="/chat">Start Cooking</NavLinkButton>
          )}
        </NavLinks>
        
        {isAuthenticated ? (
          <UserMenu className="user-menu">
            <UserButton onClick={() => setDropdownOpen(!dropdownOpen)}>
  <UserAvatar>{getUserInitials()}</UserAvatar>
  {user && user.name ? user.name.split(" ")[0] : "User"}
  <ChevronIcon />
</UserButton>
            
            <AnimatePresence>
              {dropdownOpen && (
                <DropdownMenu
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                >
                  <DropdownItem to="/recipes">
                    <RecipeIcon />
                    Saved Recipes
                  </DropdownItem>
                  <DropdownItem to="/preferences">
                    <PreferencesIcon />
                    Preferences
                  </DropdownItem>
                  <DropdownButton onClick={handleLogout}>
                    <LogoutIcon />
                    Logout
                  </DropdownButton>
                </DropdownMenu>
              )}
            </AnimatePresence>
          </UserMenu>
        ) : (
          <div>
            <NavLink 
              to="/login" 
              className={location.pathname === "/login" ? "active" : ""}
              style={{ marginRight: '20px' }}
            >
              Login
            </NavLink>
            <NavLinkButton to="/register">Sign Up</NavLinkButton>
          </div>
        )}
        
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MobileMenuButton>
      </NavInner>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <MobileNavLinks>
              <MobileNavLink 
                to="/" 
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </MobileNavLink>
              <MobileNavLink 
                to="/chat" 
                className={location.pathname === "/chat" ? "active" : ""}
              >
                Chef Assistant
              </MobileNavLink>
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink 
                    to="/recipes" 
                    className={location.pathname === "/recipes" ? "active" : ""}
                  >
                    Saved Recipes
                  </MobileNavLink>
                  <MobileNavLink 
                    to="/preferences" 
                    className={location.pathname === "/preferences" ? "active" : ""}
                  >
                    Preferences
                  </MobileNavLink>
                  <MobileNavLink as="button" onClick={onLogout}>
                    Logout
                  </MobileNavLink>
                </>
              ) : (
                <>
                  <MobileNavLink 
                    to="/login" 
                    className={location.pathname === "/login" ? "active" : ""}
                  >
                    Login
                  </MobileNavLink>
                  <MobileNavLink 
                    to="/register" 
                    className={location.pathname === "/register" ? "active" : ""}
                  >
                    Sign Up
                  </MobileNavLink>
                  <MobileCtaButton to="/chat">
                    Start Cooking
                  </MobileCtaButton>
                </>
              )}
            </MobileNavLinks>
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

export default EnhancedNavigation;