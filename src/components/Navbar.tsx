"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
}

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Favorite", href: "/favorite", icon: FavoriteIcon },
    { label: "Profile", href: "/profile", icon: PersonIcon },
    { label: "About", href: "/about", icon: InfoIcon },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const closeDrawer = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  const drawerContent = (
    <Box onClick={closeDrawer} sx={{ p: 2, width: 240 }}>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: "bold" }}>
        My App
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: `${theme.palette.primary.main}10`,
                },
              }}
            >
              <item.icon sx={{ mr: 2 }} />
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          showLabels
          value={pathname}
          sx={{ position: "fixed", bottom: 0, width: "100%", zIndex: 1200 }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={<item.icon />}
              value={item.href}
              onClick={() => {
                closeDrawer();
                router.push(item.href);
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </>
  );
};

export default Navbar;
