
import { Text, Pressable, StyleSheet } from 'react-native';
import { useMyContext} from '../useContext/UseContext';

export default function Navbtn({ icon, label }) {
  const { activeNav, setActiveNav } = useMyContext();
  
  const handleOnClick = (label) => {
    setActiveNav(label);
  };

  const isActive = activeNav === label;
  
  return (
    <Pressable
      style={[
        styles.navButton, 
        isActive && styles.navButtonActive 
      ]}
      onPress={() => handleOnClick(label)}
    >
      {icon}
      
      <Text 
        style={[
          styles.labelText, 
          isActive ? styles.labelTextActive : styles.labelTextInactive
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  navButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2, 
    paddingHorizontal: 4,
    paddingVertical: 12, 
    marginTop: 4, 
  },
  
  navButtonActive: {
    backgroundColor: '#F2EDE9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    
  },

  labelText: {
    fontSize: 14, 
  },

  labelTextInactive: {
    color: '#4b5563', 
  },
  
  labelTextActive: {
    color: 'black',
  },
});