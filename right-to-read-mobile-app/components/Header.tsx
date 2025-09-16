import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PullBooksDialog from './PullBooksDialog';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPullBooksDialog, setShowPullBooksDialog] = useState(false);

  const handleMenuPress = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMenuItemPress = (item: string) => {
    console.log(`${item} pressed`);
    setShowDropdown(false);
    // Handle navigation based on item
    switch (item) {
      case 'Pull Books':
        setShowPullBooksDialog(true);
        break;
      case 'Profile':
        // Handle profile navigation
        break;
      case 'Logout':
        // Handle logout action
        break;
    }
  };

  const handlePullBooksSuccess = () => {
    // Refresh the books list or trigger a re-render
    console.log('Books pulled successfully!');
    // TODO: Add logic to refresh the books data
  };

  return (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/read_to_right_logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
        
        {showDropdown && (
          <Modal
            transparent={true}
            visible={showDropdown}
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.dropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleMenuItemPress('Pull Books')}
                >
                  <Text style={styles.dropdownText}>Pull Books</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleMenuItemPress('Profile')}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleMenuItemPress('Logout')}
                >
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
      
      {/* Pull Books Dialog */}
      <PullBooksDialog
        visible={showPullBooksDialog}
        onClose={() => setShowPullBooksDialog(false)}
        onSuccess={handlePullBooksSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 80,
    height: 80,
    marginLeft: 20,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 12,
    marginRight: 20,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 28,
    color: '#4A90E2',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
