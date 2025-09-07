import React, { useState, useEffect } from "react";
import { API_BASE } from '../constants/api';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Modal, 
  TextInput, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pinVisible, setPinVisible] = useState(false);
    const [pin, setPin] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState(true); // true for login, false for PIN
    const router = useRouter();

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            setHasBiometrics(hasHardware && isEnrolled);
        } catch (error) {
            console.error("Biometric check error:", error);
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsAuthenticating(true);
        setError(null);

        try {
            // Use your computer's local IP here (example: 192.168.1.100)
            const response = await fetch('http://192.168.1.100:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert("Success", "Login successful!");
                setUsername("");
                setPassword("");
                router.replace("/home-dashboard");
            } else {
                setError(data.message || "Invalid username or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const authenticateWithBiometrics = async () => {
        try {
            setIsAuthenticating(true);
            setError(null);

            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate to access SmartChild",
                fallbackLabel: "Use PIN instead",
            });

            if (authResult.success) {
                // For demo purposes, we'll simulate a successful login
                // In a real app, you would verify biometrics with your backend
                Alert.alert("Success", "Authentication successful!");
                router.replace("/home-dashboard");
            } else {
                setError("Authentication failed. Please try again.");
            }
        } catch (error) {
            console.error("Biometric auth error:", error);
            setError("Authentication error. Please try again.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handlePinSubmit = () => {
        // Simple PIN validation - in a real app, verify with backend
        if (pin === '1234') {
            setPinVisible(false);
            router.replace("/home-dashboard");
        } else {
            Alert.alert("Error", "Incorrect PIN. Please try again.");
            setPin('');
        }
    };

    return (
        <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="medkit" size={80} color={"white"} />
                    </View>
                    <Text style={styles.title}>SMART CHILD</Text>
                    <Text style={styles.subtitle}>Child Personal Medication Reminder</Text>
                    
                    <View style={styles.card}>
                        <Text style={styles.welcomeText}>Welcome</Text>
                        <Text style={styles.instructionText}>
                            Please login to access your medication reminders
                        </Text>

                        {loginMode ? (
                            <>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                    />
                                </View>
                                
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                                    onPress={handleLogin}
                                    disabled={isAuthenticating}
                                >
                                    {isAuthenticating ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="log-in" size={20} color="white" style={styles.buttonIcon} />
                                            <Text style={styles.buttonText}>Login</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {hasBiometrics && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.bioButton, isAuthenticating && styles.buttonDisabled]}
                                        onPress={authenticateWithBiometrics}
                                        disabled={isAuthenticating}
                                    >
                                        <Ionicons name="finger-print" size={20} color="white" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>Use Biometrics</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity 
                                    style={styles.switchModeButton}
                                    onPress={() => setLoginMode(false)}
                                >
                                    <Text style={styles.switchModeText}>Use PIN instead</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.pinInstruction}>Enter your 4-digit PIN</Text>
                                <TextInput
                                    style={styles.pinInput}
                                    value={pin}
                                    onChangeText={setPin}
                                    keyboardType="numeric"
                                    secureTextEntry
                                    maxLength={4}
                                    textAlign="center"
                                />
                                
                                <TouchableOpacity
                                    style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                                    onPress={handlePinSubmit}
                                    disabled={isAuthenticating}
                                >
                                    <Ionicons name="key" size={20} color="white" style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Submit PIN</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.switchModeButton}
                                    onPress={() => setLoginMode(true)}
                                >
                                    <Text style={styles.switchModeText}>Use Login instead</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={"#f44336"} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* PIN Entry Modal - keeping as backup */}
            <Modal visible={pinVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Your PIN</Text>
                        <TextInput
                            style={styles.modalPinInput}
                            secureTextEntry
                            keyboardType="numeric"
                            value={pin}
                            onChangeText={setPin}
                            maxLength={4}
                            textAlign="center"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setPinVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalButton}
                                onPress={handlePinSubmit}
                            >
                                <Text style={styles.modalButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: 40,
        textAlign: "center",
    },
    card: {
        borderRadius: 20,
        padding: 25,
        width: width - 40,
        alignItems: "center",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 25,
        textAlign: "center",
    },
    pinInstruction: {
        fontSize: 16,
        color: "#666",
        marginBottom: 15,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
    },
    pinInput: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 10,
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#4CAF50",
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 30,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginBottom: 15,
    },
    bioButton: {
        backgroundColor: "#2196F3",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    switchModeButton: {
        marginTop: 10,
    },
    switchModeText: {
        color: "#4CAF50",
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        padding: 10,
        backgroundColor: "#ffebee",
        borderRadius: 8,
        width: '100%',
    },
    errorText: {
        color: "#f44336",
        fontSize: 14,
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: "bold",
    },
    modalPinInput: {
        borderWidth: 1,
        borderColor: "#4CAF50",
        borderRadius: 10,
        width: "100%",
        height: 50,
        fontSize: 24,
        textAlign: "center",
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
        marginHorizontal: 5,
    },
    modalCancelButton: {
        backgroundColor: "#f44336",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
    },
});