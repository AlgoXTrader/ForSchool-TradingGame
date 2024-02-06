import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Button, Alert } from 'react-native';
import { NavigationContainer , useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack/';
import { LineChart } from 'react-native-chart-kit';


const Stack = createStackNavigator();


const FirstScreen = ({ navigation }) => {
  const [selectedValue, setSelectedValue] = useState('Leverage');
  const [subValue, setSubValue] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [balance, setBalance] = useState('');
  const [spread, setSpread] = useState('');
  const [commission, setCommission] = useState('');

  const handlePress = () => {
    navigation.navigate('Chart', {
      selectedValue: selectedValue,
      balance: balance,
      spread: spread,
      commission: commission,
    });
  };

  

  const [symbol, setSymbol] = useState('Symbol');
  const [symbolVisible, setSymbolVisible] = useState(false);

  const handleOptionPress = (value) => {
    setSelectedValue(value);
    setSubValue(value);
    setOptionsVisible(false);
  };

  const handleSymbolPress = (symbolValue) => {
    setSymbol(symbolValue);
    setSymbolVisible(false);
  };

  const handleBalanceChange = (numeric) => {
    setBalance(numeric);
  };

  const handleSpreadChange = (numeric) => {
    setSpread(numeric);
  };

  const handleCommissionChange = (numeric) => {
    setCommission(numeric);
  };



  return (
    <View style={styles.container}>
      <Image source={require('./assets/tradepic.png')} style={styles.logo} />
      <Text style={styles.title}>TRADING GAME</Text>
      <View style={styles.center}>
        <Text style={styles.selectedValue}>{selectedValue}</Text>
        <TouchableOpacity onPress={() => setOptionsVisible(!optionsVisible)} style={styles.button}>
          <Text style={styles.buttonText}>Select</Text>
        </TouchableOpacity>
        {optionsVisible && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={() => handleOptionPress('30x')} style={styles.optionButton}>
              <Text style={styles.optionText}>30</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleOptionPress('100x')} style={styles.optionButton}>
              <Text style={styles.optionText}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleOptionPress('200x')} style={styles.optionButton}>
              <Text style={styles.optionText}>200</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleOptionPress('500x')} style={styles.optionButton}>
              <Text style={styles.optionText}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleOptionPress('1000x')} style={styles.optionButton}>
              <Text style={styles.optionText}>1000</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.symbolContainer}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <TouchableOpacity onPress={() => setSymbolVisible(!symbolVisible)} style={styles.button}>
            <Text style={styles.buttonText}>Symbol</Text>
          </TouchableOpacity>
          {symbolVisible && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity onPress={() => handleSymbolPress('EURUSD')} style={styles.optionButton}>
                <Text style={styles.optionText}>EURUSD</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSymbolPress('USDJPY')} style={styles.optionButton}>
                <Text style={styles.optionText}>USDJPY</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <TextInput
              style={styles.balanceInput}
              keyboardType="numeric"
              value={balance}
              onChangeText={handleBalanceChange}
            />
          </View>

          <View style={styles.spreadContainer}>
            <Text style={styles.spreadLabel}>Spread (pip)</Text>
            <TextInput
              style={styles.spreadInput}
              keyboardType="numeric"
              value={spread}
              onChangeText={handleSpreadChange}
            />
          </View>

          <View style={styles.commissionContainer}>
            <Text style={styles.commissionLabel}>Commission (pip)</Text>
            <TextInput
              style={styles.commissionInput}
              keyboardType="numeric"
              value={commission}
              onChangeText={handleCommissionChange}
            />
          </View>

        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity onPress={handlePress} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChartScreen = ({ route }) => {

  const { selectedValue, balance, spread, commission } = route.params;
  const [numbers, setNumbers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [latestNumber, setLatestNumber] = useState(null);
  const [direction, setDirection] = useState('');
  const [change, setChange] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [prevNumber, setPrevNumber] = useState(null);
  const [balanceValue, setBalanceValue] = useState(0);
  const [initialBalance, setInitialBalance] = useState(null);

  let intervalRef = null;

  useEffect(() => {


    if (isRunning) {  

      intervalRef = setInterval(() => {
        const newNumber = (Math.random() * (1.0923 - 1.0881) + 1.0881).toFixed(4);
        setLatestNumber(parseFloat(newNumber));
        setNumbers(prevNumbers => {
          const updatedNumbers = [...prevNumbers, parseFloat(newNumber)];
          
          if (updatedNumbers.length > 10) {
            return updatedNumbers.slice(-10);
          } else {
            return updatedNumbers;
          }
        });
  
        if (prevNumber !== null && (direction === 'Long' || direction === 'Short')) {
          const changePercent = ((parseFloat(newNumber) - parseFloat(prevNumber)) / parseFloat(prevNumber) * 100).toFixed(2);
          setChange(changePercent);
        }
        setPrevNumber(parseFloat(newNumber));
  
        const leverage = parseFloat(selectedValue);
        const pip = parseFloat(spread);
        const comm = parseFloat(commission);
        const totalCostValue = leverage * parseFloat(balance) * (pip + comm) * 0.0001;
        setTotalCost(totalCostValue);
  
        let pnlValue = 0;
        if (direction === 'Long') {
          pnlValue = (parseFloat(balance) * leverage) * (parseFloat(newNumber) - initialBalance);
        } else if (direction === 'Short') {
          pnlValue = (parseFloat(balance) * leverage) * -(parseFloat(newNumber) - initialBalance);
        }
        setPnl(pnlValue);
  
        const balanceValue = parseFloat(balance) - totalCostValue + pnlValue;
        setBalanceValue(balanceValue);
      }, 1000);
  
      return () => clearInterval(intervalRef);
    }
  }, [isRunning, prevNumber]);
    
  const toggleRunning = () => {
    setIsRunning(prevIsRunning => !prevIsRunning);
  };

  const handleLongPress = () => {
    setDirection('Long');
    if (initialBalance === null) {
      setInitialBalance(parseFloat(latestNumber));
      setBalance(parseFloat(latestNumber));
    }
  };

  const handleShortPress = () => {
    setDirection('Short');    if (initialBalance === null) {
      setInitialBalance(parseFloat(latestNumber));
      setBalance(parseFloat(latestNumber));
    }

  };


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: '#111' }}>
      <LineChart
        data={{
          labels: Array.from({ length: numbers.length }, (_, i) => String(i)),
          datasets: [{ data: numbers }],
        }}
        width={380}
        height={520}
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#111',
          backgroundGradientFrom: '#111',
          backgroundGradientTo: '#111',
          decimalPlaces: 4,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View style={styles.tableContainer}>
        <Text style={styles.tableRow}>Direction    : {direction}</Text>
        <Text style={styles.tableRow}>Change      : {change}%</Text>
        <Text style={styles.tableRow}>Total Cost  : {totalCost}</Text>
        <Text style={styles.tableRow}>PnL            : {pnl.toFixed(2)}</Text>
        <Text style={styles.tableRow}>Balance     : {balanceValue.toFixed(2)}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Long" onPress={handleLongPress} />
        <Button title={isRunning ? 'Stop' : 'Start'} onPress={toggleRunning} />
        <Button title="Short" onPress={handleShortPress} />
      </View>
    </View>
  );
};



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{
          headerStyle: { backgroundColor: '#111' },
          headerTintColor: '#111', 
          headerTitleStyle: { color: '#111' }, 
          headerShown: false, 
        }}
      >
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="Chart" component={ChartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300, 
    height: 200,
    alignSelf: 'flex-start',
    top: 20 
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'darkred',
    left: 20
    
  },
  bottom: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  selectedValue: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 1,
    
  },
  button: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginVertical: 1,
    
  },
  buttonText: {
    color: '#fff',
    alignSelf:'flex-start',
    flexDirection: 'column',
    
  },
  optionsContainer: {
    
    marginTop: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    
  },
  optionButton: {
    padding: 5,
    backgroundColor: '#444',
    borderRadius: 5,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  optionText: {
    color: '#fff',
  },
  continueButton: {
    paddingVertical: 15,
    paddingHorizontal: 60,
    backgroundColor: '#FFD700',
    borderRadius: 10,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 20,
  },
  symbolContainer: { //sembol butonu yanındaki yazı
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 50
  },
  symbolText: {
    color: '#fff',
    marginRight: 10,
  },
  balanceContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    marginRight: 10,
  },
  balanceInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 3,
    borderRadius: 5,
    width: 50,
  },

  spreadContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spreadLabel: {
    color: '#fff',
    marginRight: 10,
  },
  spreadInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 3,
    borderRadius: 5,
    width: 50,
  },

  commissionContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commissionLabel: {
    color: '#fff',
    marginRight: 10,
  },
  commissionInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 3,
    borderRadius: 5,
    width: 50,
  },

  candleChartContainer: {
    flex: 2,
    backgroundColor: '#ccc', 
  },
  bottomContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0', 
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc', 
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', 

  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    
  },
  buttonWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonTextt: {
    color: 'white',
    fontWeight: 'bold',
  },

  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'white',
    padding: 8,
    width: '80%',
  },
  tableRow: {
    marginBottom: 8,
    color: '#fff',

  },




});

export default App;
